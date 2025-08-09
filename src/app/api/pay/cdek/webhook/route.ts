export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { first, run } from "@/app/lib/db";

function h(h: Headers) {
  const o: Record<string, string> = {};
  h.forEach((v, k) => (o[k.toLowerCase()] = v));
  return o;
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const headers = h(req.headers);
  // 1) лог в D1
  await run(
    "INSERT INTO webhook_logs (path, headers, body) VALUES (?,?,?)",
    "/api/pay/cdek/webhook",
    JSON.stringify(headers),
    raw
  );

  // 2) попытка распарсить
  let data: any = {};
  try {
    data = JSON.parse(raw);
  } catch {}

  // 3) пытаемся вытащить номер заказа и статус из разных возможных полей
  const orderNumber =
    data?.payment_order_number ||
    data?.merchant_order_id ||
    data?.order_id ||
    data?.order?.number ||
    data?.payment?.order_number ||
    data?.meta?.order_number ||
    null;

  const status = String(
    data?.status ??
      data?.payment_status ??
      data?.payment?.status ??
      ""
  ).toLowerCase();

  if (!orderNumber) return new Response("no order id", { status: 200 });

  const o = await first("SELECT id FROM orders WHERE number=?", orderNumber);
  if (!o) return new Response("no such order", { status: 200 });

  let newStatus: string | null = null;
  if (["success", "succeeded", "paid"].includes(status)) newStatus = "paid";
  if (["failed", "cancelled", "canceled"].includes(status)) newStatus = "failed";

  if (newStatus) {
    const now = new Date().toISOString();
    await run(
      "UPDATE orders SET status=?, status_updated_at=?, paid_at=CASE WHEN ?='paid' THEN ? ELSE paid_at END WHERE id=?",
      newStatus,
      now,
      newStatus,
      now,
      o.id
    );
  }

  return NextResponse.json({ ok: true });
}

