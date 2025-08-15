import Image from "next/image";
import { getLatest, getClothes } from "@/lib/queries";
import QuickNav from "@/components/QuickNav";
import { fmtRub } from "@/lib/normalize";


export const runtime = "edge";

/* =================== HERO =================== */
function Hero() {
  return (
    <section id="hero" className="relative h-[90vh] min-h-[640px] overflow-hidden rounded-dh22">
      <Image src="https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/hero.jpg" alt="Hero" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="sr-only">DH22 — New Collection</h1>
      </div>
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 text-center">
        <div className="text-4xl font-extrabold uppercase tracking-widest text-accent">
          New Collection
        </div>
        {/* Ведём в раздел новинок */}
        <a
          href="/new"
          className="mt-4 inline-block rounded-full bg-accent px-7 py-3 text-sm font-bold uppercase tracking-wider text-white"
        >
          Смотреть раздел
        </a>
      </div>
    </section>
  );
}

/* ================= BESTSELLERS ================ */
function Bestsellers({ products }: { products: any[] }) {
  return (
    <section id="bestsellers" className="scroll-mt-20">
      <h2 className="mb-8 mt-16 text-6xl font-black uppercase tracking-tight text-accent">Bestsellers</h2>
      <div className="flex gap-10 overflow-x-auto scroll-smooth px-1 pb-6 [scroll-snap-type:x_mandatory]">
        {products.map((p) => (
          <a key={p.id} href={`/product/${p.slug}`} className="min-w-[420px] max-w-[420px] [scroll-snap-align:start]">
            <div className="aspect-[4/5] overflow-hidden rounded-dh22 bg-neutral-100">
              <img src={p.cover_url || "/placeholder.svg"} alt={p.title} className="h-full w-full object-cover" />
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm uppercase tracking-wider text-neutral-700">{p.title}</div>
              <div className="mt-1 text-[15px] font-semibold">{fmtRub(p.price_cents)}</div>
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
      <Image src="https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/brand.jpg" alt="Новинки" width={2400} height={1200} className="h-[50vh] w-full object-cover" />
      <a
        href="/new"
        className="absolute inset-0 flex items-center justify-center"
        aria-label="Перейти в Новинки"
      >
        <span className="rounded-xl bg-white/20 px-6 py-2 text-5xl font-extrabold uppercase tracking-widest text-white backdrop-blur">
          Новинки
        </span>
      </a>
    </section>
  );
}

/* ================== CATEGORY SPLIT ================== */
function CategorySplit() {
  const cards = [
    { href: "/catalog/clothes", label: "Одежда", img: "https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/brand.jpg" },
    { href: "/catalog/accessories", label: "Аксессуары", img: "https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/brand.jpg" },
  ];
  return (
    <section id="cats" className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {cards.map((c) => (
        <a key={c.href} href={c.href} className="group relative overflow-hidden rounded-dh22">
          <Image
            src={c.img}
            alt={c.label}
            width={1600}
            height={1200}
            className="h-[72vh] w-full object-cover transition group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-xl bg-white/20 px-6 py-2 text-5xl font-extrabold uppercase tracking-widest text-white backdrop-blur">
              {c.label}
            </span>
          </div>
        </a>
      ))}
    </section>
  );
}

/* ================== CLOTHES GRID ================== */
function ClothesGrid({ items }: { items: any[] }) {
  return (
    <section id="clothes" className="scroll-mt-20">
      <h2 className="mb-8 mt-16 text-6xl font-black uppercase tracking-tight text-accent">Clothes</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {items.map((p) => (
          <a key={p.id} href={`/product/${p.slug}`} className="group overflow-hidden rounded-dh22 bg-neutral-100">
            <img
              src={p.cover_url || "/placeholder.svg"}
              alt={p.title}
              className="aspect-[3/4] w-full object-cover transition group-hover:scale-[1.02]"
            />
            <div className="px-4 pb-6 pt-4 text-center">
              <div className="text-sm uppercase tracking-wider text-neutral-700">{p.title}</div>
              <div className="mt-1 text-[15px] font-semibold">{fmtRub(p.price_cents)}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ================== CTA -10% ================== */
function NewsletterCTA() {
  return (
    <section id="sale10" className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
      <div className="overflow-hidden rounded-dh22">
        <Image src="https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/all-items.jpg" alt="DH22" width={1400} height={1200} className="h-full w-full object-cover" />
      </div>
      <div className="relative overflow-hidden rounded-dh22 bg-gradient-to-b from-accent to-[#4E35CE] p-10 text-white">
        <div className="mx-auto max-w-md text-center">
          <h3 className="text-4xl font-extrabold uppercase leading-tight tracking-wider">
            Воспользуйтесь скидкой 10% на первый заказ
          </h3>
          <p className="mt-4 text-sm opacity-90">
            Подпишитесь на нашу рассылку и мы отправим вам персональный промокод
          </p>
          <form className="mt-6 flex items-center gap-3">
            <input
              type="email"
              placeholder="Электронная почта"
              className="h-12 w-full min-w-0 flex-1 rounded-xl border border-white/30 bg-white/10 px-4 text-white placeholder-white/70 outline-none backdrop-blur"
            />
            <button className="h-12 shrink-0 rounded-xl bg-white px-5 text-sm font-bold uppercase tracking-wider text-accent">
              Отправить
            </button>
          </form>
          <p className="mt-3 text-[11px] opacity-70">
            Нажимая на кнопку, вы соглашаетесь с политикой конфиденциальности и обработкой персональных данных
          </p>
        </div>
      </div>
    </section>
  );
}

/* ================== BRAND BLOCK ================== */
function BrandBlock() {
  return (
    <section id="brand" className="relative overflow-hidden rounded-dh22">
      <Image src="https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/brand.jpg" alt="About brand" width={2400} height={1600} className="h-[70vh] w-full object-cover grayscale" />
      <div className="absolute right-10 top-10 max-w-md rounded-2xl bg-white/70 p-6 backdrop-blur">
        <div className="text-3xl font-bold text-accent">DH22</div>
        <p className="mt-3 text-sm leading-relaxed text-neutral-800">
          Наш бренд воплощает сдержанную элегантность и техническую точность посадки. Минимализм, чёткие линии и качественные ткани.
        </p>
        <a
          href="/about"
          className="mt-4 inline-block rounded-xl bg-accent px-5 py-3 text-sm font-bold uppercase tracking-wider text-white"
        >
          Подробнее о бренде
        </a>
      </div>
    </section>
  );
}

/* ================== INSTAGRAM DUMMY ================== */
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
      <h2 className="mb-8 mt-16 text-center text-6xl font-black uppercase tracking-tight text-accent">
        Follow us
      </h2>

      {/* Ник — кликабельная ссылка */}
      <p className="mb-6 text-center font-semibold text-neutral-500">
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

      <div className="grid grid-cols-2 gap-6 md:grid-cols-6">
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
            />
          </a>
        ))}
      </div>
    </section>
  );
}

export default async function Page() {
  const [latest, clothesRaw] = await Promise.all([
    getLatest(12),
    getClothes(12),
  ]);

  const clothes = clothesRaw.length ? clothesRaw : latest;
  
  return (
    <div className="grid gap-16">
    <Hero />
      <Bestsellers products={latest} />
      <AllItemsBanner />
      <CategorySplit />
      <ClothesGrid items={clothes} />
      <NewsletterCTA />
      <BrandBlock />
      <Instagram />
      <QuickNav />
        </div>
  );
}
  
