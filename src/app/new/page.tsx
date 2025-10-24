import { SITE, collectionJsonLd, canonical } from "@/lib/seo";
import Script from "next/script";
import { getLatest } from "@/lib/queries";

export const metadata = {
  title: "Новинки",
  description: "Новая коллекция DH22. Минимализм, точная посадка и свежие дропы. Доставка по России.",
  alternates: { canonical: canonical("/new") },
};

export default async function Page() {
  const items = await getLatest(24);
  return (
    <>
      <Script type="application/ld+json" id="ld-new">
        {JSON.stringify(
          collectionJsonLd({
            name: "Новинки DH22",
            description: "Новая коллекция DH22",
            path: "/new",
            urls: items.map((p: any) => `${SITE.url}/product/${p.slug}`),
          })
        )}
      </Script>
      <div className="mx-auto max-w-[1400px] px-6 pb-24">
        <h1 className="mt-10 mb-8 text-5xl font-extrabold uppercase tracking-tight text-[#6C4EF6]">Новинки</h1>
        {items.length === 0 ? (
          <p>Пока пусто — отметьте товары галочкой «Новинка» в админке.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p: any) => (
              <li key={p.id} className="rounded-[28px] bg-neutral-50 p-4">
                <a href={`/product/${p.slug}`}>
                  <img
                    src={p.cover_url || p.image_url}
                    alt={p.title}
                    className="mb-4 aspect-[4/5] w-full rounded-[20px] object-cover"
                  />
                  <div className="text-sm opacity-70">{p.title}</div>
                  <div className="text-lg font-semibold">
                    {Intl.NumberFormat("ru-RU", {
                      style: "currency",
                      currency: "RUB",
                      maximumFractionDigits: 0,
                    }).format((p.price_cents ?? p.price ?? 0) / 100)}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
