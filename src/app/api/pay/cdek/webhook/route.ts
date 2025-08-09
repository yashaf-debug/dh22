export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { first, run } from "@/app/lib/db";

function h(hd: Headers) {
  const o: Record<string, string> = {};
  hd.forEach((v, k) => (o[k.toLowerCase()] = v));
  return o;
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const headers = h(req.headers);

  // 1) лог для отладки
  await run(
    "INSERT INTO webhook_logs (path, headers, body) VALUES (?,?,?)",
    "/api/pay/cdek/webhook",
    JSON.stringify(headers),
    raw
  );

  // 2) парсим тело
  let data: any = {};
  try { data = JSON.parse(raw); } catch {}

  // то, что реально присылает CDEK Pay в вашем аккаунте
  const cdekOrderId = data?.payment?.order_id ?? data?.order_id ?? null;
  const accessKey   = data?.payment?.access_key ?? data?.access_key ?? null;

  // если вдруг где-то появляется явный статус — тоже обрабатываем
  const status = String(
    data?.status ??
    data?.payment_status ??
    data?.payment?.status ??
    ""
  ).toLowerCase();

  // 3) находим заказ
  let order: any = null;
  if (cdekOrderId) {
    order = await first("SELECT id FROM orders WHERE cdek_order_id=?", String(cdekOrderId));
  }
  if (!order && accessKey) {
    order = await first("SELECT id FROM orders WHERE cdek_access_key=?", String(accessKey));
  }
  // fallback: иногда access_key содержится в pay_link
  if (!order && accessKey) {
    order = await first("SELECT id FROM orders WHERE pay_link LIKE ?", `%${accessKey}%`);
  }

  if (!order) {
    // не нашли — подтверждаем приём, чтобы CDEK не ретраил
    return NextResponse.json({ ok: true, matched: false });
  }

  // 4) определяем новый статус
  let newStatus: string | null = null;
  if (["success", "succeeded", "paid"].includes(status)) newStatus = "paid";
  if (["failed", "cancelled", "canceled"].includes(status)) newStatus = "failed";

  // Fallback: у вас вебхук приходит без status — считаем его успешной оплатой,
  // если есть объект payment и сумма > 0
  if (!newStatus && data?.payment && Number(data?.payment?.pay_amount) > 0) {
    newStatus = "paid";
  }

  if (newStatus) {
    const now = new Date().toISOString();
    await run(
      "UPDATE orders SET status=?, status_updated_at=?, paid_at=CASE WHEN ?='paid' THEN ? ELSE paid_at END WHERE id=?",
      newStatus, now, newStatus, now, order.id
    );
  }

  return NextResponse.json({ ok: true, matched: true, set: newStatus || "noop" });
}
