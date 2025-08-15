import { queryAll } from '@/lib/db';
import AdminProductForm from './AdminProductForm';

export const runtime = 'edge';

export default async function EditProduct({ params }: { params: { id: string } }) {
  const rows = await queryAll<any>(`SELECT * FROM products WHERE id=? LIMIT 1`, params.id);
  if (!rows.length) {
    return <div className="container mx-auto px-4 py-8">Not found</div>;
  }
  const p = rows[0];
  const gallery = (() => { try { return JSON.parse(p.images_json ?? '[]'); } catch { return []; } })();
  const variants = await queryAll<any>(
    `SELECT id, color, size, sku, stock FROM product_variants WHERE product_id=? ORDER BY id`,
    p.id
  );
  const product = { ...p, gallery, variants };

  return (
    <div className="container mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-semibold mb-6">
        Правка товара — {product.name || 'Без названия'} <span className="text-neutral-400">#{product.id}</span>
      </h1>
      <AdminProductForm product={product} />

    </div>
  );
}
