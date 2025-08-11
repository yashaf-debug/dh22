export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { first, run, all } from "@/app/lib/db";
import { notifyOrderPaid, notifyOrderCanceled, notifyOrderShipped } from "@/app/lib/notify";

const ALLOWED = new Set([
  "new","awaiting_payment","paid","packed","shipped","delivered","canceled","refunded"
]);

export async function PATCH(req: NextRequest, { params }: { params: { number: string } }) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  if (token !== (process.env.ADMIN_TOKEN || "")) {
    return NextResponse.json({ ok:false, error:"forbidden" }, { status: 403 });
  }

  let body: any = {};
  try { body = await req.json(); } catch {}
  const to = String(body?.status || "").trim();
  const tracking = (body?.tracking ?? "").toString().trim(); // опционально

  if (!ALLOWED.has(to)) {
    return NextResponse.json({ ok:false, error:"bad_status" }, { status: 400 });
  }

  const o: any = await first("SELECT * FROM orders WHERE number = ?", params.number);
  if (!o) return NextResponse.json({ ok:false, error:"not_found" }, { status: 404 });

  const from = String(o.status || "");
  if (from === to && !tracking) return NextResponse.json({ ok:true, status: to });

  const now = new Date().toISOString();

  // обновляем статус + при shipped — сохраняем tracking, если пришёл
  if (to === "shipped" && tracking) {
    await run(
      `UPDATE orders
         SET status=?, status_updated_at=?, cdek_tracking_number=?
       WHERE id=?`,
      to, now, tracking, o.id
    );
  } else {
    await run(
      `UPDATE orders
         SET status=?, status_updated_at=?
       WHERE id=?`,
      to, now, o.id
    );
  }

  await run(
    `INSERT INTO order_history (order_id, from_status, to_status, actor)
     VALUES (?,?,?,'admin')`,
    o.id, from, to
  );

  // перечитываем свежие данные
  const fresh: any = await first("SELECT * FROM orders WHERE id=?", o.id);
  const items = await all("SELECT name, qty, price FROM order_items WHERE order_id=?", o.id);

  // Уведомления по требованиям:
  if (to === "paid") {
    // это может быть ручная оплата при COD — шлём как при оплате
    await notifyOrderPaid(fresh, items);
  }
  if (to === "shipped") {
    await notifyOrderShipped(fresh);
  }
  if (to === "canceled") {
    await notifyOrderCanceled(fresh);
  }

  return NextResponse.json({ ok:true, status: to, tracking_saved: Boolean(tracking) });
}
