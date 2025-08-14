import { getRequestContext } from '@cloudflare/next-on-pages';
export const runtime = 'edge';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const env: any = getRequestContext().env;
  const db = env.DB ?? env.DH22_DB;

  const form = await req.formData();
  const name = String(form.get('name') || '');
  const description = String(form.get('description') || '');
  const price = Math.round(parseFloat(String(form.get('price') || '0')) * 100) || 0;
  const stock = parseInt(String(form.get('stock') || '0'), 10) || 0;
  const main_image = String(form.get('main_image') || '').trim();

  // принимаем как строки, но если это валидный JSON — сохраняем как JSON
  const colorsRaw = String(form.get('colors') || '[]').trim() || '[]';
  const sizesRaw = String(form.get('sizes') || '[]').trim() || '[]';
  const colors = isJson(colorsRaw) ? colorsRaw : '[]';
  const sizes = isJson(sizesRaw) ? sizesRaw : '[]';

  const id = parseInt(params.id, 10);

  await db
    .prepare(
      `UPDATE products
       SET name=?, description=?, price=?, stock=?, main_image=?, colors=?, sizes=?
       WHERE id=?`
    )
    .bind(name, description, price, stock, main_image, colors, sizes, id)
    .run();

  return Response.redirect(new URL(`/admin/products/${id}?saved=1`, req.url), 302);
}

function isJson(s: string) {
  try { const x = JSON.parse(s); return typeof x === 'object'; } catch { return false; }
}

