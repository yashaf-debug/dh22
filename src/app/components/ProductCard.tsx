// src/app/components/ProductCard.tsx
import Link from 'next/link';
import { r2Url } from '@/lib/r2';
import { rub } from '@/app/lib/money';
import type { Product } from '@/types/product';

export default function ProductCard({ product }: { product: Product }) {
  const images: string[] = Array.isArray(product.gallery) ? product.gallery : [];
  const primary = product.main_image || images[0] || '';
  const src = r2Url(primary) || '/images/placeholder.png';
  return (
    <Link href={`/product/${product.slug}`} className="card">
      <div style={{ height: 360 }}>
        <img
          src={src}
          alt={product.name}
          loading="lazy"
          decoding="async"
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
      </div>
      <div className="text-sm">{product.name}</div>
      <div className="text-sm opacity-80">{rub(product.price)}</div>
    </Link>
  );
}

