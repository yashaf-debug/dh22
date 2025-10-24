// src/app/components/ProductCard.tsx
import Link from "next/link";
import Image from "next/image";
import { r2Url } from "@/lib/r2";
import { rub } from "@/app/lib/money";
import type { Product } from "@/types/product";
import FavHeart from "@/components/favorites/FavHeart";

export default function ProductCard({ product }: { product: Product }) {
  const images: string[] = Array.isArray(product.gallery) ? product.gallery : [];
  const primary = product.main_image || images[0] || "";
  const src = r2Url(primary) || "/placeholder.svg";
  const price_cents = (product as any).price_cents ?? (product as any).price;
  const favItem = { id: product.id, slug: product.slug, title: product.name, price_cents, cover_url: src };
  return (
    <Link href={`/product/${product.slug}`} className="group relative overflow-hidden rounded-dh22 bg-neutral-100">
      <FavHeart item={favItem} />
      <Image
        src={src}
        alt={product.title ?? product.name ?? product.slug}
        width={900}
        height={1200}
        className="aspect-[3/4] w-full object-cover transition group-hover:scale-[1.02]"
      />
      <div className="px-4 pb-6 pt-4 text-center">
        <div className="text-sm uppercase tracking-wider text-neutral-700">{product.name}</div>
        <div className="mt-1 text-[15px] font-semibold">{rub(price_cents)}</div>
      </div>
    </Link>
  );
}

