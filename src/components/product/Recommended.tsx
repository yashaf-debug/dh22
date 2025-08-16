import Image from "next/image";
import Link from "next/link";
import { fmtRub } from "@/lib/normalize";

export default function Recommended({ items }: { items: any[] }) {
  if (!items?.length) return null;
  return (
    <section className="mt-16">
      <h2 className="mb-8 text-center text-4xl font-black uppercase tracking-tight text-accent">
        Рекомендуем
      </h2>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {items.map((p) => (
          <Link key={p.id} href={`/product/${p.slug}`} className="group overflow-hidden rounded-dh22 bg-neutral-100">
            <Image
              src={p.cover_url || "/placeholder.svg"}
              alt={p.title}
              width={900}
              height={1200}
              className="aspect-[3/4] w-full object-cover transition group-hover:scale-[1.02]"
            />
            <div className="px-4 pb-5 pt-3 text-center">
              <div className="text-sm uppercase tracking-wider text-neutral-700">{p.title}</div>
              <div className="mt-1 text-[15px] font-semibold">{fmtRub(p.price_cents)}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

