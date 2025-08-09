export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { first, run } from "@/app/lib/db";

function h(hd: Headers) {
  const o: Record<string,string> = {};
  hd.forEach((v,k)=> o[k.toLowerCase()] = v);
  return o;
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const headers = h(req.headers);

  // 1) лог — чтобы всегда видеть, что пришло
  await run(
    "INSERT INTO webhook_logs (path, headers, body) VALUES (?,?,?)",
    "/api/pay/cdek/webhook",
    JSON.stringify(headers),
    raw
  );

  // 2) парсим тело
  let data: any = {};
  try { data = JSON.parse(raw); } catch {}

  // что нам может прислать CDEK
  const orderNumber =
    data?.payment_order_number ||
    data?.merchant_order_id ||
    data?.order?.number ||
    data?.order_id ||
    null;

  const cdekOrderId = data?.payment?.order_id ?? data?.order_id ?? null;
  const accessKey   = data?.payment?.access_key ?? data?.access_key ?? null;
  const status = String(
    data?.status ??
    data?.payment_status ??
    data?.payment?.status ??
    ""
  ).toLowerCase();

  // 3) находим заказ: сперва по номеру, иначе — по cdek_order_id / cdek_access_key
  let order: any = null;
  if (orderNumber) {
    order = await first("SELECT id FROM orders WHERE number=?", orderNumber);
  }
  if (!order && cdekOrderId) {
    order = await first("SELECT id FROM orders WHERE cdek_order_id=?", String(cdekOrderId));
  }
  if (!order && accessKey) {
    order = await first("SELECT id FROM orders WHERE cdek_access_key=?", String(accessKey));
  }

  if (!order) {
    // нет соответствия — просто подтверждаем приём, чтобы CDEK не ретраил без конца
    return NextResponse.json({ ok:true, matched:false });
  }

  let newStatus: string | null = null;
  if (["success","succeeded","paid"].includes(status)) newStatus = "paid";
  if (["failed","cancelled","canceled"].includes(status)) newStatus = "failed";

  if (newStatus) {
    const now = new Date().toISOString();
    await run(
      "UPDATE orders SET status=?, status_updated_at=?, paid_at=CASE WHEN ?='paid' THEN ? ELSE paid_at END WHERE id=?",
      newStatus, now, newStatus, now, order.id
    );
  }

  return NextResponse.json({ ok:true, matched:true, set:newStatus || "noop" });
}
