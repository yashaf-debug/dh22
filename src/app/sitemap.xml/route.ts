export const runtime = 'edge';

import { all } from '@/app/lib/db';

const host = 'https://dh22.ru';

export async function GET() {
  // товары
  const products = await all(
    `SELECT slug, COALESCE(updated_at, datetime('now')) AS updated_at
       FROM products WHERE active=1`
  );

  // статические
  const staticUrls = [
    { loc: `${host}/`,               changefreq: 'daily',  priority: '0.8' },
    { loc: `${host}/new`,            changefreq: 'daily',  priority: '0.7' },
    { loc: `${host}/womens`,         changefreq: 'weekly', priority: '0.7' },
    { loc: `${host}/accessories`,    changefreq: 'weekly', priority: '0.6' },
  ];

  const items = [
    ...staticUrls,
    ...products.map((p: any) => ({
      loc: `${host}/product/${encodeURIComponent(p.slug)}`,
      lastmod: new Date(p.updated_at).toISOString(),
      changefreq: 'weekly',
      priority: '0.7',
    })),
  ];

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...items.map(u => [
      `<url>`,
      `<loc>${u.loc}</loc>`,
      u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : '',
      `<changefreq>${u.changefreq}</changefreq>`,
      `<priority>${u.priority}</priority>`,
      `</url>`
    ].filter(Boolean).join('')),
    `</urlset>`
  ].join('');

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=21600, s-maxage=21600', // 6 часов
    },
  });
}
