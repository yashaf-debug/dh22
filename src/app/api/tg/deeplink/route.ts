export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { first, run } from "@/app/lib/db";
import { headers } from "next/headers";

function baseUrl() {
  const h = headers();
  return (
    process.env.PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    `${h.get("x-forwarded-proto") || "https"}://${h.get("host")}`
  );
}

function makeToken() {
  // короткий токен для start-параметра
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const order = (url.searchParams.get("o") || "").trim();
  if (!order) return NextResponse.json({ ok:false, error:"order_required" }, { status: 400 });

  // если уже есть токен — переиспользуем
  let row = await first("SELECT token FROM tg_tokens WHERE order_number=?", order);
  if (!row) {
    const token = makeToken();
    await run("INSERT INTO tg_tokens (token, order_number) VALUES (?,?)", token, order);
    row = { token };
  }

  const bot = (process.env.TELEGRAM_CLIENT_BOT || "").replace(/^@/, "");
  if (!bot) return NextResponse.json({ ok:false, error:"bot_not_configured" }, { status: 500 });

  const deep = `https://t.me/${bot}?start=${encodeURIComponent(`ord_${order}_${row.token}`)}`;
  return NextResponse.json({ ok:true, url: deep, web: baseUrl() });
}

