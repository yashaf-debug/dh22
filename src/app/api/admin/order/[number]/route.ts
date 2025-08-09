export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { first, all } from "@/app/lib/db";

export async function GET(req: NextRequest, { params }: { params: { number: string } }) {
  const token = new URL(req.url).searchParams.get("token") || "";
  if (token !== (process.env.ADMIN_TOKEN || "")) return NextResponse.json({ ok:false }, { status: 403 });

  const o = await first("SELECT * FROM orders WHERE number=?", params.number);
  if (!o) return NextResponse.json({ ok:false, error:"not_found" }, { status:404 });
  const items = await all("SELECT slug,name,price,qty,image FROM order_items WHERE order_id=?", o.id);
  return NextResponse.json({ ok:true, order:o, items });
}
