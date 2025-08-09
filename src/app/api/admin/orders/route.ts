export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { all } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token") || "";
  if (token !== (process.env.ADMIN_TOKEN || "")) return NextResponse.json([], { status:200 });
  const rows = await all("SELECT number, status, customer_name, customer_phone, amount_total, payment_method FROM orders ORDER BY id DESC LIMIT 100");
  return NextResponse.json(rows);
}
