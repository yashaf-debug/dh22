export const runtime = "edge";

import { headers } from "next/headers";

/** Базовый URL (для ссылок в письмах/ТГ) */
export function publicBaseUrl() {
  const h = headers();
  return (
    process.env.PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    `${h.get("x-forwarded-proto") || "https"}://${h.get("host")}`
  );
}

export function rub(kop: number | string) {
  const v = Number(kop || 0) / 100;
  return `${v.toFixed(2)} ₽`;
}

async function safeFetch(url: string, init: RequestInit) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 10000);
  try {
    return await fetch(url, { ...init, signal: ctl.signal });
  } finally {
    clearTimeout(t);
  }
}

/** Telegram */
export async function notifyTelegram(text: string) {
  const BOT = process.env.TELEGRAM_BOT_TOKEN || "";
  const CHAT = process.env.TELEGRAM_CHAT_ID || "";
  if (!BOT || !CHAT) return { ok: false, skipped: true };
  const r = await safeFetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT, text, parse_mode: "HTML", disable_web_page_preview: true })
  });
  const j = await r.json().catch(()=>({ ok:false }));
  return j;
}

/** Email через Resend REST (Edge-совместимо) */
export async function notifyEmail(to: string, subject: string, html: string) {
  const API = process.env.RESEND_API_KEY || "";
  const FROM = process.env.EMAIL_FROM || "DH22 <no-reply@dh22.ru>";
  if (!API || !to) return { ok: false, skipped: true };

  const payload: any = { from: FROM, to: [to], subject, html };
  const bcc = (process.env.EMAIL_BCC_ADMIN || "").trim();
  if (bcc) payload.bcc = [bcc];

  const r = await safeFetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "authorization": `Bearer ${API}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const j = await r.json().catch(()=>({ ok:false }));
  return j;
}

/** HTML письма */
export function orderEmailHtml(params: {
  title: string;
  preheader?: string;
  order: any;
  items: Array<{ name: string; qty: number; price: number }>;
}) {
  const { title, preheader = "", order, items } = params;
  const total = rub(order?.amount_total || 0);
  const delivery = rub(order?.delivery_price || 0);
  const rows = items.map(i => `
    <tr>
      <td style="padding:8px 0">${i.name} × ${i.qty}</td>
      <td style="padding:8px 0; text-align:right">${rub(i.price)}</td>
    </tr>
  `).join("");

  const deliveryBlock = `
    <p><b>Доставка:</b> ${order?.delivery_method || "—"} ${order?.delivery_pvz_name ? "• " + order.delivery_pvz_name : ""} ${order?.delivery_address ? "• " + order.delivery_address : ""} ${order?.delivery_eta ? "• " + order.delivery_eta : ""}</p>
    <p><b>Стоимость доставки:</b> ${delivery}</p>
  `;

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${title}</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111;margin:0;padding:0;background:#f6f6f6}
  .wrap{max-width:640px;margin:0 auto;padding:24px}
  .card{background:#fff;border-radius:12px;padding:24px}
  .muted{opacity:.7}
  .total{font-size:18px;font-weight:600}
  a.btn{display:inline-block;background:#111;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px}
</style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="muted" style="font-size:12px">${preheader}</div>
      <h2 style="margin:8px 0 0">${title}</h2>
      <div class="muted" style="margin-top:6px">Номер заказа: <b>${order?.number}</b></div>

      <hr style="margin:16px 0;border:none;border-top:1px solid #eee">

      <table style="width:100%;border-collapse:collapse">${rows}</table>

      <hr style="margin:16px 0;border:none;border-top:1px solid #eee">

      ${deliveryBlock}

      <p class="total">Итого к оплате: ${total}</p>

      <p class="muted">Покупатель: ${order?.customer_name || "—"} • ${order?.customer_phone || "—"} • ${order?.customer_email || "—"}</p>
    </div>
    <p class="muted" style="text-align:center;margin-top:12px">${process.env.SITE_TITLE || "DH22"} • ${publicBaseUrl()}</p>
  </div>
</body></html>`;
}

/** Специализированные уведомления */

export async function notifyOrderCreated(order: any, items: any[]) {
  const site = process.env.SITE_TITLE || "DH22";
  const subject = `${site}: заказ ${order.number} создан`;
  const html = orderEmailHtml({
    title: "Спасибо! Ваш заказ создан",
    preheader: "Мы зарезервировали товары и ждём оплату (если выбран онлайн).",
    order, items
  });
  if (order?.customer_email) {
    await notifyEmail(order.customer_email, subject, html);
  }
  const text = [
    `🆕 Новый заказ ${order.number}`,
    `Сумма: ${rub(order.amount_total)}${order.delivery_price?` (включая доставку ${rub(order.delivery_price)})`:""}`,
    `Оплата: ${order.payment_method || "—"}`,
    `Доставка: ${order.delivery_method || "—"} ${order.delivery_pvz_name ? "• " + order.delivery_pvz_name : ""} ${order.delivery_address ? "• " + order.delivery_address : ""}`,
    `Клиент: ${order.customer_name || "—"} • ${order.customer_phone || "—"} • ${order.customer_email || "—"}`
  ].join("\n");
  await notifyTelegram(text);
}

export async function notifyOrderPaid(order: any, items: any[]) {
  const site = process.env.SITE_TITLE || "DH22";
  const subject = `${site}: оплата за заказ ${order.number} получена`;
  const html = orderEmailHtml({
    title: "Оплата получена — собираем ваш заказ",
    preheader: "Мы подтвердили оплату. Скоро передадим в доставку.",
    order, items
  });
  if (order?.customer_email) {
    await notifyEmail(order.customer_email, subject, html);
  }
  const text = [
    `✅ Оплата зафиксирована ${order.number}`,
    `Сумма: ${rub(order.amount_total)}`,
    `Доставка: ${order.delivery_method || "—"} ${order.delivery_pvz_name ? "• " + order.delivery_pvz_name : ""} ${order.delivery_address ? "• " + order.delivery_address : ""}`,
    `Клиент: ${order.customer_name || "—"} • ${order.customer_phone || "—"}`
  ].join("\n");
  await notifyTelegram(text);
}

