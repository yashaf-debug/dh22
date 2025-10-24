import type { Metadata } from "next";
import Script from "next/script";
import ProductCard from "@/app/components/ProductCard";
import { SITE, canonical, collectionJsonLd } from "@/lib/seo";
import { all } from "../lib/db";

export const runtime = 'edge';
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const url = canonical("/womens");
  const title = "Одежда — DH22";
  const description = "Одежда DH22 — минимализм, точную посадку и доставка по России без компромиссов.";
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: SITE.name,
      title,
      description,
      images: [
        {
          url: canonical(SITE.ogImage),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [canonical(SITE.ogImage)],
    },
  };
}

export default async function Women() {
  const rows = await all(
    "SELECT id,slug,name,price,main_image,image_url,images_json FROM products WHERE category IN ('Одежда','Женская одежда') AND active=1 AND quantity>0 ORDER BY id DESC LIMIT 20"
  );
  const items = rows.map((p: any) => ({
    ...p,
    gallery: (() => { try { return JSON.parse(p.images_json ?? '[]'); } catch { return []; } })(),
  }));
  const jsonLd = collectionJsonLd({
    name: "Одежда",
    url: canonical("/womens"),
    description,
    items: items.map((p: any) => ({
      name: p.name ?? p.slug,
      url: canonical(`/product/${p.slug}`),
    })),
  });

  return (
    <>
      <div className="page-wrap py-10">
        <h1 className="mt-2 text-5xl font-black uppercase tracking-tight text-accent">Одежда</h1>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
      <Script id="womens-collection-ld" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(jsonLd)}
      </Script>
    </>
  );
}
