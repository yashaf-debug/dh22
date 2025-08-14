import { getRequestContext } from '@cloudflare/next-on-pages';
export const runtime = 'edge';

export async function GET() {
  const env: any = getRequestContext().env;
  const db = env.DH22_DB;
  const slug = `new-${Date.now()}`;

  const stmt = db.prepare(
    `INSERT INTO products
    (slug, name, description, price, currency, category, subcategory, colors, sizes, images, is_new, stock, active, quantity, created_at, main_image, gallery)
     VALUES (?,'Новый товар','',0,'RUB','Аксессуары','', '[]','[]','[]',0,'{}',0,0, datetime('now'), '', NULL)`
  ).bind(slug);

  const result = await stmt.run();
  const id = result?.meta?.last_row_id || result?.meta?.lastRowId || 0;

  return Response.redirect(`/admin/products/${id}?t=${Date.now()}`, 302);
}
