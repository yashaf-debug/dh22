import { query } from "@/lib/d1";
import Link from "next/link";
const fmt = (c:number)=> (Number(c||0)/100).toLocaleString("ru-RU")+" ₽";

export default async function ClothesSection() {
  const items = await query<any>(
    `SELECT id, slug, name, price, main_image, image_url
     FROM products
     WHERE active=1
     ORDER BY updated_at DESC, id DESC
     LIMIT 24`
  );

  return (
    <section className="mx-auto max-w-[1400px] px-6 pb-24">
      <h2 className="mb-8 text-5xl font-extrabold uppercase tracking-tight text-[#6C4EF6]">Clothes</h2>
      <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p:any)=>(
          <li key={p.id} className="rounded-[28px] bg-neutral-50 p-4">
            <Link href={`/product/${p.slug}`}>
              <img src={p.main_image || p.image_url} alt="" className="mb-4 aspect-[4/5] w-full rounded-[20px] object-cover" />
              <div className="text-sm opacity-70">{p.name}</div>
              <div className="text-lg font-semibold">{fmt(p.price)}</div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
