import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

import CheckoutPageClient from "./CheckoutPageClient";

export const runtime = "edge";

export const metadata: Metadata = pageMetadata({
  title: "Оформление заказа — DH22",
  description: "Оформление заказа DH22 — корзина, доставка и оплата без компромиссов.",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
