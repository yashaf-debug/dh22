// src/app/components/ProductCard.tsx
import Link from 'next/link';
import { resolveImageUrl } from '@/lib/images';
import { rub } from '@/app/lib/money';

type Product = {
  slug: string;
  name: string;
  price: number;
  main_image?: string | null;
};

export default function ProductCard({ product }: { product: Product }) {
  const src = resolveImageUrl(product.main_image, 'width=600,fit=cover');
  return (
    <Link href={`/product/${product.slug}`} className="card">
      <img
        src={src}
        alt={product.name}
        width={300}
        height={400}
        loading="lazy"
        className="w-full h-auto object-cover border"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
      />
      <div className="text-sm">{product.name}</div>
      <div className="text-sm opacity-80">{rub(product.price)}</div>
    </Link>
  );
}

