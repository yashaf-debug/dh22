export const runtime = 'edge';
import * as Sentry from '@sentry/nextjs';
import { first, all } from "@/app/lib/db";
import { byNumber } from "@/app/lib/sql";
import { ensureOrdersTables } from "@/app/lib/init";
import { notifyOrderCreated } from "@/app/lib/notify";
import { verifyTurnstile } from '@/lib/turnstile';
import { logEvent } from '@/lib/logs';
import { getRequestContext } from '@cloudflare/next-on-pages';

function bad(msg, code=400){
  return new Response(
    JSON.stringify({ ok:false, error:msg }),
    { status:code, headers:{'content-type':'application/json'} }
  );
}

export async function POST(req) {
  try {
    await ensureOrdersTables();
    const body = await req.json();
    const token = body["cf-turnstile-response"] || body.turnstileToken || body.cf_turnstile_token;
    const ip = req.headers.get('cf-connecting-ip');
    const vr = await verifyTurnstile(process.env, token, ip);
    if (!vr.ok) {
      if (process.env.TURNSTILE_STRICT === "1") return bad('Turnstile failed', 400);
      console.warn('Turnstile soft-fail:', vr);
    }

    const { customer, items } = body;
    const delivery = body.delivery || {};
    const payment_method = body.payment_method === "cod" ? "cod" : "online";
    const initialStatus = payment_method === "cod" ? "awaiting_payment" : "new";

    if (!customer?.name || !customer?.phone || !customer?.email) return bad("Некорректные данные покупателя");
    if (!Array.isArray(items) || items.length === 0) return bad("Пустая корзина");
    const allowed = ["same_day_msk","cdek_courier","cdek_pvz"];
    const method = allowed.includes(delivery.method) ? delivery.method : "cdek_pvz";

    const delivery_price = Math.max(0, Math.round(delivery.price_kop || 0));
    const delivery_city = (delivery.city || "").trim();
    const delivery_address = (delivery.address || "").trim();
    const delivery_pvz_code = delivery.pvz_code || "";
    const delivery_pvz_name = delivery.pvz_name || "";
    const delivery_eta = delivery.eta || "";
    const items_total = items.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0);
    const amount_total = items_total + delivery_price;
    if (amount_total <= 0) return bad("Сумма заказа некорректна");

    const variantIds = items.map(i => i.variantId);
    if (!variantIds.length) return bad("Пустая корзина");
    const placeholders = variantIds.map(() => '?').join(',');
    const db = getRequestContext().env.DH22_DB;
    const stocksRes = await db
      .prepare(`SELECT id, product_id, stock FROM product_variants WHERE id IN (${placeholders})`)
      .bind(...variantIds)
      .all();
    const stockMap = new Map(stocksRes.results.map(r => [r.id, r]));
    for (const it of items) {
      const info = stockMap.get(it.variantId);
      if (!info || info.stock < it.qty) {
        return new Response(
          JSON.stringify({ ok: false, error: "no_stock", detail: { variant_id: it.variantId, available: info?.stock || 0 } }),
          { status: 400, headers: { "content-type": "application/json" } }
        );
      }
    }

    const number = "DH22-" + Date.now().toString(36).toUpperCase();
    const stmts = [];
    stmts.push(
      db
        .prepare(
          `INSERT INTO orders (number, status, customer_name, customer_phone, customer_email, delivery_method, delivery_type, delivery_city,
                                delivery_address, delivery_pvz_code, delivery_pvz_name, delivery_price, delivery_eta, amount_total, currency, notes, payment_method)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'RUB', ?, ?)`
        )
        .bind(
          number,
          initialStatus,
          customer.name,
          customer.phone,
          customer.email,
          method,
          method,
          delivery_city,
          delivery_address,
          delivery_pvz_code,
          delivery_pvz_name,
          delivery_price,
          delivery_eta,
          amount_total,
          body.notes || "",
          payment_method
        )
    );

    for (const it of items) {
      stmts.push(
        db
          .prepare(
            `INSERT INTO order_items (order_id, slug, name, price, qty, image)
             VALUES (last_insert_rowid(), ?, ?, ?, ?, ?)`
          )
          .bind(it.slug, it.name, it.price, it.qty, it.image)
      );

      stmts.push(
        db
          .prepare(
            `UPDATE product_variants SET stock = stock - ? WHERE id = ? AND stock >= ?`
          )
          .bind(it.qty, it.variantId, it.qty)
      );
    }

    stmts.push(db.prepare(`SELECT last_insert_rowid() AS id`));
    const results = await db.batch(stmts);
    const orderId = results[results.length - 1]?.results?.[0]?.id;

    try {
      const createdOrder = await first(byNumber, number);
      const createdItems = await all("SELECT name, qty, price FROM order_items WHERE order_id=?", orderId);
      await notifyOrderCreated(createdOrder, createdItems);
    } catch {}

    await logEvent('info','checkout','order-created',{ orderId, orderNumber: number, total: amount_total });

    return new Response(
      JSON.stringify({ ok: true, orderNumber: number, orderId }),
      { headers: { "content-type": "application/json" } }
    );
  } catch (e) {
    Sentry.captureException(e);
    await logEvent('error','checkout','exception',{ error: String(e) });
    return bad(`D1_ERROR: ${e.message || "Ошибка создания заказа"}`, 500);
  }
}
