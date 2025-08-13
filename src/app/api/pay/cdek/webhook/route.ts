export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { first, all, run } from "@/app/lib/db";
import { notifyOrderPaid } from "@/app/lib/notify";
import { cdekSignature } from "@/app/lib/cdek/signature";

/** Простой логгер вебхуков (если у тебя уже есть — можешь сохранить свой) */
async function logWebhook(path: string, headersObj: any, body: any) {
  try {
    await run(
      "INSERT INTO webhook_logs (path, headers, body) VALUES (?,?,?)",
      path,
      JSON.stringify(headersObj),
      typeof body === "string" ? body : JSON.stringify(body)
    );
  } catch {}
}

export async function POST(req: NextRequest) {
  const raw = await req.text(); // сохраняем «как есть» на всякий случай
  let body: any = null;
  try { body = JSON.parse(raw); } catch { body = raw; }

  // лог
  const headersObj: any = {};
  req.headers.forEach((v, k) => (headersObj[k] = v));
  await logWebhook("/api/pay/cdek/webhook", headersObj, body);

  // ожидаем payload вида { payment: { order_id, access_key, pay_amount, ... }, signature: ... }
  const payment = (body && body.payment) ? body.payment : null;
  const signature = typeof body?.signature === "string" ? body.signature : "";
  const cdek_order_id = payment?.order_id ? String(payment.order_id) : null;

  if (!cdek_order_id) {
    return NextResponse.json({ ok:false, error:"no_order_id" }, { status: 200 });
  }

  const { env } = getRequestContext();
  const secret = env.CDEK_PAY_SECRET || "";
  if (!secret || !payment || !signature) {
    return NextResponse.json({ ok:false, error:"bad_signature" }, { status: 200 });
  }
  const expected = await cdekSignature(payment, secret);
  if (expected !== signature) {
    return NextResponse.json({ ok:false, error:"signature_mismatch" }, { status: 200 });
  }

  // наш заказ ищем по сохранённому ранее cdek_order_id (мы его кладём при создании payment link)
  const order: any = await first("SELECT * FROM orders WHERE cdek_order_id=?", cdek_order_id);
  if (!order) {
    return NextResponse.json({ ok:false, error:"order_not_found" }, { status: 200 });
  }

  // если уже оплачен — просто подтверждаем
  if (order.status === "paid") {
    return NextResponse.json({ ok:true, status:"already_paid" }, { status: 200 });
  }

  // помечаем оплаченным
  const now = new Date().toISOString();
  await run(
    `UPDATE orders
       SET status='paid', paid_at=?, status_updated_at=?
     WHERE id=?`,
    now, now, order.id
  );
  await run(
    `INSERT INTO order_history (order_id, from_status, to_status, actor)
     VALUES (?,?,?,'webhook')`,
    order.id, order.status, "paid"
  );

  // пришлём уведомления
  const items = await all("SELECT name, qty, price FROM order_items WHERE order_id=?", order.id);
  const fresh = await first("SELECT * FROM orders WHERE id=?", order.id);
  await notifyOrderPaid(fresh, items);

  return NextResponse.json({ ok:true, status:"paid" }, { status: 200 });
}
