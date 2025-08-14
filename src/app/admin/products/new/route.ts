import { getRequestContext } from '@cloudflare/next-on-pages';
export const runtime = 'edge';

export async function GET(req: Request) {
  const env: any = getRequestContext().env;
  const db = env.DB ?? env.DH22_DB;
  const slug = `new-${Date.now()}`;
  const stmt = db.prepare(
    `INSERT INTO products
     (slug, name, description, price, currency, category, subcategory, colors, sizes, images, is_new, stock, active, quantity, created_at, main_image, gallery)
     VALUES (?,'Новый товар','',0,'RUB','Аксессуары','', '[]','[]','[]',0,'{}',1,0, datetime('now'), '', NULL)`
  ).bind(slug);
  const result: any = await stmt.run();
  const id = result?.meta?.last_row_id ?? result?.meta?.lastRowId ?? 0;
  return Response.redirect(new URL(`/admin/products/${id}?t=${Date.now()}`, req.url), 302);
}
