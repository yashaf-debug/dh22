// src/components/layout/Footer.tsx
import Link from "next/link";

const year = new Date().getFullYear();

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-white/90">
      {title}
    </div>
    <ul className="space-y-3 text-[15px] leading-6 text-white/80">
      {children}
    </ul>
  </div>
);

export default function Footer() {
  return (
    <footer className="relative mt-20 w-full">
      {/* фон: тёмный -> фиолетовый акцент, мягкие углы контейнера */}
     <div
  className="
    relative mx-auto w-[calc(100%-48px)] max-w-[1400px]
    overflow-hidden rounded-[28px]
    bg-gradient-to-tr from-[#7B61FF] via-[#6C4EF6] to-[#5C49D9]
  "
>
        {/* водяной знак DH22 слева (Oswald/condensed, очень прозрачно) */}
      <span
    aria-hidden
    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 select-none text-[28vw] leading-none font-extrabold uppercase tracking-[-0.06em] text-white/10"
    style={{ fontFamily: "Oswald, Inter, system-ui, sans-serif" }}
  >
    DH22
  </span>

        {/* Контент */}
       <div className="relative grid gap-10 px-8 py-12 sm:px-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:gap-16 lg:px-14 lg:py-16">
          {/* Колонка: Каталог */}
          <Section title="Каталог">
            <li><Link href="/new" className="hover:text-white">Новинки</Link></li>
            <li><Link href="/catalog/clothes" className="hover:text-white">Одежда</Link></li>
            <li><Link href="/catalog/accessories" className="hover:text-white">Аксессуары</Link></li>
            <li><Link href="/bestsellers" className="hover:text-white">Bestsellers</Link></li>
          </Section>

          {/* Колонка: Покупателям */}
          <Section title="Покупателям">
            <li><Link href="/about" className="hover:text-white">О бренде</Link></li>
            <li><Link href="/info" className="hover:text-white">Информация</Link></li>
            <li><Link href="/delivery" className="hover:text-white">Оплата и доставка</Link></li>
            <li><Link href="/gift-card" className="hover:text-white">Gift Card</Link></li>
          </Section>

          {/* Колонка: Контакты */}
          <Section title="Контакты">
            <li>
              <a href="mailto:info@dh22.ru" className="hover:text-white">
                info@dh22.ru
              </a>
            </li>
            <li>
              <a href="https://instagram.com/dh22_am" target="_blank" rel="noreferrer" className="hover:text-white">
                Instagram @dh22_am
              </a>
            </li>
            <li>
              <a href="https://wa.me/79995952225" target="_blank" rel="noreferrer" className="hover:text-white">
                WhatsApp
              </a>
            </li>
          </Section>

          {/* Колонка: Промо-карточка (опционально — статичное изображение/баннер) */}
          <div className="hidden lg:block">
            <div className="rounded-[24px] bg-neutral-800/60 p-2">
              <img
                src="https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/DH22_inst.png"
                alt=""
                className="aspect-[3/4] w-full rounded-[20px] object-cover"
              />
            </div>
          </div>
        </div>

        {/* Линия + юридический блок */}
      <div className="relative border-t border-white/20 px-8 py-6 text-xs text-white/80 sm:px-10 lg:px-14">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-x-4">
              <span>© {year} DH22</span>
              <span className="text-neutral-500">Все права защищены</span>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              <li><Link href="/delivery" className="hover:text-white">Доставка</Link></li>
              <li><Link href="/returns" className="hover:text-white">Возврат</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Политика конфиденциальности</Link></li>
              <li><Link href="/terms" className="hover:text-white">Пользовательское соглашение</Link></li>
              <li><Link href="/offer" className="hover:text-white">Договор-оферта</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

