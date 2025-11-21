import type { Metadata } from "next";

type NavItem = { name: string; path: string };

type Availability = "InStock" | "OutOfStock" | "PreOrder";

type Rating = {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
};

export type SEOProduct = {
  slug: string;
  name: string;
  description?: string | null;
  price: number; // in cents
  images?: string[] | null;
  sku?: string | null;
  gtin?: string | null;
  availability?: Availability;
  currency?: string;
  brand?: string | null;
  category?: string | null;
  color?: string | string[] | null;
  material?: string | null;
  sizes?: string[] | null;
  rating?: Rating | null;
  url?: string | null;
  updatedAt?: string | Date | null;
};

const baseUrl = (
  process.env.PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://dh22.ru"
).replace(/\/$/, "");

const hostname = (() => {
  try {
    return new URL(baseUrl).hostname;
  } catch {
    return "dh22.ru";
  }
})();

export const SITE = {
  name: "DH22",
  domain: hostname,
  url: baseUrl,
  locale: "ru_RU",
  title: "DH22 — одежда и аксессуары",
  description: "DH22 — минимализм, точную посадку и доставка по России без компромиссов.",
  email: "info@dh22.ru",
  instagram: "https://instagram.com/dh22_am",
  whatsapp: "https://wa.me/79995952225",
  ogImage: "/og",
  logo: "/logo.svg",
  twitter: "@dh22",
  navigation: [
    { name: "Новинки", path: "/new" },
    { name: "Одежда", path: "/catalog/clothes" },
    { name: "Аксессуары", path: "/catalog/accessories" },
    { name: "Bestsellers", path: "/bestsellers" },
    { name: "О бренде", path: "/about" },
    { name: "Информация", path: "/info" },
  ] as NavItem[],
};

export const DEFAULT_METADATA: Metadata = {
  metadataBase: new URL(`${SITE.url}/`),
  title: {
    default: SITE.title,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  alternates: { canonical: canonical() },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    images: [
      {
        url: canonical(SITE.ogImage),
        width: 1200,
        height: 630,
        alt: SITE.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.twitter,
    title: SITE.title,
    description: SITE.description,
    images: [canonical(SITE.ogImage)],
  },
};

export function pageMetadata(options: {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const title = options.title;
  const description = options.description ?? SITE.description;
  const url = canonical(options.path ?? "");

  const metadata: Metadata = {
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

  if (options.noIndex) {
    metadata.robots = {
      index: false,
      follow: false,
    };
  }

  return metadata;
}

export function canonical(path: string | URL = ""): string {
  if (path instanceof URL) {
    return path.toString();
  }
  const input = String(path ?? "");
  if (/^https?:\/\//i.test(input)) {
    return input;
  }
  const base = SITE.url.endsWith("/") ? SITE.url : `${SITE.url}/`;
  const cleaned = input.replace(/^\//, "");
  try {
    return new URL(cleaned, base).toString();
  } catch {
    return `${base}${cleaned}`;
  }
}

export function organizationJsonLd() {
  const sameAs = [SITE.instagram, SITE.whatsapp].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: canonical(SITE.logo),
    email: SITE.email,
    sameAs,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: SITE.email,
        areaServed: "RU",
        availableLanguage: ["ru"],
      },
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: "ru-RU",
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      logo: canonical(SITE.logo),
    },
  };
}

export function siteNavJsonLd(items: NavItem[] = SITE.navigation) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "SiteNavigationElement",
      position: index + 1,
      name: item.name,
      url: canonical(item.path),
    })),
  };
}

export function breadcrumbsJsonLd(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: canonical(crumb.item),
    })),
  };
}

const availabilityMap: Record<Availability, string> = {
  InStock: "https://schema.org/InStock",
  OutOfStock: "https://schema.org/OutOfStock",
  PreOrder: "https://schema.org/PreOrder",
};

export function productJsonLd(product: SEOProduct) {
  const images = (product.images ?? [])
    .filter((src): src is string => Boolean(src))
    .map((src) => canonical(src));
  const priceRub = Number.isFinite(product.price)
    ? Number((Math.max(product.price, 0) / 100).toFixed(2))
    : 0;

  const jsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? SITE.description,
    sku: product.sku ?? undefined,
    image: images.length ? images : [canonical(SITE.ogImage)],
    category: product.category ?? undefined,
    brand: {
      "@type": "Brand",
      name: product.brand ?? SITE.name,
    },
    offers: {
      "@type": "Offer",
      url: canonical(product.url ?? `/product/${product.slug}`),
      priceCurrency: product.currency ?? "RUB",
      price: priceRub,
      availability: availabilityMap[product.availability ?? "InStock"],
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  if (product.color) {
    jsonLd.color = product.color;
  }
  if (product.material) {
    jsonLd.material = product.material;
  }
  if (product.sizes?.length) {
    jsonLd.size = product.sizes;
  }
  if (product.gtin) {
    jsonLd.gtin = product.gtin;
  }
  if (product.rating) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating.ratingValue,
      reviewCount: product.rating.reviewCount,
      bestRating: product.rating.bestRating ?? 5,
      worstRating: product.rating.worstRating ?? 1,
    };
  }
  if (product.updatedAt) {
    const date = product.updatedAt instanceof Date
      ? product.updatedAt
      : new Date(product.updatedAt);
    if (!Number.isNaN(date.getTime())) {
      jsonLd.offers.priceValidUntil = date.toISOString();
    }
  }

  return jsonLd;
}

export function collectionJsonLd(options: {
  name: string;
  url: string;
  description?: string;
  items: { name: string; url: string }[];
}) {
  const { name, url, description, items } = options;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: canonical(url),
    isPartOf: {
      "@type": "WebSite",
      name: SITE.name,
      url: SITE.url,
    },
    mainEntity: {
      "@type": "ItemList",
      name,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: canonical(item.url),
      })),
    },
  };
}
