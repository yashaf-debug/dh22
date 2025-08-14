import Link from 'next/link';
import CfImage from '@/app/components/CfImage';
import { all } from '../lib/db';
import { rub } from '../lib/money';

export const runtime = 'edge';
export const revalidate = 3600;

export async function generateMetadata() {
  const url = 'https://dh22.ru/accessories';
  const title = 'Аксессуары — DH22';
  const desc = 'Аксессуары DH22';
  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: { type: 'website', url, title, description: desc },
    twitter: { card: 'summary_large_image', title, description: desc },
  };
}

export default async function Accessories() {
  const items = await all(
    "SELECT id,slug,name,price,COALESCE(main_image,image_url) AS image_url FROM products WHERE category='Аксессуары' AND active=1 AND quantity>0 ORDER BY id DESC LIMIT 20"
  );
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl mb-6">Аксессуары</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((p) => {
          const img =
            (p.image_url || p.main_image || "").startsWith("/i/") ||
            (p.image_url || p.main_image || "").startsWith("http")
              ? p.image_url || p.main_image
              : "/placeholder.png";
          return (
            <Link key={p.slug} href={`/product/${p.slug}`} className="card">
                <CfImage src={img} alt={p.name} width={300} height={400} sizes="(max-width:768px) 50vw, 25vw" className="w-full h-auto object-cover border" />
              <div className="text-sm">{p.name}</div>
              <div className="text-sm opacity-80">{rub(p.price)}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
