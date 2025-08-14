import Link from 'next/link';
import { resolveImageUrl, rubKopecks } from '@/lib/images';

export default function ProductCard({ product }: { product: any }) {
  const images = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
      ? (() => { try { return JSON.parse(product.images); } catch { return []; } })()
      : [];

  const imgSrc =
    product.main_image ||
    product.image_url ||
    images[0] ||
    '/placeholder.svg';

  const src = resolveImageUrl(imgSrc);

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
