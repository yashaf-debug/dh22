import Link from 'next/link';
import { resolveImageUrl, rubKopecks } from '@/lib/images';

export default function ProductCard({ product }: { product: any }) {
  const raw = product.image_url || (product.image_key ? `/i/${product.image_key}` : undefined) || product.main_image;
  const src = resolveImageUrl(raw);

  return (
    <Link href={`/product/${product.slug}`} className="card">
      <img
        src={src}
        alt={product.name}
        width={300}
        height={400}
        loading="lazy"
        className="w-full h-auto object-cover border"
      />
      <div className="text-sm">{product.name}</div>
      <div className="text-sm opacity-80">{rubKopecks(product.price)}</div>
    </Link>
  );
}
