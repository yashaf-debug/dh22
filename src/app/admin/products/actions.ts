'use server';

import { redirect } from 'next/navigation';
import { d1 } from '@/lib/db';

export async function createProduct() {
  const db = d1();
  const slug = `new-${Date.now()}`;
  const stmt = db.prepare(
    `INSERT INTO products
     (slug, name, description, price, currency, category, subcategory, colors, sizes, images, is_new, stock, active, quantity, created_at, main_image, gallery)
     VALUES (?,'Новый товар','',0,'RUB','Аксессуары','', '[]','[]','[]',0,'{}',1,0, datetime('now'), '', NULL)`
  ).bind(slug);
  const result: any = await stmt.run();
  const id = result?.meta?.last_row_id ?? result?.meta?.lastRowId ?? 0;
  redirect(`/admin/products/${id}`);
}

