import type { Metadata } from "next";
import Script from "next/script";

import ProductCard from "@/app/components/ProductCard";
import { canonical, collectionJsonLd, SITE } from "@/lib/seo";
import { getClothes } from "@/lib/queries";

const PATH = "/catalog/clothes";
const TITLE = "Одежда — DH22";
const DESCRIPTION = "Одежда DH22";

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
  const items = await getClothes(120);

  const products = items.map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.title,
    description: null,
    price: item.price_cents,
    main_image: item.cover_url,
    gallery: [],
  }));

  const jsonLd = collectionJsonLd({
    name: "Одежда",
    url: canonical(PATH),
    description: DESCRIPTION,
    items: products.map((product) => ({
      name: product.name,
      url: canonical(`/product/${product.slug}`),
    })),
  });

  return (
    <>
      <div className="page-wrap py-10">
        <h1 className="mt-2 text-5xl font-black uppercase tracking-tight text-accent">Одежда</h1>
        <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
      <Script id="catalog-clothes-jsonld" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(jsonLd)}
      </Script>
    </>
  );
}
