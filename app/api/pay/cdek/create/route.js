export const runtime = "edge";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { first, run } from "../../../../lib/db";
import { byNumber, setPaymentId, markStatus } from "../../../../lib/sql";

async function hmac256(secret, data) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name:"HMAC", hash:"SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const bytes = Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,"0")).join("");
  return bytes;
}

export async function POST(req) {
  const { env } = getRequestContext();
  const { orderNumber } = await req.json();

  try {
    const order = await first(byNumber, orderNumber);
    if (!order) return new Response(JSON.stringify({ok:false,error:"Заказ не найден"}), {status:404});
    await run(markStatus, "payment_pending", order.id);

    // --- Конфиг из ENV ---
    const API_BASE = env.CDEK_PAY_API_BASE;      // https://api.cdekfin.ru
    const SHOP_ID  = env.CDEK_PAY_SHOP_ID;
    const API_KEY  = env.CDEK_PAY_API_KEY;
    const SIGN     = env.CDEK_PAY_SIGN_SECRET || "";
    const PUBLIC   = env.PUBLIC_BASE_URL;

    if (!API_BASE || !SHOP_ID || !API_KEY) {
      return new Response(JSON.stringify({ok:false, needSetup:true, message:"CDEK Pay не настроен"}), {status:200});
    }

    // --- Параметры платёжной ссылки (универсально для CDEK Pay PayLink/SBP/Card)
    const payload = {
      shop_id: SHOP_ID,
      amount: order.amount_total,        // копейки
      currency: order.currency || "RUB",
      order_id: order.number,
      description: `DH22: заказ ${order.number}`,
      customer: {
        email: order.customer_email,
        phone: order.customer_phone,
        name: order.customer_name
      },
      success_url: `${PUBLIC}/checkout/success?o=${encodeURIComponent(order.number)}`,
      fail_url:    `${PUBLIC}/checkout/fail?o=${encodeURIComponent(order.number)}`,
      callback_url:`${PUBLIC}/api/pay/cdek/webhook`
    };

    // Некоторые инсталляции требуют подпись тела (HMAC SHA256).
    // Если задан CDEK_PAY_SIGN_SECRET — добавим заголовок X-Signature.
    const bodyJson = JSON.stringify(payload);
    const headers = {
      "content-type":"application/json",
      "x-api-key": API_KEY
    };
    if (SIGN) headers["x-signature"] = await hmac256(SIGN, bodyJson);

    // Важно: конкретный путь зависит от режима (карта/СБП/универсальная ссылка).
    // На бою проверьте в Swagger CDEK Pay конечную точку создания платежной ссылки.
    // Часто это что-то вроде: POST {API_BASE}/paylink/create  или  {API_BASE}/payments/link
    const res = await fetch(`${API_BASE}/paylink/create`, { method:"POST", headers, body: bodyJson });

    if (!res.ok) {
      const t = await res.text();
      await run(markStatus, "failed", order.id);
      return new Response(JSON.stringify({ok:false,error:`CDEK Pay error: ${res.status}`, detail:t}), {status:502});
    }

    const data = await res.json();
    // предполагаем ответ: { payment_id: "...", link: "https://..." }
    const paymentId = data.payment_id || data.id || data.uuid || null;
    if (paymentId) await run(setPaymentId, String(paymentId), order.id);

    const payUrl = data.link || data.url;
    if (!payUrl) {
      await run(markStatus, "failed", order.id);
      return new Response(JSON.stringify({ok:false,error:"Ответ без ссылки на оплату"}), {status:502});
    }

    return new Response(JSON.stringify({ok:true, url: payUrl}), { headers:{'content-type':'application/json'}});
  } catch (e) {
    return new Response(JSON.stringify({ok:false,error:e.message}), {status:500});
  }
}
