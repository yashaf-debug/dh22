import type { Metadata } from "next";

import ComingSoon from "@/app/components/ComingSoon";
import { pageMetadata } from "@/lib/seo";

export const runtime = "edge";

export async function generateMetadata({ params }: { params: { slug?: string[] } }): Promise<Metadata> {
  const slugPath = Array.isArray(params.slug) ? params.slug.join("/") : "";
  return pageMetadata({
    title: "Информация — DH22",
    description: "Информационные материалы DH22.",
    path: `/info/${slugPath}`,
    noIndex: true,
  });
}

export default function InfoNestedComingSoonPage() {
  return (
    <main className="mx-auto w-[calc(100%-32px)] max-w-[1400px] py-6 sm:w-[calc(100%-48px)] sm:py-10">
      <ComingSoon />
    </main>
  );
}
