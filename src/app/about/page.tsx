// src/app/about/page.tsx
import type { Metadata } from "next";

import ComingSoon from "@/app/components/ComingSoon";
import { canonical } from "@/lib/seo";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "О нас — DH22",
  description: "История бренда DH22, ценности и подход к созданию одежды.",
  alternates: { canonical: canonical("/about") },
};

export default function Page() {
  return (
    <div className="mx-auto w-[calc(100%-32px)] max-w-[1400px] py-6 sm:w-[calc(100%-48px)] sm:py-10">
      <ComingSoon />
    </div>
  );
}
