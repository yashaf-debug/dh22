// src/components/layout/Footer.tsx
import Link from "next/link";

const year = new Date().getFullYear();

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <div className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-neutral-900">
      {title}
    </div>
    <ul className="space-y-3 text-[15px] leading-6 text-neutral-700">
      {children}
    </ul>
  </div>
);

export default function Footer() {
  return (
    <footer className="relative mt-20 w-full">
      {/* фон: тёмный -> фиолетовый акцент, мягкие углы контейнера */}
      <div className="relative mx-auto w-[calc(100%-48px)] max-w-[1400px] overflow-hidden rounded-[28px] bg-gradient-to-tr from-neutral-900 via-black to-[#191622]">
        {/* водяной знак DH22 слева (Oswald/condensed, очень прозрачно) */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 select-none text-[28vw] leading-none font-extrabold uppercase tracking-[-0.06em] text-white/5"
          style={{ fontFamily: "Oswald, Inter, system-ui, sans-serif" }}
        >
          DH22
        </span>

        {/* Контент */}
        <div className="relative grid gap-10 px-8 py-12 sm:px-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:gap-16 lg:px-14 lg:py-16">
          {/* Колонка: Каталог */}
          <Section title="Каталог">
            <li><Link href="/new" className="hover:text-[#6C4EF6]">Новинки</Link></li>
            <li><Link href="/catalog/clothes" className="hover:text-[#6C4EF6]">Одежда</Link></li>
            <li><Link href="/catalog/accessories" className="hover:text-[#6C4EF6]">Аксессуары</Link></li>
            <li><Link href="/bestsellers" className="hover:text-[#6C4EF6]">Bestsellers</Link></li>
            <li><Link href="/sale" className="hover:text-[#6C4EF6]">Sale</Link></li>
          </Section>

          {/* Колонка: Покупателям */}
          <Section title="Покупателям">
            <li><Link href="/about" className="hover:text-[#6C4EF6]">О бренде</Link></li>
            <li><Link href="/info" className="hover:text-[#6C4EF6]">Информация</Link></li>
            <li><Link href="/delivery" className="hover:text-[#6C4EF6]">Оплата и доставка</Link></li>
            <li><Link href="/gift-card" className="hover:text-[#6C4EF6]">Gift Card</Link></li>
          </Section>

          {/* Колонка: Контакты */}
          <Section title="Контакты">
            <li>
              <a href="mailto:hello@dh22.ru" className="hover:text-[#6C4EF6]">
                hello@dh22.ru
              </a>
            </li>
            <li>
              <a href="https://instagram.com/dh22_am" target="_blank" rel="noreferrer" className="hover:text-[#6C4EF6]">
                Instagram @dh22_am
              </a>
            </li>
            <li>
              <a href="https://wa.me/79990000000" target="_blank" rel="noreferrer" className="hover:text-[#6C4EF6]">
                WhatsApp
              </a>
            </li>
          </Section>

          {/* Колонка: Промо-карточка (опционально — статичное изображение/баннер) */}
          <div className="hidden lg:block">
            <div className="rounded-[24px] bg-neutral-800/60 p-2">
              <img
                src="/images/footer-card.jpg"
                alt=""
                className="aspect-[3/4] w-full rounded-[20px] object-cover"
              />
            </div>
          </div>
        </div>

        {/* Линия + юридический блок */}
        <div className="relative border-t border-white/10 px-8 py-6 text-xs text-neutral-400 sm:px-10 lg:px-14">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-x-4">
              <span>© {year} DH22</span>
              <span className="text-neutral-500">Все права защищены</span>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              <li><Link href="/delivery" className="hover:text-[#6C4EF6]">Доставка</Link></li>
              <li><Link href="/returns" className="hover:text-[#6C4EF6]">Возврат</Link></li>
              <li><Link href="/privacy" className="hover:text-[#6C4EF6]">Политика конфиденциальности</Link></li>
              <li><Link href="/terms" className="hover:text-[#6C4EF6]">Пользовательское соглашение</Link></li>
              <li><Link href="/offer" className="hover:text-[#6C4EF6]">Договор-оферта</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

