export const onRequest: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url);
  const base = `${url.protocol}//${url.host}`;

  const { results } = await ctx.env.DH22_DB.prepare(
    `SELECT slug, updated_at FROM products WHERE active=1 ORDER BY updated_at DESC LIMIT 1000`
  ).all();

  const urls: string[] = [
    `${base}/`,
    `${base}/new`,
    `${base}/womens`,
    `${base}/accessories`,
    `${base}/catalog/clothes`,
    `${base}/catalog/accessories`,
  ];

  const items = (results || []) as Array<{slug:string, updated_at?:string}>;
  const productUrls = items.map(i => `
    <url>
      <loc>${base}/product/${i.slug}</loc>
      ${i.updated_at ? `<lastmod>${new Date(i.updated_at).toISOString()}</lastmod>` : ''}
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.map(u => `<url><loc>${u}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`).join('')}
    ${productUrls}
  </urlset>`;

  return new Response(xml, { headers: { "content-type":"application/xml; charset=utf-8" }});
};
