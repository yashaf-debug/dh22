export const runtime = "edge";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { first, run } from "../../../../lib/db";
import { byNumber, setPaymentId, markStatus } from "../../../../lib/sql";

// Нормализация телефона к E.164 (+7XXXXXXXXXX)
function normalizePhone(raw) {
  if (!raw) return "";
  const digits = String(raw).replace(/\D/g, "");
  // уже начинается с 7 и длина 11 => +7XXXXXXXXXX
  if (digits.length === 11 && digits.startsWith("7")) return `+${digits}`;
  // начинается с 8XXXXXXXXXX => заменим 8 на 7
  if (digits.length === 11 && digits.startsWith("8")) return `+7${digits.slice(1)}`;
  // 10 цифр (без кода страны) => добавим +7
  if (digits.length === 10) return `+7${digits}`;
  // fallback: просто плюс и цифры
  return `+${digits}`;
}

async function hmac256(secret, data) {
  if (!secret) return null;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name:"HMAC", hash:"SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

export async function POST(req) {
  const { env } = getRequestContext();
  const { orderNumber } = await req.json();

  try {
    const order = await first(byNumber, orderNumber);
    if (!order) return new Response(JSON.stringify({ok:false,error:"Заказ не найден"}), {status:404});
    await run(markStatus, "payment_pending", order.id);

    // === Конфиг ===
    const API_BASE = env.CDEK_PAY_API_BASE || "https://api.cdekfin.ru";
    const SHOP_ID  = env.CDEK_PAY_SHOP_ID;
    const API_KEY  = env.CDEK_PAY_API_KEY;
    const SIGN     = env.CDEK_PAY_SIGN_SECRET || "";
    const PUBLIC   = (env.PUBLIC_BASE_URL || "").startsWith("http")
      ? env.PUBLIC_BASE_URL
      : `https://${env.PUBLIC_BASE_URL || "dh22.ru"}`;

    if (!SHOP_ID || !API_KEY) {
      return new Response(JSON.stringify({ok:false, needSetup:true, message:"CDEK Pay не настроен"}), {status:200});
    }

    // === Приведение суммы и данных покупателя к ожидаемому формату ===
    // большинство интеграций CDEK Pay ждут сумму строкой с 2 знаками после запятой
    const amountMajor = (Number(order.amount_total || 0) / 100).toFixed(2);
    const payload = {
      shop_id: SHOP_ID,
      amount: String(amountMajor),           // "4990.00" <-- ВАЖНО
      currency: order.currency || "RUB",
      order_id: order.number,                // либо merchant_order_id — зависит от вашей схемы, обычно порядок не критичен
      description: `DH22: заказ ${order.number}`,
      customer: {
        email: order.customer_email,
        phone: normalizePhone(order.customer_phone),
        name: order.customer_name
      },
      success_url: `${PUBLIC}/checkout/success?o=${encodeURIComponent(order.number)}`,
      fail_url:    `${PUBLIC}/checkout/fail?o=${encodeURIComponent(order.number)}`,
      callback_url:`${PUBLIC}/api/pay/cdek/webhook`
    };

    // Заголовки
    const headers = {
      "content-type":"application/json",
      "x-api-key": API_KEY
    };
    const bodyJson = JSON.stringify(payload);
    const sig = await hmac256(SIGN, bodyJson);
    if (sig) headers["x-signature"] = sig;

    // Конкретный путь у CDEK Pay может отличаться по вашему договору.
    // Если у вас в Swagger другой — поменяйте строку ниже одной правкой.
    const endpoint = env.CDEK_PAY_LINK_PATH || "/paylink/create";
    const res = await fetch(`${API_BASE}${endpoint}`, { method:"POST", headers, body: bodyJson });

    if (!res.ok) {
      const t = await res.text();
      await run(markStatus, "failed", order.id);
      return new Response(JSON.stringify({ok:false,error:`CDEK Pay error: ${res.status}`, detail:t}), {status:200}); // 200, чтобы UI не падал
    }

    const data = await res.json();
    const paymentId = data.payment_id || data.id || data.uuid || null;
    if (paymentId) await run(setPaymentId, String(paymentId), order.id);
    const payUrl = data.link || data.url;
    if (!payUrl) {
      await run(markStatus, "failed", order.id);
      return new Response(JSON.stringify({ok:false,error:"Ответ без ссылки на оплату"}), {status:200});
    }

    return new Response(JSON.stringify({ok:true, url: payUrl}), { headers:{'content-type':'application/json'}});
  } catch (e) {
    return new Response(JSON.stringify({ok:false,error:e.message||"Ошибка инициации платежа"}), {status:200});
  }
}
