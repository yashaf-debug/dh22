import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextResponse } from 'next/server';
export const runtime = 'edge';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const env: any = getRequestContext().env;
  const db = env.DB ?? env.DH22_DB;
  const result: any = await db
    .prepare(`SELECT id, color, size, stock, sku FROM product_variants WHERE product_id=? ORDER BY id`)
    .bind(params.id)
    .all();
  const variants = result?.results || [];
  return NextResponse.json({ ok: true, variants });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const env: any = getRequestContext().env;
  const db = env.DB ?? env.DH22_DB;
  const body = await req.json();
  const variants = Array.isArray(body.variants) ? body.variants : [];
  const productId = parseInt(params.id, 10);

  const stmts: any[] = [db.prepare('BEGIN')];
  for (const v of variants) {
    const color = String(v.color || '');
    const size = String(v.size || '');
    const stock = Math.max(0, parseInt(v.stock, 10) || 0);
    const sku = v.sku ? String(v.sku) : null;
    stmts.push(
      db.prepare(`INSERT OR IGNORE INTO product_variants (product_id, color, size, stock, sku) VALUES (?,?,?,?,?)`)
        .bind(productId, color, size, stock, sku)
    );
    stmts.push(
      db.prepare(`UPDATE product_variants SET stock=?, sku=? WHERE product_id=? AND color=? AND size=?`)
        .bind(stock, sku, productId, color, size)
    );
  }
  if (variants.length) {
    const placeholders = variants.map(() => '(?,?)').join(',');
    const paramsList: any[] = [productId];
    for (const v of variants) {
      paramsList.push(String(v.color || ''));
      paramsList.push(String(v.size || ''));
    }
    stmts.push(
      db
        .prepare(
          `DELETE FROM product_variants WHERE product_id=? AND (color,size) NOT IN (${placeholders})`
        )
        .bind(...paramsList)
    );
  } else {
    stmts.push(
      db.prepare(`DELETE FROM product_variants WHERE product_id=?`).bind(productId)
    );
  }
  stmts.push(db.prepare('COMMIT'));
  await db.batch(stmts);
  return NextResponse.json({ ok: true });
}
