import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

import CheckoutSuccessClient from "../CheckoutSuccessClient";

type PageProps = { searchParams?: { o?: string; order?: string } };

export const runtime = "edge";

export const metadata: Metadata = pageMetadata({
  title: "Спасибо за заказ — DH22",
  description: "Страница подтверждения заказа DH22.",
  path: "/checkout/success",
  noIndex: true,
});

export default function CheckoutSuccessPage(props: PageProps) {
  return <CheckoutSuccessClient {...props} />;
}
