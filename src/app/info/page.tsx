import Image from "next/image";
import Footer from "@/components/layout/Footer";

export const runtime = "edge";

export const metadata = {
  title: "Инфо — DH22",
  description: "Доставка и оплата, возврат и обмен, контакты DH22.",
};

// Небольшой липкий чип-бар (якорные ссылки, без JS)
function ChipNav() {
  const items = [
    { href: "#shipping", label: "Доставка и оплата" },
    { href: "#returns", label: "Возврат и обмен" },
    { href: "#contacts", label: "Контакты" },
  ];
  return (
    <nav
      aria-label="Навигация по разделам"
      className="
        sticky top-16 z-20 mx-auto mt-[-3.25rem]
        w-[calc(100%-48px)] max-w-[1400px]
        overflow-x-auto rounded-full bg-white/70 px-2 py-2
        backdrop-blur shadow-[0_6px_30px_-10px_rgba(0,0,0,.25)]
      "
    >
      <ul className="flex gap-2">
        {items.map((i) => (
          <li key={i.href}>
            <a
              href={i.href}
              className="
                inline-block rounded-full px-4 py-2 text-sm font-bold uppercase
                tracking-wider text-neutral-700 hover:text-accent
              "
            >
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-6 mt-12 text-4xl font-black uppercase tracking-tight text-accent">
        {title}
      </h2>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] bg-neutral-100 p-6 leading-relaxed">
      {title && <div className="mb-3 text-lg font-semibold">{title}</div>}
      <div className="prose prose-neutral max-w-none text-[15px] leading-6">
        {children}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <div className="grid gap-10">
      {/* HERO */}
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden rounded-dh22">
        <Image
          src="https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/all-items.jpg"
          alt="DH22"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-6xl font-black uppercase tracking-[0.08em] text-white md:text-7xl">
            Info
          </h1>
        </div>
      </section>

      {/* Липкие чипы */}
      <ChipNav />

      {/* Контент */}
      <div className="mx-auto w-[calc(100%-48px)] max-w-[1400px]">
        {/* 1) Доставка и оплата — возьми текст с /delivery */}
        <Section id="shipping" title="Доставка и оплата">
          <Card title="По Москве">
            <ul>
              <li>Курьерская доставка в пределах МКАД (есть возможность примерки).</li>
              <li>Можно заказать до 5 изделий на выбор.</li>
              <li>
                Если вещи не подошли — оплачивается только стоимость доставки.
              </li>
              <li>
                При оформлении укажите удобные дату и время; заказы до 20:00 — на следующий день.
              </li>
            </ul>
            <p className="mt-3">
              Стоимость: с примеркой — <b>500 ₽</b>, без примерки — <b>400 ₽</b>.
            </p>
          </Card>

          <Card title="По России">
            <p>
              Доставка по всей России (службы доставки, напр. СДЭК). Стоимость и сроки
              рассчитываются в корзине в зависимости от адреса и веса заказа.
            </p>
            <p className="mt-3">Оплата: онлайн картой / СБП.</p>
          </Card>

          <Card title="Международная доставка">
            <p>
              Отправляем при 100% предоплате. Ориентировочные сроки: 4–10 дней
              (для стран СНГ — 3–10 дней).
            </p>
          </Card>
        </Section>

        {/* 2) Возврат и обмен — возьми текст с /returns */}
        <Section id="returns" title="Возврат и обмен">
          <Card title="Условия">
            <ul>
              <li>
                Срок возврата — 14 календарных дней с момента получения заказа.
              </li>
              <li>
                Товар должен быть без следов носки, с ярлыками и полной
                комплектацией.
              </li>
              <li>
                Возврат средств производится тем же способом, каким была
                произведена оплата.
              </li>
            </ul>
          </Card>
          <Card title="Как оформить">
            <ol>
              <li>Напишите на <b>info@dh22.ru</b> или в WhatsApp.</li>
              <li>Укажите номер заказа и причину возврата/обмена.</li>
              <li>Получите инструкции/этикетку и отправьте посылку.</li>
            </ol>
          </Card>
          <Card title="Исключения">
            <p>
              Индивидуально изготовленные и заметно использованные изделия к
              возврату не принимаются (ЗоЗПП).
            </p>
          </Card>
        </Section>

        {/* 3) Контакты — из футера */}
        <Section id="contacts" title="Контакты">
          <Card>
            <p>
              Email:{" "}
              <a className="underline" href="mailto:info@dh22.ru">
                info@dh22.ru
              </a>
              <br />
              Instagram:{" "}
              <a
                className="underline"
                href="https://instagram.com/dh22_am"
                target="_blank"
                rel="noreferrer"
              >
                @dh22_am
              </a>
              <br />
              WhatsApp:{" "}
              <a
                className="underline"
                href="https://wa.me/79995952225"
                target="_blank"
                rel="noreferrer"
              >
                +7 916 563-06-33
              </a>
            </p>
            <p className="mt-3">Мы на связи ежедневно, 10:00–20:00 (МСК).</p>
          </Card>
          <Card title="Юридическая информация">
            <p>
              Подробности ищите внизу сайта: Доставка, Возврат, Политика
              конфиденциальности, Пользовательское соглашение, Договор-оферта.
            </p>
          </Card>
        </Section>
      </div>

      {/* Футер */}
      <Footer />
    </div>
  );
}

