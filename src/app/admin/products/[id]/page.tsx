import { queryAll } from '@/lib/db';
import AdminProductForm from './AdminProductForm';

export const runtime = 'edge';

type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  main_image?: string | null;
  sizes?: string | null;
  colors?: string | null;
  images_json?: string | null;
};

export default async function EditProduct({ params }: { params: { id: string } }) {
  const rows = await queryAll<Product>(`SELECT * FROM products WHERE id=? LIMIT 1`, params.id);
  if (!rows.length) {
    return <div className="container mx-auto px-4 py-8">Not found</div>;
  }
  const p = rows[0];
  const product = {
    ...p,
    images: (() => { try { return JSON.parse(p.images_json ?? '[]'); } catch { return []; } })(),
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-semibold mb-6">
        Правка товара — {product.name || 'Без названия'} <span className="text-neutral-400">#{product.id}</span>
      </h1>
      <AdminProductForm product={product} />
      
    </div>
  );
}
