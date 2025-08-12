import Link from "next/link";
import { all } from "../lib/db";
import { rub } from "../lib/money";
export const runtime = "edge";

export default async function NewArrivals() {
  const items = await all(
    "SELECT id,slug,name,price,COALESCE(main_image,image_url) AS image_url FROM products WHERE active=1 AND quantity>0 ORDER BY id DESC"
  );
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl mb-6">Новинки</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((p) => (
          <Link key={p.slug} href={`/product/${p.slug}`} className="card">
            <img src={p.image_url || "/placeholder.png"} alt={p.name} className="w-full aspect-[3/4] object-cover border" />
            <div className="text-sm">{p.name}</div>
            <div className="text-sm opacity-80">{rub(p.price)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
