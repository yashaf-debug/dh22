export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { cdekSignature } from "@/app/lib/cdek/signature";
import { first, all, run } from "@/app/lib/db";

const toKop = (v: number | string) => Math.round(Number(v));
const normPhone = (raw?: string) => {
  if (!raw) return "";
  const d = String(raw).replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("7")) return `+${d}`;
  if (d.length === 11 && d.startsWith("8")) return `+7${d.slice(1)}`;
  if (d.length === 10) return `+7${d}`;
  return `+${d}`;
};

export async function POST(req: NextRequest) {
  try {
    // ⬇️ В Edge читаем env только так
    const { env } = getRequestContext();
    const base   = env.CDEK_PAY_BASE  || "https://secure.cdekfin.ru";
    const login  = env.CDEK_PAY_LOGIN || "";
    const secret = env.CDEK_PAY_SECRET || "";
    const pub    = (env.PUBLIC_BASE_URL || env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin);

    if (!login || !secret) {
      return NextResponse.json({ ok:false, error:"CDEK credentials missing" }, { status:200 });
    }

    const { orderNumber } = (await req.json()) as { orderNumber: string };

    // 1) Заказ и позиции
    const order = await first("SELECT * FROM orders WHERE number=?", orderNumber);
    if (!order) return NextResponse.json({ ok:false, error:"Order not found" }, { status:200 });

    const items = await all(
      "SELECT slug,name,price,qty,image FROM order_items WHERE order_id=?",
      order.id
    );

    // 2) Безопасные позиции (копейки/целые/очищенные названия)
    const safeId = (x: any, idx: number) => String(Number.isFinite(Number(x)) ? Number(x) : idx + 1);
    const safeName = (s: any) =>
      String(s ?? "").replace(/[^0-9A-Za-zА-Яа-яёЁ .,\-_/()+]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);

    const receipt_details = (items as any[]).map((i: any, idx: number) => {
      const price = toKop(i.price);
      const qty = Math.max(1, Number(i.qty) || 1);
      return {
        id: safeId(i.slug, idx),
        name: safeName(i.name),
        price,
        quantity: qty,
        sum: price * qty,
        payment_object: 1,
        measure: 0
      };
    });

    const pay_amount = receipt_details.reduce((s: number, i: any) => s + i.sum, 0);

    // 3) Тело по контракту CDEK
    const payment_order = {
      pay_for: safeName(`DH22 #${order.number}`),
      currency: "RUR",
      pay_amount,
      user_phone: normPhone((order as any).customer_phone),
      user_email: ((order as any).customer_email || "").trim().slice(0, 80),
      return_url_success: `${pub}/checkout/success?o=${encodeURIComponent(order.number)}`,
      return_url_fail:    `${pub}/checkout/fail?o=${encodeURIComponent(order.number)}`,
      receipt_details
    };

    const signature = await cdekSignature(payment_order, secret);
    const payload = { login, signature, payment_order };

    // 4) Запрос к CDEК + аккуратный парсинг ответа
    const res = await fetch(`${base}/merchant_api/payment_orders`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    const ctype = res.headers.get("content-type") || "";
    const text  = await res.text();

    if (!res.ok) {
      const detail = ctype.includes("application/json") ? (()=>{ try { return JSON.parse(text); } catch { return null; } })() : null;
      return NextResponse.json({ ok:false, status:res.status, error:`CDEK ${res.status}`, detail: detail || text, sent: payload }, { status:200 });
    }

    const data = ctype.includes("application/json") ? (()=>{ try { return JSON.parse(text); } catch { return { raw:text }; } })() : { raw:text };

    const link = data.link || data.url || "";
    const oid  = String(data.order_id ?? "");
    const akey = String(data.access_key ?? "");

    // 5) Сохраняем в заказ
    await run(
      "UPDATE orders SET pay_link=?, cdek_order_id=?, cdek_access_key=? WHERE id=?",
      link, oid, akey, order.id
    );

    return NextResponse.json({ ok:true, ...data }, { status:200 });
  } catch (e: any) {
    // Любая ошибка возвращается JSON, чтобы фронт не падал на r.json()
    return NextResponse.json({ ok:false, error: e?.message || String(e) }, { status:200 });
  }
}
