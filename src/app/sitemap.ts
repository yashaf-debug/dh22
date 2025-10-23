import type { MetadataRoute } from 'next';

import { getAllProductSlugs } from '@/lib/queries';

export const runtime = 'edge';

const BASE_URL = 'https://dh22.ru';

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority?: MetadataRoute.Sitemap[number]['priority'];
}> = [
  { path: '/', changeFrequency: 'daily', priority: 0.8 },
  { path: '/new', changeFrequency: 'daily', priority: 0.7 },
  { path: '/womens', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/accessories', changeFrequency: 'weekly', priority: 0.6 },
  { path: '/catalog/clothes', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/catalog/accessories', changeFrequency: 'weekly', priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  let productEntries: MetadataRoute.Sitemap = [];

  try {
    const products = await getAllProductSlugs();
    productEntries = products.map((product) => ({
      url: `${BASE_URL}/product/${encodeURIComponent(product.slug)}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : undefined,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Не удалось получить список товаров для sitemap', error);
    }
  }

  return [...staticEntries, ...productEntries];
}
