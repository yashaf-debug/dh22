import { NextRequest, NextResponse } from "next/server";
import { cdekSignature } from "@/src/lib/cdek/signature";
import { createCdekPaymentLink } from "@/src/lib/cdek/client";

type Item = { id: string; name: string; priceRub: number; qty: number };

export async function POST(req: NextRequest) {
  const { orderId, items, customer } = (await req.json()) as {
    orderId: string;
    items: Item[];
    customer: { phone?: string; email?: string };
  };

  if (!process.env.CDEK_PAY_LOGIN || !process.env.CDEK_PAY_SECRET) {
    return NextResponse.json({ error: "CDEK Pay creds missing" }, { status: 500 });
  }

  const toKopecks = (rub: number) => Math.round(rub * 100);
  const lineItems = items.map(it => ({
    id: String(it.id),
    name: it.name,
    price: toKopecks(it.priceRub),
    quantity: it.qty,
    sum: toKopecks(it.priceRub) * it.qty,
    payment_object: 1,
    measure: 0,
  }));
  const totalKopecks = lineItems.reduce((s, i) => s + i.sum, 0);

  const payment_order = {
    pay_for: `DH22 #${orderId}`,
    currency: "RUR",
    pay_amount: totalKopecks,
    user_phone: customer?.phone ?? "",
    user_email: customer?.email ?? "",
    return_url_success: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?order=${orderId}`,
    return_url_fail: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/fail?order=${orderId}`,
    receipt_details: lineItems,
  };

  const signature = cdekSignature(payment_order, process.env.CDEK_PAY_SECRET);
  const payload = {
    login: process.env.CDEK_PAY_LOGIN,
    signature,
    payment_order,
  };

  const link = await createCdekPaymentLink(payload);
  return NextResponse.json(link, { status: 200 });
}
