export const runtime = 'edge';
import { getRequestContext } from "@cloudflare/next-on-pages";
import { run, first } from "@/app/lib/db";
import { insertOrder, insertItem, byNumber } from "@/app/lib/sql";
import { ensureOrdersTables } from "@/app/lib/init";
import { tgSend } from "@/app/lib/notifier/telegram";

function bad(msg, code=400){
  return new Response(
    JSON.stringify({ ok:false, error:msg }),
    { status:code, headers:{'content-type':'application/json'} }
  );
}

export async function POST(req) {
  const env = getRequestContext().env;
  try {
    await ensureOrdersTables();
    const body = await req.json();
    const { customer, delivery, items } = body;
    const payment_method = body.payment_method === "cod" ? "cod" : "online";
    const initialStatus = payment_method === "cod" ? "awaiting_payment" : "new";

    if (!customer?.name || !customer?.phone || !customer?.email) return bad("Некорректные данные покупателя");
    if (!Array.isArray(items) || items.length === 0) return bad("Пустая корзина");
    const allowed = ["same_day_msk","cdek_courier","cdek_pvz"];
    if (!delivery || !allowed.includes(delivery.method)) return bad("Некорректная доставка");

    const items_total = items.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0);
    const delivery_price = Math.max(0, Math.round(delivery.price_kop || 0));
    const amount_total = items_total + delivery_price;
    if (amount_total <= 0) return bad("Сумма заказа некорректна");

    const number = "DH22-" + Date.now().toString(36).toUpperCase();
    await run(
      insertOrder,
      number,
      initialStatus,
      customer.name,
      customer.phone,
      customer.email,
      delivery.method,
      delivery.city || "",
      delivery.address || "",
      delivery.pvz_code || "",
      delivery.pvz_name || "",
      delivery_price,
      delivery.eta || "",
      amount_total,
      body.notes || "",
      payment_method
    );

    const order = await first(byNumber, number);
    for (const i of items) {
      await run(insertItem, order.id, i.slug, i.name, i.price, i.qty, i.image);
    }
    try {
      const totalRub = (amount_total / 100).toFixed(2);
      const lines = items.map(i => `• ${i.name} × ${i.qty}`).join("\n");
      await tgSend(
        `<b>🆕 Новый заказ</b>\n` +
        `№ <code>${number}</code>\n` +
        `Сумма: <b>${totalRub} ₽</b>\n` +
        `Покупатель: ${customer.name} / ${customer.phone}\n` +
        (customer.email ? `Email: ${customer.email}\n` : ``) +
        `Доставка: ${delivery.method} / ${delivery.city}${delivery.pvz_name ? ' / '+delivery.pvz_name : ''}\n` +
        `\n${lines}`
      );
    } catch {}

    return new Response(JSON.stringify({ ok:true, orderNumber:number, orderId:order.id }), { headers:{'content-type':'application/json'}});
  } catch (e) {
    return bad(`D1_ERROR: ${e.message || "Ошибка создания заказа"}`, 500);
  }
}
