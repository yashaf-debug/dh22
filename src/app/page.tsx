import Image from "next/image";
import { getBestsellers, getLatest, getClothes } from "@/lib/queries";
import QuickNav from "@/components/QuickNav";
import { fmtRub } from "@/lib/normalize";
import { canonical } from "@/lib/seo";

export const runtime = "edge";

export const metadata = {
  title: "Женская одежда и аксессуары",
  description:
    "DH22 — минималистичная женская одежда и аксессуары с идеальной посадкой. Новинки и бестселлеры. Доставка по России.",
  alternates: { canonical: canonical("/") },
};

/* =================== HERO (адаптив) =================== */
function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden rounded-dh22
                 h-[64vh] min-h-[480px] sm:h-[72vh] md:h-[86vh]"
    >
      <Image
        src="/hero.jpg"
        alt="Футболка DH22"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="sr-only">DH22 — New Collection</h1>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center sm:bottom-10 md:bottom-14">
        <div className="text-2xl font-extrabold uppercase tracking-widest text-accent sm:text-3xl md:text-4xl">
          New Collection
        </div>
        <a
          href="/new"
          className="mt-3 inline-block rounded-full bg-accent px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white
                     sm:mt-4 sm:px-7 sm:py-3 sm:text-sm"
        >
          Смотреть раздел
        </a>
      </div>
    </section>
  );
}

/* ================ BESTSELLERS (текстовый список) ================ */
function Bestsellers({ products }: { products: any[] }) {
  return (
    <section id="bestsellers" className="scroll-mt-20">
      <h2 className="mb-6 mt-12 text-3xl font-black uppercase tracking-tight text-accent sm:mb-8 sm:mt-16 sm:text-5xl md:text-6xl">
        Bestsellers
      </h2>
      <ul className="space-y-3 rounded-2xl border border-neutral-200 p-4 sm:p-6">
        {products.map((p) => (
          <li key={p.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <a
              href={`/product/${p.slug}`}
              className="text-sm font-semibold uppercase tracking-[0.16em] text-neutral-800 transition hover:text-accent"
            >
              {p.title}
            </a>
            <span className="text-base font-medium text-neutral-600 sm:text-lg">{fmtRub(p.price_cents)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ================== CLOTHES GRID (текст) ================== */
function ClothesGrid({ items }: { items: any[] }) {
  return (
    <section id="clothes" className="scroll-mt-20">
      <h2 className="mb-6 mt-12 text-3xl font-black uppercase tracking-tight text-accent sm:mb-8 sm:mt-16 sm:text-5xl md:text-6xl">
        Clothes
      </h2>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((p) => (
          <li key={p.id} className="rounded-2xl border border-neutral-200 p-4 sm:p-5">
            <a
              href={`/product/${p.slug}`}
              className="block text-sm font-semibold uppercase tracking-[0.14em] text-neutral-900 transition hover:text-accent"
            >
              {p.title}
            </a>
            <div className="mt-2 text-base font-medium text-neutral-600">{fmtRub(p.price_cents)}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ================== СТРАНИЦА ================== */
export default async function Page() {
  const [bestsellers, latest, clothesRaw] = await Promise.all([
    getBestsellers(12),
    getLatest(12),
    getClothes(12),
  ]);
  const clothes = clothesRaw.length ? clothesRaw : latest;

  return (
    <div className="mx-auto w-[calc(100%-32px)] max-w-[1400px] space-y-8 py-6 sm:w-[calc(100%-48px)] sm:space-y-12 sm:py-10">
      <Hero />
      <Bestsellers products={bestsellers.length ? bestsellers : latest} />
      <ClothesGrid items={clothes} />
      <QuickNav />
      {/* Если нужно — верните дополнительные секции:
         <CategoryTiles />
         <ClothesSection />
         <InstagramStripStatic />
      */}
    </div>
  );
}
