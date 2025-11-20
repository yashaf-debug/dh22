import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import ProductClient from "./ProductClient";
import {
  getProductFull,
  getBestsellers,
  getProductBySlug,
} from "@/lib/queries";
import Recommended from "@/components/product/Recommended";
import {
  SITE,
  canonical,
  breadcrumbsJsonLd,
  productJsonLd,
} from "@/lib/seo";

type PageParams = { params: { slug: string } };

export const runtime = "edge";

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const rows = await getProductBySlug(params.slug);
  const product = rows?.[0] as
    | (Record<string, any> & {
        name?: string | null;
        description?: string | null;
        main_image?: string | null;
        image_url?: string | null;
        images_json?: string | null;
      })
    | undefined;

  const titleBase = product?.name || params.slug;
  const title = `${titleBase} — ${SITE.name}`;
  const description = product?.description || SITE.description;
  const url = canonical(`/product/${params.slug}`);

  const images: string[] = [];
  if (product?.main_image) images.push(product.main_image);
  if (product?.image_url) images.push(product.image_url);
  if (product?.images_json) {
    try {
      const parsed = JSON.parse(product.images_json);
      if (Array.isArray(parsed)) {
        for (const src of parsed) {
          if (src) images.push(String(src));
        }
      }
    } catch {}
  }
  const ogImage = images.find(Boolean) || SITE.ogImage;

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
          url: canonical(ogImage),
          width: 1200,
          height: 630,
          alt: titleBase,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [canonical(ogImage)],
    },
  };
}

export default async function Page({ params }: PageParams) {
  const [product, bestsellers] = await Promise.all([
    getProductFull(params.slug),
    getBestsellers(4),
  ]);
  if (!product) notFound();
  if (!product.images?.length) {
    product.images = ["/images/placeholder.png"];
  }
  const colors = Array.from(
    new Set(product.variants.map((variant) => variant.color).filter(Boolean))
  ) as string[];
  const sizes = Array.from(
    new Set(product.variants.map((variant) => variant.size).filter(Boolean))
  ) as string[];
  const inStock = product.variants.some((variant) => (variant.stock ?? 0) > 0);

  const breadcrumbsLd = breadcrumbsJsonLd([
    { name: "Главная", item: "/" },
    { name: "Каталог", item: "/catalog" },
    { name: product.name, item: `/product/${product.slug}` },
  ]);

  const productLd = productJsonLd({
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: product.price,
    images: product.images,
    availability: inStock ? "InStock" : "OutOfStock",
    currency: "RUB",
    color: colors.length ? colors : undefined,
    sizes: sizes.length ? sizes : undefined,
    url: canonical(`/product/${product.slug}`),
  });

  return (
    <>
      <main className="mx-auto w-[calc(100%-48px)] max-w-[1400px] pt-6 pb-24 md:pb-6">
        <ProductClient product={product} />
        <Recommended items={bestsellers} />
      </main>
      <Script id={`breadcrumbs-${product.slug}`} type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(breadcrumbsLd)}
      </Script>
      <Script id={`product-${product.slug}`} type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(productLd)}
      </Script>
    </>
  );
}

