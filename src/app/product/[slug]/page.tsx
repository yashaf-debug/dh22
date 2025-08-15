// src/app/product/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { queryAll } from '@/lib/db';
import ProductClient from './ProductClient';
import ProductGallery from '@/components/ProductGallery';
import type { Product } from '@/types/product';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const rows = await queryAll<any>(
    `SELECT id, slug, name, price, description, main_image, images_json FROM products WHERE slug=? LIMIT 1`,
    params.slug
  );
  if (!rows.length) notFound();
  const p = rows[0];
  const gallery = (() => { try { return JSON.parse(p.images_json ?? '[]'); } catch { return []; } })();
  const variants = await queryAll<any>(
    `SELECT id, color, size, stock, sku FROM product_variants WHERE product_id=?`,
    p.id
  );
  const product: Product = { ...p, gallery, variants };
  const images = [product.main_image, ...(Array.isArray(product.gallery) ? product.gallery : [])].filter(Boolean) as string[];
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid md:grid-cols-[1fr_1fr] gap-8">
        <ProductGallery images={images} alt={product.name} />
        <ProductClient product={product} />
      </div>
    </div>
  );
}

