// src/app/about/page.tsx
import Image from "next/image";
import { canonical } from "@/lib/seo";

export const runtime = "edge";

export const metadata = {
  title: "О бренде",
  description:
    "DH22 — бренд, созданный девушкой для девушек: сильные линии, чистые силуэты, уверенный характер.",
  alternates: { canonical: canonical("/about") },
};

/* =============== HERO =============== */
function HeroAbout() {
  return (
    <section className="relative h-[78vh] min-h-[520px] overflow-hidden rounded-dh22">
      <Image
        src="https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/all-items.jpg"
        alt="Геро-баннер DH22"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-[10vw] leading-none text-white md:text-8xl lg:text-9xl font-black uppercase tracking-[-0.02em]">
          About us
        </h1>
      </div>
    </section>
  );
}

/* =============== STORY =============== */
function StoryBlock() {
  return (
    <section className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:gap-12">
      {/* Текст */}
      <div className="order-2 md:order-1">
        <h2 className="mb-6 text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-accent">
          DH22 — создано девушкой для девушек.
          <br className="hidden md:block" />
          Сильные линии. Чистый силуэт. Уверенный характер.
        </h2>

        <div className="space-y-4 text-[15px] leading-7 text-neutral-800">
          <p>
            DH22 родился из маленькой мастерской и большой амбиции — делать
            вещи, которые сидят безупречно и не теряют актуальности через сезон.
            Основательница бренда — талантливая девушка, которая начала с пары
            образцов, отшитых для подруг, а превратила это в капсулы для
            стильных и смелых девушек.
          </p>
          <p>
            Мы выбираем плотные приятные ткани, тщательно выверяем посадку и
            оставляем только то, что работает на линию и форму. Здесь нет
            громких логотипов — вместо них точность кроя, аккуратные
            конструктивные детали и баланс пропорций.
          </p>
          <p>
            Коллекции DH22 создаются небольшими тиражами, чтобы сохранять
            уникальность, качество и внимание к каждой вещи. Каждая модель легко
            сочетается с другой — это капсулы на каждый день и на особые
            случаи, когда нужно выглядеть ярко без лишнего шума.
          </p>
          <p>
            Число <strong>22</strong> в ДНК бренда — про совпадение ритмов и
            уверенность в себе: тот самый момент, когда всё сходится. DH22 — о
            свободе движений, честной красоте и силе женственности.
          </p>
        </div>

        <a
          href="/catalog/clothes"
          className="mt-8 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wider text-white"
        >
          В каталог
        </a>
      </div>

      {/* Изображение справа */}
      <div className="order-1 md:order-2 overflow-hidden rounded-dh22">
        <Image
          src="https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/brand.jpg"
          alt="DH22 — эстетика бренда"
          width={1600}
          height={2000}
          className="h-full w-full object-cover"
          priority={false}
        />
      </div>
    </section>
  );
}

/* =============== INSTAGRAM (как на главной) =============== */
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
      <h3 className="mb-2 mt-16 text-center text-5xl md:text-6xl font-black uppercase tracking-tight text-accent">
        Follow us
      </h3>
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

      <div className="grid grid-cols-2 gap-4 md:grid-cols-6 md:gap-6">
        {imgs.map((src, i) => (
          <a
            key={i}
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Открыть Instagram DH22"
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

/* =============== PAGE =============== */
export default function Page() {
  return (
    <div className="grid gap-16">
      <HeroAbout />
      <StoryBlock />
      <Instagram />
    </div>
  );
}
