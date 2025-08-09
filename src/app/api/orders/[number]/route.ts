export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { first, all, run } from "@/app/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { number: string } }) {
  const o = await first("SELECT * FROM orders WHERE number=?", params.number);
  if (!o) return NextResponse.json({ ok:false, error:"not_found" }, { status:404 });
  const items = await all("SELECT slug,name,price,qty,image FROM order_items WHERE order_id=?", o.id);
  return NextResponse.json({ ok:true, order:o, items });
}

export async function PATCH(req: NextRequest, { params }: { params: { number: string } }) {
  const body = await req.json();
  const o = await first("SELECT id FROM orders WHERE number=?", params.number);
  if (!o) return NextResponse.json({ ok:false, error:"not_found" }, { status:404 });

  // Разрешённые поля для апдейта
  const fields: Record<string, any> = {};
  ["pay_link","cdek_order_id","cdek_access_key","status","paid_at","status_updated_at"].forEach(k=>{
    if (body[k] !== undefined) fields[k] = body[k];
  });
  const sets = Object.keys(fields).map(k => `${k}=?`).join(", ");
  const vals = Object.values(fields);
  if (!sets) return NextResponse.json({ ok:true });

  await run(`UPDATE orders SET ${sets} WHERE id=?`, ...vals, o.id);
  return NextResponse.json({ ok:true });
}
