import type { Metadata } from "next";

export const SITE = {
  name: "DH22",
  url: "https://dh22.ru",
  title: "DH22 — женская одежда и аксессуары",
  description:
    "DH22 — минималистичная женская одежда и аксессуары с точной посадкой. Новинки, бестселлеры, быстрая доставка по России. Официальный сайт бренда.",
  locale: "ru_RU",
  twitter: "@dh22_am",
  ogImage: "/og.jpg",
  logo: "/logo.svg",
};

export const DEFAULT_METADATA: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `DH22 — %s`,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    url: SITE.url,
    locale: SITE.locale,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: "DH22" }],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.twitter,
    creator: SITE.twitter,
    title: SITE.title,
    description: SITE.description,
    images: [SITE.ogImage],
  },
  alternates: {
    canonical: SITE.url,
    languages: { "ru-RU": SITE.url },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export function canonical(path = "/") {
  return new URL(path, SITE.url).toString();
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: new URL(SITE.logo, SITE.url).toString(),
    sameAs: ["https://instagram.com/dh22_am"],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/search?q={query}`,
      "query-input": "required name=query",
    },
  };
}

export function siteNavJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      { "@type": "SiteNavigationElement", name: "Новинки", url: `${SITE.url}/new` },
      { "@type": "SiteNavigationElement", name: "Одежда", url: `${SITE.url}/catalog/clothes` },
      { "@type": "SiteNavigationElement", name: "Аксессуары", url: `${SITE.url}/catalog/accessories` },
      { "@type": "SiteNavigationElement", name: "Bestsellers", url: `${SITE.url}/bestsellers` },
      { "@type": "SiteNavigationElement", name: "Информация", url: `${SITE.url}/info` },
      { "@type": "SiteNavigationElement", name: "О бренде", url: `${SITE.url}/about` },
    ],
  };
}

export function breadcrumbsJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export type SEOProduct = {
  id: number;
  slug: string;
  title: string;
  description?: string;
  price_cents: number;
  currency?: string;
  cover_url?: string;
  colors?: string[];
  sizes?: string[];
  in_stock?: boolean;
  sku?: string;
};

export function productJsonLd(p: SEOProduct) {
  const price = (p.price_cents ?? 0) / 100;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.description || "Товар DH22",
    image: p.cover_url ? [p.cover_url] : undefined,
    sku: p.sku || String(p.id),
    brand: { "@type": "Brand", name: SITE.name },
    offers: {
      "@type": "Offer",
      url: `${SITE.url}/product/${p.slug}`,
      priceCurrency: p.currency || "RUB",
      price,
      availability: p.in_stock === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

export function collectionJsonLd({
  name,
  description,
  urls,
  path,
}: {
  name: string;
  description: string;
  urls: string[];
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: canonical(path),
    description,
    hasPart: urls.slice(0, 30).map((u) => ({ "@type": "Product", url: u })),
  };
}
