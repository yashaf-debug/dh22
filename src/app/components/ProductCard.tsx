// src/app/components/ProductCard.tsx
import Link from 'next/link';
import { r2Url } from '@/lib/r2';
import { rub } from '@/app/lib/money';

type Product = {
  slug: string;
  name: string;
  price: number;
  main_image?: string | null;
};

export default function ProductCard({ product }: { product: Product }) {
  const src = r2Url(product.main_image) || '/images/placeholder.png';
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

