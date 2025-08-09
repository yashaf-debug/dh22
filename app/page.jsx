import Link from "next/link";
import products from "@data/products.json";
import { rub } from "./lib/money";

export default function Home() {
  const latest = [...products].slice(0,8);
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-medium">Новая капсула DH22</h1>
        <p className="text-sm opacity-80 mt-2">Плотная ткань / Контрастный шов / Точная посадка</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {latest.map(p=>(
          <Link key={p.slug} href={`/product/${p.slug}`} className="card">
            <img src={p.images[0]} alt={p.name} className="w-full aspect-[3/4] object-cover border" />
            <div className="text-sm">{p.name}</div>
            <div className="text-sm opacity-80">{rub(p.price)}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
