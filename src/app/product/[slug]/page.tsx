// src/app/product/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { queryAll } from '@/lib/db';
import ProductClient from './ProductClient';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

type Product = {
  id: number;
  slug: string;
  name: string;
  price: number;
  description?: string | null;
  colors?: string | null;
  sizes?: string | null;
  main_image?: string | null;
  images_json?: string | null;
};

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const rows = await queryAll<Product>(
    `SELECT id, slug, name, price, description, colors, sizes, main_image, images_json FROM products WHERE slug=? LIMIT 1`,
    params.slug
  );
  if (!rows.length) notFound();
  const p = rows[0];
  const variants = await queryAll<any>(
    `SELECT id, color, size, stock, sku FROM product_variants WHERE product_id=?`,
    p.id
  );
  const product = {
    ...p,
    colors: (() => { try { return JSON.parse(p.colors ?? '[]'); } catch { return []; } })(),
    sizes: (() => { try { return JSON.parse(p.sizes ?? '[]'); } catch { return []; } })(),
    images: (() => { try { return JSON.parse(p.images_json ?? '[]'); } catch { return []; } })(),
  };
  return (
    <div className="container mx-auto px-4 py-10">
      <ProductClient product={product} variants={variants} />
    </div>
  );
}

