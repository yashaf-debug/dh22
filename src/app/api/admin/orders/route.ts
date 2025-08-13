export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { all } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = req.headers.get("authorization")?.split(" ")[1] || "";
  if (token !== (process.env.ADMIN_TOKEN || "")) {
    return NextResponse.json({ ok:false, error:"forbidden" }, { status: 403 });
  }
  const q = (url.searchParams.get("q") || "").trim();
  const status = (url.searchParams.get("status") || "").trim();
  const limit = Math.max(1, Math.min(500, Number(url.searchParams.get("limit") || 100)));

  const conds: string[] = [];
  const args: any[] = [];

  if (status) { conds.push("status = ?"); args.push(status); }
  if (q) {
    const like = `%${q}%`;
    conds.push("(number LIKE ? OR customer_phone LIKE ? OR customer_email LIKE ?)");
    args.push(like, like, like);
  }
  const where = conds.length ? ("WHERE " + conds.join(" AND ")) : "";

  const rows = await all(
    `
    SELECT id, number, status, amount_total, payment_method,
           customer_name, customer_phone, customer_email,
           delivery_method, delivery_price, created_at
    FROM orders
    ${where}
    ORDER BY id DESC
    LIMIT ?
    `,
    ...args, limit
  );

  return NextResponse.json({ ok:true, items: rows });
}
