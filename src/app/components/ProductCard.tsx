import Image from 'next/image';
import Link from 'next/link';
import { productImageSrc } from '@/app/lib/products';

export default function ProductCard({ product }: { product: any }) {
  const src = productImageSrc(product);
  const isSvg = src.endsWith('.svg');

  return (
    <Link href={`/product/${product.slug}`} className="card">
      {isSvg ? (
        <img
          src={src}
          alt={product.name}
          width={300}
          height={400}
          loading="lazy"
          className="w-full h-auto object-cover border"
        />
      ) : (
        <Image
          src={src}
          alt={product.name}
          width={300}
          height={400}
          sizes="(max-width:768px) 50vw, 25vw"
          className="w-full h-auto object-cover border"
          priority={false}
        />
      )}
      <div className="text-sm">{product.name}</div>
      <div className="text-sm opacity-80">{product.price_fmt}</div>
    </Link>
  );
}
