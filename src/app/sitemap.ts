import type { MetadataRoute } from "next";
import { canonical } from "@/lib/seo";
import { getAllProductSlugs } from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://dh22.ru";

  const staticRoutes = [
    "", "/new", "/catalog/clothes", "/catalog/accessories",
    "/bestsellers", "/info", "/about",
  ].map((p) => ({
    url: canonical(p || "/"),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));

  const products = await getAllProductSlugs();
  const productRoutes = products.map((p: any) => ({
    url: `${base}/product/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...productRoutes];
}
