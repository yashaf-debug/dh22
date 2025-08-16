import { getBestsellers } from "@/lib/queries";

export const runtime = "edge";
export const metadata = {
  title: "Bestsellers — DH22",
  description: "Хиты продаж DH22",
};

export default async function Page() {
  const items = await getBestsellers(60);

  return (
    <main className="mx-auto w-[calc(100%-48px)] max-w-[1400px] py-8">
      <h1 className="mb-8 text-6xl font-black uppercase tracking-tight text-accent">Bestsellers</h1>
      {items.length ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {items.map((p) => (
            <a
              key={p.id}
              href={`/product/${p.slug}`}
              className="group overflow-hidden rounded-dh22 bg-neutral-100"
            >
              <img
                src={p.cover_url || "/placeholder.svg"}
                alt={p.title}
                className="aspect-[3/4] w-full object-cover transition group-hover:scale-[1.02]"
              />
              <div className="px-4 pb-6 pt-4 text-center">
                <div className="text-sm uppercase tracking-wider text-neutral-700">{p.title}</div>
                <div className="mt-1 text-[15px] font-semibold">
                  {Intl.NumberFormat("ru-RU", {
                    style: "currency",
                    currency: "RUB",
                    maximumFractionDigits: 0,
                  }).format((p.price_cents ?? 0) / 100)}
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-neutral-600">
          Пока пусто. Отметьте товары галочкой «Бестселлер» в админке.
        </p>
      )}
    </main>
  );
}

