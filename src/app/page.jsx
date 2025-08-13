import Link from 'next/link';
import Image from 'next/image';
import { all } from './lib/db';
import { rub } from './lib/money';
export const runtime = 'edge';

export default async function Home() {
  const products = await all(
    "SELECT id,slug,name,price,COALESCE(main_image,image_url) AS image_url FROM products WHERE active=1 AND quantity>0 ORDER BY id DESC LIMIT 8"
  );
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-medium">Новая капсула DH22</h1>
        <p className="text-sm opacity-80 mt-2">Плотная ткань / Контрастный шов / Точная посадка</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => {
          const img =
            (p.image_url || p.main_image || "").startsWith("/i/") ||
            (p.image_url || p.main_image || "").startsWith("http")
              ? p.image_url || p.main_image
              : "/placeholder.png";
          return (
            <Link key={p.slug} href={`/product/${p.slug}`} className="card">
              <Image src={img} alt={p.name} width={300} height={400} sizes="(max-width:768px) 50vw, 25vw" className="w-full h-auto object-cover border" />
              <div className="text-sm">{p.name}</div>
              <div className="text-sm opacity-80">{rub(p.price)}</div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
