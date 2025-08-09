export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { first, run } from "@/app/lib/db";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  let data: any = {}; try { data = JSON.parse(raw); } catch {}
  // Пытаемся вытащить номер заказа и статус из разных возможных полей
  const orderNumber = data?.payment_order_number || data?.merchant_order_id || data?.order_id || data?.order?.number;
  const status = (data?.status || data?.payment_status || "").toString().toLowerCase();

  if (!orderNumber) return new Response("no order id", { status:400 });

  const o = await first("SELECT id FROM orders WHERE number=?", orderNumber);
  if (!o) return new Response("no such order", { status:404 });

  let newStatus: string | null = null;
  if (["success","paid","succeeded"].includes(status)) newStatus = "paid";
  if (["failed","cancelled","canceled"].includes(status)) newStatus = "failed";

  if (newStatus) {
    const now = new Date().toISOString();
    await run("UPDATE orders SET status=?, status_updated_at=?, paid_at=CASE WHEN ?='paid' THEN ? ELSE paid_at END WHERE id=?",
      newStatus, now, newStatus, now, o.id);
  }
  return NextResponse.json({ ok:true });
}
