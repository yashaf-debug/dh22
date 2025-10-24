import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://dh22.ru/sitemap.xml",
    host: "https://dh22.ru",
  };
}
