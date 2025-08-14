import Link from 'next/link';
import { queryAll } from '@/lib/db';
import { r2Url } from '@/lib/r2';
import { rub } from '@/app/lib/money';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

type Product = {
  id: number; slug: string; name: string; price: number; currency: string;
  main_image?: string | null; images?: string | null; active: number; is_new?: number;
};

export default async function Home() {
  const products = await queryAll<Product>(
    `SELECT id, slug, name, price, currency, main_image, images, active, is_new
     FROM products WHERE active=1 ORDER BY is_new DESC, id DESC LIMIT 12`
  );
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-medium">Новая капсула DH22</h1>
        <p className="text-sm opacity-80 mt-2">Плотная ткань / Контрастный шов / Точная посадка</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map(p => {
          let fallback: string | undefined;
          try { fallback = JSON.parse(p.images ?? '[]')[0]; } catch {}
          return (
            <Link key={p.id} className="card" href={`/product/${p.slug}`}>
              <div style={{ height: 360 }}>
                {(() => {
                  const src = r2Url(p.main_image ?? fallback) || '/images/placeholder.png';
                  return (
                    <img
                      src={src}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  );
                })()}
              </div>
              <div className="text-sm">{p.name}</div>
              <div className="text-sm opacity-80">{rub(p.price)}</div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
