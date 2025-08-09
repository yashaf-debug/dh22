export const runtime = "edge";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { run, first } from "../../../lib/db";
import { insertOrder, insertItem, byNumber } from "../../../lib/sql";

function bad(msg, code=400){ return new Response(JSON.stringify({ok:false,error:msg}), {status:code, headers:{'content-type':'application/json'}}); }

export async function POST(req) {
  const env = getRequestContext().env;
  try {
    const body = await req.json();
    const { customer, delivery, items, amount } = body;

    if (!customer?.name || !customer?.phone || !customer?.email) return bad("Некорректные данные покупателя");
    if (!Array.isArray(items) || items.length === 0) return bad("Пустая корзина");
    if (!amount?.total || amount.total <= 0) return bad("Сумма заказа некорректна");

    const number = "DH22-" + Date.now().toString(36).toUpperCase();
    await run(insertOrder, number, customer.name, customer.phone, customer.email, delivery.type, delivery.address || "", amount.total, body.notes || "");

    const order = await first(byNumber, number);
    for (const i of items) {
      await run(insertItem, order.id, i.slug, i.name, i.price, i.qty, i.image);
    }

    return new Response(JSON.stringify({ ok:true, orderNumber:number, orderId:order.id }), { headers:{'content-type':'application/json'}});
  } catch (e) {
    return bad(e.message || "Ошибка создания заказа", 500);
  }
}
