import Link from "next/link";
import products from "@data/products.json";
import { rub } from "../lib/money";

export default function Accessories() {
  const items = products.filter(p=>p.category==="Аксессуары");
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl mb-6">Аксессуары</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(p=>(
          <Link key={p.slug} href={`/product/${p.slug}`} className="card">
            <img src={p.images[0]} alt={p.name} className="w-full aspect-[3/4] object-cover border" />
            <div className="text-sm">{p.name}</div>
            <div className="text-sm opacity-80">{rub(p.price)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
