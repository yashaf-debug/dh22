export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
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
  const base = process.env.CDEK_PAY_BASE || "https://secure.cdekfin.ru";
  const login = process.env.CDEK_PAY_LOGIN || "";
  const secret = process.env.CDEK_PAY_SECRET || "";
  const pub =
    process.env.PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://dh22.ru";
  if (!login || !secret) {
    return NextResponse.json(
      { ok: false, error: "CDEK credentials missing" },
      { status: 200 }
    );
  }

  const { orderNumber } = (await req.json()) as { orderNumber: string };
  // 1) читаем заказ и позиции из D1
  const order = await first(
    "SELECT * FROM orders WHERE number=?",
    orderNumber
  );
  if (!order)
    return NextResponse.json(
      { ok: false, error: "Order not found" },
      { status: 200 }
    );
  const items = await all(
    "SELECT slug,name,price,qty,image FROM order_items WHERE order_id=?",
    order.id
  );

  // 2) строим receipt_details (цены и суммы — В КОПЕЙКАХ)
  const receipt_details = (items as any[]).map((i: any) => ({
    id: String(i.slug),
    name: i.name,
    price: toKop(i.price), // уже в копейках в нашей схеме
    quantity: i.qty,
    sum: toKop(i.price) * i.qty,
    payment_object: 1,
    measure: 0,
  }));
  const pay_amount = receipt_details.reduce(
    (s: any, i: any) => s + i.sum,
    0
  );

  // 3) строго по контракту CDEK
  const payment_order = {
    pay_for: `DH22 #${order.number}`,
    currency: "RUR", // именно RUR
    pay_amount, // копейки, целое
    user_phone: normPhone((order as any).customer_phone),
    user_email: (order as any).customer_email || "",
    return_url_success: `${pub}/checkout/success?o=${encodeURIComponent(
      order.number
    )}`,
    return_url_fail: `${pub}/checkout/fail?o=${encodeURIComponent(
      order.number
    )}`,
    receipt_details,
  };

  const signature = await cdekSignature(payment_order, secret);
  const payload = { login, signature, payment_order };

  // 4) отправляем и возвращаем ПОЛНЫЙ detail при ошибке
  const res = await fetch(`${base}/merchant_api/payment_orders`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {}
    return NextResponse.json(
      {
        ok: false,
        status: res.status,
        error: "CDEK " + res.status,
        detail: parsed || text,
        sent: payload,
      },
      { status: 200 }
    );
  }
  let data: any = {};
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  const link = data.link || data.url || "";
  const oid = String(data.order_id ?? "");
  const akey = String(data.access_key ?? "");

await run(
    "UPDATE orders SET pay_link=?, cdek_order_id=?, cdek_access_key=? WHERE id=?",
    link,
    oid,
    akey,
    order.id
  );
  return NextResponse.json({ ok: true, ...data }, { status: 200 });
}
