import ProductCard from "@/app/components/ProductCard";
import { all } from "./lib/db";
import { rub } from "./lib/money";
export const runtime = 'edge';

export default async function Home() {
  const products = await all(
    "SELECT id,slug,name,price,image_url,image_key FROM products WHERE active=1 AND quantity>0 ORDER BY id DESC LIMIT 8"
  );
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-medium">Новая капсула DH22</h1>
        <p className="text-sm opacity-80 mt-2">Плотная ткань / Контрастный шов / Точная посадка</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.slug} product={{ ...p, price_fmt: rub(p.price) }} />
        ))}
      </div>
    </section>
  );
}
