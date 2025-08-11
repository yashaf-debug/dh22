export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { first, run } from "@/app/lib/db";

// отправка сообщения клиенту
async function tgSend(chatId: string | number, text: string) {
  const BOT = process.env.TELEGRAM_BOT_TOKEN || "";
  if (!BOT) return;
  await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true })
  });
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  let update: any = null;
  try { update = JSON.parse(raw); } catch { return NextResponse.json({ ok:true }); }

  const msg = update?.message || update?.edited_message || null;
  const chatId = msg?.chat?.id ? String(msg.chat.id) : null;
  const text = (msg?.text || "").trim();

  if (!chatId) return NextResponse.json({ ok:true });

  // /start ord_<orderNumber>_<token>
  if (text.startsWith("/start")) {
    const payload = text.replace("/start", "").trim();
    const m = payload.match(/^ord_(.+)_(.+)$/);
    if (m) {
      const orderNumber = m[1];
      const token = m[2];

      const row = await first("SELECT order_number FROM tg_tokens WHERE token=? AND order_number=?", token, orderNumber);
      if (row) {
        await run("UPDATE orders SET customer_tg_chat_id=? WHERE number=?", chatId, orderNumber);
        await tgSend(chatId, [
          `🔔 <b>DH22</b>`,
          `Подписка на уведомления по заказу <b>${orderNumber}</b> оформлена.`,
          `Мы сообщим об оплате, передаче в доставку и получении.`
        ].join("\n"));
        return NextResponse.json({ ok:true });
      }
    }
    // нет валидного payload — просто приветствие
    await tgSend(chatId, `Привет! Это бот DH22. Оформите заказ на сайте и нажмите «Подписаться в Telegram» на странице «Спасибо».`);
    return NextResponse.json({ ok:true });
  }

  // /stop — отписка: обнулим у всех заказов с этим chat_id
  if (text === "/stop") {
    await run("UPDATE orders SET customer_tg_chat_id=NULL WHERE customer_tg_chat_id=?", chatId);
    await tgSend(chatId, `Вы отписались от уведомлений DH22.`);
    return NextResponse.json({ ok:true });
  }

  return NextResponse.json({ ok:true });
}

