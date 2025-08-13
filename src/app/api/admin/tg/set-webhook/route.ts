export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const token = req.headers.get("authorization")?.split(" ")[1] || "";
  if (token !== (process.env.ADMIN_TOKEN || "")) {
    return NextResponse.json({ ok:false, error:"forbidden" }, { status: 403 });
  }
  const BOT = process.env.TELEGRAM_BOT_TOKEN || "";
  if (!BOT) return NextResponse.json({ ok:false, error:"no_bot" }, { status: 500 });

  const webhook = `${url.origin}/api/tg/webhook`;
  const r = await fetch(`https://api.telegram.org/bot${BOT}/setWebhook?url=${encodeURIComponent(webhook)}`);
  const j = await r.json().catch(()=>({ ok:false }));
  return NextResponse.json(j);
}
