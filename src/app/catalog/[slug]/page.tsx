import type { Metadata } from "next";
import Script from "next/script";

import ProductCard from "@/app/components/ProductCard";
import { getByCategorySlug } from "@/lib/queries";
import { SITE, canonical, collectionJsonLd, pageMetadata } from "@/lib/seo";

export const runtime = "edge";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const titleMap: Record<string, string> = {
    clothes: "Одежда",
    accessories: "Аксессуары",
    new: "Новинки",
  };
  const titleBase = titleMap[params.slug] ?? params.slug;
  const path = `/catalog/${params.slug}`;

  return pageMetadata({
    title: `${titleBase} — ${SITE.name}`,
    description: `${titleBase} DH22 — минимализм, точную посадку и доставка по России без компромиссов.`,
    path,
  });
}

export default async function Page({ params }: { params: { slug: string } }) {
  const items = await getByCategorySlug(params.slug, 120); // slug: clothes | accessories

  const titleMap: Record<string, string> = {
    clothes: "Одежда",
    accessories: "Аксессуары",
    new: "Новинки",
  };
  const title = titleMap[params.slug] ?? params.slug;

  const products = items.map((p: any) => ({
    ...p,
    name: p.title,
    price: p.price_cents,
    main_image: p.cover_url,
    gallery: [],
  }));

  const jsonLd = collectionJsonLd({
    name: title,
    url: canonical(`/catalog/${params.slug}`),
    description: `${title} DH22 — минимализм, точную посадку и доставка по России без компромиссов.`,
    items: products.map((p: any) => ({
      name: p.name ?? p.slug,
      url: canonical(`/product/${p.slug}`),
    })),
  });

  return (
    <>
      <div className="page-wrap py-10">
        <h1 className="mt-2 text-5xl font-black uppercase tracking-tight text-accent">{title}</h1>
        <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          {products.map((p: any) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
      <Script id={`catalog-${params.slug}-ld`} type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(jsonLd)}
      </Script>
    </>
  );
}

