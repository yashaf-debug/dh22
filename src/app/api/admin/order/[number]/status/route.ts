export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { first, run } from "@/app/lib/db";

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

  if (!ALLOWED.has(to)) {
    return NextResponse.json({ ok:false, error:"bad_status" }, { status: 400 });
  }

  const o: any = await first("SELECT id, status, payment_method, paid_at FROM orders WHERE number = ?", params.number);
  if (!o) return NextResponse.json({ ok:false, error:"not_found" }, { status: 404 });

  const from = String(o.status || "");
  if (from === to) return NextResponse.json({ ok:true, status: to });

  const now = new Date().toISOString();

  // Опциональная логика: при переводе в paid — фиксируем paid_at, если пусто
  await run(
    `UPDATE orders
       SET status = ?,
           status_updated_at = ?,
           paid_at = CASE WHEN ?='paid' AND (paid_at IS NULL OR paid_at='') THEN ? ELSE paid_at END
     WHERE id = ?`,
    to, now, to, now, o.id
  );

  await run(
    `INSERT INTO order_history (order_id, from_status, to_status, actor)
     VALUES (?,?,?,?)`,
    o.id, from, to, "admin"
  );

  return NextResponse.json({ ok:true, status: to });
}

