import type { Metadata } from "next";

import ComingSoon from "@/app/components/ComingSoon";
import { pageMetadata } from "@/lib/seo";

export const runtime = "edge";

export async function generateMetadata({ params }: { params: { slug?: string[] } }): Promise<Metadata> {
  const slugPath = Array.isArray(params.slug) ? params.slug.join("/") : "";
  return pageMetadata({
    title: "О бренде — DH22",
    description: "Материалы о бренде DH22.",
    path: `/about/${slugPath}`,
    noIndex: true,
  });
}

export default function AboutNestedComingSoonPage() {
  return (
    <div className="mx-auto w-[calc(100%-32px)] max-w-[1400px] py-6 sm:w-[calc(100%-48px)] sm:py-10">
      <ComingSoon />
    </div>
  );
}
