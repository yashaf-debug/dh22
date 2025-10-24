import type { Metadata } from "next";
import Image from "next/image";
import { getBestsellers, getLatest, getClothes } from "@/lib/queries";
import QuickNav from "@/components/QuickNav";
import { fmtRub } from "@/lib/normalize";
import { SITE, canonical } from "@/lib/seo";
// Если используете доп. секции — оставьте их импорт/рендер позже
// import CategoryTiles from "@/components/home/CategoryTiles";
// import ClothesSection from "@/components/home/ClothesSection";
// import InstagramStripStatic from "@/components/home/InstagramStripStatic";

export const runtime = "edge";

export const metadata: Metadata = {
  title: SITE.title,
  description: SITE.description,
  alternates: {
    canonical: canonical(),
  },
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
        src="https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/hero.jpg"
        alt="Геро‑баннер DH22"
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

/* ================ BESTSELLERS (моб. карусель) ================ */
function Bestsellers({ products }: { products: any[] }) {
  return (
    <section id="bestsellers" className="scroll-mt-20">
      <h2 className="mb-6 mt-12 text-3xl font-black uppercase tracking-tight text-accent sm:mb-8 sm:mt-16 sm:text-5xl md:text-6xl">
        Bestsellers
      </h2>

      <div className="flex gap-4 overflow-x-auto scroll-smooth px-1 pb-4 sm:gap-8 sm:pb-6 [scroll-snap-type:x_mandatory]">
        {products.map((p) => (
          <a
            key={p.id}
            href={`/product/${p.slug}`}
            className="min-w-[72vw] max-w-[72vw] sm:min-w-[360px] sm:max-w-[360px] lg:min-w-[420px] lg:max-w-[420px]
                       [scroll-snap-align:start]"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-dh22 bg-neutral-100">
              {/* Здесь обычный <img> — так быстрее в скролле */}
              <img
                src={p.cover_url || "/placeholder.svg"}
                alt={p.title}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-3 text-center sm:mt-4">
              <div className="text-[12px] uppercase tracking-wider text-neutral-700 sm:text-sm">
                {p.title}
              </div>
              <div className="mt-1 text-[14px] font-semibold sm:text-[15px]">
                {fmtRub(p.price_cents)}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ================ ALL ITEMS (Новинки) ================= */
function AllItemsBanner() {
  return (
    <section id="all" className="relative overflow-hidden rounded-dh22">
      <Image
        src="https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/brand.jpg"
        alt="DH22 — раздел Новинки"
        width={2400}
        height={1200}
        className="h-[40vh] w-full object-cover sm:h-[50vh]"
        sizes="(max-width: 640px) 100vw, 100vw"
      />
      <a
        href="/new"
        className="absolute inset-0 flex items-center justify-center"
        aria-label="Перейти в Новинки"
      >
        <span className="rounded-xl bg-black/20 px-4 py-2 text-3xl font-extrabold uppercase tracking-widest text-white backdrop-blur
                         sm:px-6 sm:py-2 sm:text-5xl">
          Новинки
        </span>
      </a>
    </section>
  );
}

/* ================== CATEGORY SPLIT (адаптив) ================== */
function CategorySplit() {
  const cards = [
    {
      href: "/catalog/clothes",
      label: "Одежда",
      img: "https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/brand.jpg",
    },
    {
      href: "/catalog/accessories",
      label: "Аксессуары",
      img: "https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/brand.jpg",
    },
  ];
  return (
    <section id="cats" className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
      {cards.map((c) => (
        <a key={c.href} href={c.href} className="group relative overflow-hidden rounded-dh22">
          <Image
            src={c.img}
            alt={`DH22 — категория ${c.label}`}
            width={1600}
            height={1200}
            className="h-[56vh] w-full object-cover transition group-hover:scale-[1.02] sm:h-[64vh] md:h-[72vh]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
            <span className="rounded-xl bg-white/20 px-4 py-2 text-3xl font-extrabold uppercase tracking-widest text-white backdrop-blur
                             sm:px-6 sm:py-2 sm:text-5xl">
              {c.label}
            </span>
          </div>
        </a>
      ))}
    </section>
  );
}

/* ================== CLOTHES GRID (адаптив) ================== */
function ClothesGrid({ items }: { items: any[] }) {
  return (
    <section id="clothes" className="scroll-mt-20">
      <h2 className="mb-6 mt-12 text-3xl font-black uppercase tracking-tight text-accent sm:mb-8 sm:mt-16 sm:text-5xl md:text-6xl">
        Clothes
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        {items.map((p) => (
          <a
            key={p.id}
            href={`/product/${p.slug}`}
            className="group overflow-hidden rounded-dh22 bg-neutral-100"
          >
            <img
              src={p.cover_url || "/placeholder.svg"}
              alt={p.title}
              loading="lazy"
              className="aspect-[3/4] w-full object-cover transition group-hover:scale-[1.02]"
            />
            <div className="px-2 pb-4 pt-3 text-center sm:px-4 sm:pb-6 sm:pt-4">
              <div className="text-[12px] uppercase tracking-wider text-neutral-700 sm:text-sm">
                {p.title}
              </div>
              <div className="mt-1 text-[13px] font-semibold sm:text-[15px]">
                {fmtRub(p.price_cents)}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ================== CTA -10% (адаптив) ================== */
function NewsletterCTA() {
  return (
    <section id="sale10" className="grid grid-cols-1 items-stretch gap-4 sm:gap-6 md:grid-cols-2">
      <div className="overflow-hidden rounded-dh22">
        <Image
          src="https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/all-items.jpg"
          alt="DH22 — предложение со скидкой 10%"
          width={1400}
          height={1200}
          className="h-full w-full object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="relative overflow-hidden rounded-dh22 bg-gradient-to-b from-accent to-[#4E35CE] p-6 text-white sm:p-10">
        <div className="mx-auto max-w-md text-center">
          <h3 className="text-2xl font-extrabold uppercase leading-tight tracking-wider sm:text-4xl">
            Воспользуйтесь скидкой 10% на первый заказ
          </h3>
          <p className="mt-3 text-sm opacity-90 sm:mt-4">
            Подпишитесь на нашу рассылку и мы отправим вам персональный промокод
          </p>
          <form className="mt-4 flex items-center gap-2 sm:mt-6 sm:gap-3">
            <input
              type="email"
              placeholder="Электронная почта"
              className="h-11 w-full min-w-0 flex-1 rounded-xl border border-white/30 bg-white/10 px-3 text-sm text-white placeholder-white/70 outline-none backdrop-blur
                         sm:h-12 sm:px-4 sm:text-base"
            />
            <button className="h-11 shrink-0 rounded-xl bg-white px-4 text-xs font-bold uppercase tracking-wider text-accent
                               sm:h-12 sm:px-5 sm:text-sm">
              Отправить
            </button>
          </form>
          <p className="mt-3 text-[10px] opacity-70 sm:text-[11px]">
            Нажимая на кнопку, вы соглашаетесь с политикой конфиденциальности и обработкой персональных данных
          </p>
        </div>
      </div>
    </section>
  );
}

/* ================== BRAND BLOCK (адаптив) ================== */
function BrandBlock() {
  return (
    <section id="brand" className="relative overflow-hidden rounded-dh22">
      <Image
        src="https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/brand.jpg"
        alt="DH22 — эстетика бренда"
        width={2400}
        height={1600}
        className="h-[54vh] w-full object-cover grayscale sm:h-[62vh] md:h-[70vh]"
        sizes="100vw"
      />
      <div className="absolute right-4 top-4 max-w-[88%] rounded-2xl bg-white/70 p-4 backdrop-blur
                      sm:right-8 sm:top-8 sm:max-w-md sm:p-6">
        <div className="text-2xl font-bold text-accent sm:text-3xl">DH22</div>
        <p className="mt-2 text-sm leading-relaxed text-neutral-800 sm:mt-3">
          Наш бренд воплощает сдержанную элегантность и техническую точность посадки. Минимализм, чёткие линии и качественные ткани.
        </p>
        <a
          href="/about"
          className="mt-3 inline-block rounded-xl bg-accent px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white
                     sm:mt-4 sm:px-5 sm:py-3 sm:text-sm"
        >
          Подробнее о бренде
        </a>
      </div>
    </section>
  );
}

/* ================== INSTAGRAM DUMMY (кликабельно) ================== */
function Instagram() {
  const IG_URL = "https://instagram.com/dh22_am";
  const imgs = [
    "https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/proxy-5.jpeg",
    "https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/proxy-6.jpeg",
    "https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/proxy-7.jpeg",
    "https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/proxy-8.jpeg",
    "https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/proxy-9.jpeg",
    "https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/proxy.jpeg",
  ];

  return (
    <section id="insta" className="scroll-mt-20">
      <h2 className="mb-4 mt-12 text-center text-3xl font-black uppercase tracking-tight text-accent sm:mb-8 sm:mt-16 sm:text-5xl md:text-6xl">
        Follow us
      </h2>

      <p className="mb-5 text-center font-semibold text-neutral-500 sm:mb-6">
        <a
          href={IG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-transparent transition hover:text-accent hover:decoration-current"
          aria-label="Открыть Instagram DH22 (@dh22_am) в новой вкладке"
        >
          @dh22_am
        </a>
      </p>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-6">
        {imgs.map((src, i) => (
          <a
            key={i}
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Открыть Instagram DH22 в новой вкладке"
            className="group overflow-hidden rounded-dh22 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Image
              src={src}
              alt={`DH22 Instagram ${i + 1}`}
              width={600}
              height={800}
              className="aspect-[3/4] w-full object-cover transition group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 16vw"
            />
          </a>
        ))}
      </div>
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
      <AllItemsBanner />
      <CategorySplit />
      <ClothesGrid items={clothes} />
      <NewsletterCTA />
      <BrandBlock />
      <Instagram />
      <QuickNav />
      {/* Если нужно — верните дополнительные секции:
         <CategoryTiles />
         <ClothesSection />
         <InstagramStripStatic />
      */}
    </div>
  );
}
