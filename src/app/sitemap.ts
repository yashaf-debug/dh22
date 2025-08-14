import type { MetadataRoute } from 'next';
import { all } from '@/app/lib/db';
export const runtime = 'edge'
const base =
  process.env.PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'https://dh22.ru';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Базовые страницы
  const items: MetadataRoute.Sitemap = [
    { url: `${base}/`,        changeFrequency: 'daily',  priority: 0.8 },
    { url: `${base}/new`,     changeFrequency: 'daily',  priority: 0.7 },
    { url: `${base}/womens`,  changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/accessories`, changeFrequency: 'weekly', priority: 0.6 },
  ];

  // Активные товары из D1
  try {
    const rows = (await all(
      'SELECT slug, updated_at FROM products WHERE active=1'
    )) as { slug: string; updated_at?: string | null }[];

    for (const r of rows) {
      items.push({
        url: `${base}/product/${encodeURIComponent(r.slug)}`,
        lastModified: r.updated_at ? new Date(r.updated_at) : undefined,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  } catch {
    // молча продолжаем — базовых страниц достаточно
  }

  return items;
}
