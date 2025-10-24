import ProductClient from "./ProductClient";
import { getProductFull, getBestsellers, getProductBySlug } from "@/lib/queries";
import Recommended from "@/components/product/Recommended";
import type { Metadata } from "next";
import Script from "next/script";
import { canonical, breadcrumbsJsonLd, productJsonLd, SITE } from "@/lib/seo";

export const runtime = "edge";

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const p = await getProductBySlug(params.slug);
  if (!p) {
    return { title: "Товар не найден" };
  }

  const title = `${p.title} — купить DH22`;
  const desc = (p.description || `Купить ${p.title} DH22 с доставкой по России.`)
    .replace(/\s+/g, " ")
    .slice(0, 160);

  const url = canonical(`/product/${p.slug}`);
  const img = p.cover_url || SITE.ogImage;

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      type: "product",
      url,
      title,
      description: desc,
      images: [{ url: img, width: 1200, height: 630, alt: p.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [img],
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const [product, bestsellers, p] = await Promise.all([
    getProductFull(params.slug),
    getBestsellers(4),
    getProductBySlug(params.slug),
  ]);
  if (!product || !p) return <div className="container">Товар не найден</div>;
  if (!product.images?.length) {
    product.images = ["/images/placeholder.png"];
  }

  const crumbs = [
    { name: "Главная", url: SITE.url },
    { name: "Каталог", url: `${SITE.url}/catalog/clothes` },
    { name: p.title, url: `${SITE.url}/product/${p.slug}` },
  ];

  return (
    <>
      <Script type="application/ld+json" id="ld-breadcrumbs">
        {JSON.stringify(breadcrumbsJsonLd(crumbs))}
      </Script>
      <Script type="application/ld+json" id="ld-product">
        {JSON.stringify(
          productJsonLd({
            id: p.id,
            slug: p.slug,
            title: p.title,
            description: p.description,
            price_cents: p.price_cents,
            currency: p.currency || "RUB",
            cover_url: p.cover_url,
            colors: p.colors || [],
            sizes: p.sizes || [],
            in_stock: p.in_stock !== false,
            sku: p.sku || undefined,
          })
        )}
      </Script>
      <main className="mx-auto w-[calc(100%-48px)] max-w-[1400px] pt-6 pb-24 md:pb-6">
        <ProductClient product={product} />
        <Recommended items={bestsellers} />
      </main>
    </>
  );
}

