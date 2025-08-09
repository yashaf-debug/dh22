export const runtime = 'edge';

import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";
import { cdekSignature } from "@/app/lib/cdek/signature";

// утилиты форматирования
const toKopecks = (rub: number) => Math.round(Number(rub) * 100);
const normPhone = (raw?: string) => {
  if (!raw) return "";
  const d = String(raw).replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("7")) return `+${d}`;
  if (d.length === 11 && d.startsWith("8")) return `+7${d.slice(1)}`;
  if (d.length === 10) return `+7${d}`;
  return `+${d}`;
};

export async function POST(req: NextRequest) {
  const { env } = getRequestContext();
  const base = env.CDEK_PAY_BASE || "https://secure.cdekfin.ru";
  const login = env.CDEK_PAY_LOGIN || "";
  const secret = env.CDEK_PAY_SECRET || "";
  const publicUrl = (env.PUBLIC_BASE_URL || env.NEXT_PUBLIC_BASE_URL || "").startsWith("http")
    ? (env.PUBLIC_BASE_URL || env.NEXT_PUBLIC_BASE_URL)!
    : `https://${env.PUBLIC_BASE_URL || env.NEXT_PUBLIC_BASE_URL || "dh22.ru"}`;

  if (!login || !secret) {
    return NextResponse.json({ ok:false, error:"CDEK Pay creds missing" }, { status: 200 });
  }

  const { orderId, items, customer } = await req.json() as {
    orderId: string,
    items: Array<{ id: string; name: string; priceRub: number; qty: number }>,
    customer?: { phone?: string; email?: string }
  };

  const receipt_details = (items || []).map(i => {
    const price = toKopecks(i.priceRub);
    return {
      id: String(i.id),
      name: i.name,
      price,                         // в копейках
      quantity: i.qty,
      sum: price * i.qty,            // в копейках
      payment_object: 1,
      measure: 0
    };
  });
  const pay_amount = receipt_details.reduce((s, i) => s + i.sum, 0);

  const payment_order = {
    pay_for: `DH22 #${orderId}`,
    currency: "RUR",
    pay_amount,
    user_phone: normPhone(customer?.phone),
    user_email: customer?.email || "",
    return_url_success: `${publicUrl}/checkout/success?order=${encodeURIComponent(orderId)}`,
    return_url_fail: `${publicUrl}/checkout/fail?order=${encodeURIComponent(orderId)}`,
    receipt_details
  };

  const signature = await cdekSignature(payment_order, secret);
  const payload = { login, signature, payment_order };

  const res = await fetch(`${base}/merchant_api/payment_orders`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ ok:false, error:`CDEK ${res.status}`, detail:text }, { status: 200 });
  }

  let data: any = {};
  try { data = JSON.parse(text); } catch { data = { link: "", raw: text }; }

  return NextResponse.json({ ok:true, ...data }, { status: 200 });
}
