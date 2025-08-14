export const runtime = 'edge';
import * as Sentry from '@sentry/nextjs';
import { run, first, all } from "@/app/lib/db";
import { insertOrder, insertItem, byNumber } from "@/app/lib/sql";
import { ensureOrdersTables } from "@/app/lib/init";
import { notifyOrderCreated } from "@/app/lib/notify";
import { verifyTurnstile } from '@/lib/turnstile';
import { logEvent } from '@/lib/logs';

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
    const token = String(body.cf_turnstile_token || '');
    const ip = req.headers.get('cf-connecting-ip') || undefined;
    const ok = await verifyTurnstile(token, ip);
    if (!ok) return bad('Turnstile failed', 400);

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

    const itemsWithIds = [];
    for (const it of items) {
      const p = await first("SELECT id, name, quantity FROM products WHERE slug=?", it.slug);
      if (!p || p.quantity < it.qty) {
        return new Response(
          JSON.stringify({ ok: false, error: "no_stock", detail: { product_id: p?.id, available: p?.quantity || 0 } }),
          { status: 409, headers: { "content-type": "application/json" } }
        );
      }
      itemsWithIds.push({ ...it, product_id: p.id });
    }

    const number = "DH22-" + Date.now().toString(36).toUpperCase();
    await run(
      insertOrder,
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
    );

    const order = await first(byNumber, number);
    for (const i of items) {
      await run(insertItem, order.id, i.slug, i.name, i.price, i.qty, i.image);
    }

    for (const it of itemsWithIds) {
      await run("UPDATE products SET quantity = quantity - ? WHERE id=?", it.qty, it.product_id);
    }

    try {
      const createdOrder = await first(byNumber, number);
      const createdItems = await all("SELECT name, qty, price FROM order_items WHERE order_id=?", createdOrder.id);
      await notifyOrderCreated(createdOrder, createdItems);
    } catch {}

    await logEvent('info','checkout','order-created',{ orderId: order.id, orderNumber: number, total: amount_total });

    return new Response(
      JSON.stringify({ ok: true, orderNumber: number, orderId: order.id }),
      { headers: { "content-type": "application/json" } }
    );
  } catch (e) {
    Sentry.captureException(e);
    await logEvent('error','checkout','exception',{ error: String(e) });
    return bad(`D1_ERROR: ${e.message || "Ошибка создания заказа"}`, 500);
  }
}
