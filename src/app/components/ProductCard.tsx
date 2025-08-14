// src/app/components/ProductCard.tsx
import Link from 'next/link';
import { imgProps } from '@/lib/images';
import { rub } from '@/app/lib/money';

type Product = {
  slug: string;
  name: string;
  price: number;
  main_image?: string | null;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`} className="card">
      <div className="grid-product-thumb">
        <img {...imgProps(product.main_image, product.name)} className="product-thumb" />
      </div>
      <div className="text-sm">{product.name}</div>
      <div className="text-sm opacity-80">{rub(product.price)}</div>
    </Link>
  );
}

