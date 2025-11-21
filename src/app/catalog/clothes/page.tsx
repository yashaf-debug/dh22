import type { Metadata } from "next";

import ComingSoonBanner from "@/app/components/ComingSoon";
import { canonical, SITE } from "@/lib/seo";

const PATH = "/catalog/clothes";
const TITLE = "Одежда — DH22";
const DESCRIPTION = "Одежда DH22 — минимализм, точную посадку и доставка по России без компромиссов.";

export const runtime = "edge";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: canonical(PATH) },
  openGraph: {
    type: "website",
    url: canonical(PATH),
    siteName: SITE.name,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: canonical(SITE.ogImage),
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [canonical(SITE.ogImage)],
  },
};

export default async function CatalogClothesPage() {
  return (
    <div className="page-wrap py-10">
      <ComingSoonBanner />
    </div>
  );
}
