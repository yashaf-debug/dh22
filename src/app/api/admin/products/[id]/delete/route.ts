import { getRequestContext } from '@cloudflare/next-on-pages';
export const runtime = 'edge';
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const env: any = getRequestContext().env;
  const db = env.DB ?? env.DH22_DB;
  const id = parseInt(params.id, 10);
  await db.prepare(`DELETE FROM products WHERE id=?`).bind(id).run();
  return Response.redirect(new URL('/admin/products?t=' + Date.now(), req.url), 302);
}

