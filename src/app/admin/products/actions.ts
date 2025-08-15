'use server';

import { redirect } from 'next/navigation';
import { d1 } from '@/lib/db';

export async function createNewProduct() {
  const db = d1();
  const slug = `new-${Date.now()}`;
  const stmt = db
    .prepare(
      `INSERT INTO products (slug, name, price, category, active, quantity, description, main_image, sizes, colors, images_json)
       VALUES (?,'Новый товар',0,'',0,0,'','', '[]','[]','[]')`
    )
    .bind(slug);
  const result: any = await stmt.run();
  const id = result?.meta?.last_row_id ?? result?.meta?.lastRowId ?? 0;
  redirect(`/admin/products/${id}`);
}

