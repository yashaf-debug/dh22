export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { notifyTelegram, notifyEmail, orderEmailHtml } from "@/app/lib/notify";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1] || "";
  if (token !== (process.env.ADMIN_TOKEN || "")) {
    return NextResponse.json({ ok:false, error:"forbidden" }, { status: 403 });
  }

  const tg = await notifyTelegram("🔔 Тест уведомлений DH22: Telegram работает");
  const html = orderEmailHtml({
    title: "Тест DH22 — письмо доставлено",
    preheader: "Это проверка e-mail канала.",
    order: { number: "TEST-ORDER", amount_total: 12345, delivery_price: 0, customer_name: "Test", customer_phone: "+7", customer_email: "" },
    items: [{ name: "Проверка товара", qty: 1, price: 12345 }]
  });
  const em = await notifyEmail(process.env.EMAIL_BCC_ADMIN || "", "DH22: тестовое письмо", html);

  return NextResponse.json({ ok:true, telegram: tg, email: em });
}
