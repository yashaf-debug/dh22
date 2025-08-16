// src/app/info/page.tsx
"use client";

import Image from "next/image";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Информация — DH22",
  description: "Доставка и оплата, возврат и обмен, контакты DH22",
};

const ACCENT = "#7B61FF";

type TabKey = "delivery" | "returns" | "contacts";

function Hero() {
  return (
    <section className="relative h-[48vh] min-h-[300px] w-full overflow-hidden rounded-dh22">
      <Image
        src="https://pub-6ad97d4d0259415a86c3a713bb4c4bc2.r2.dev/all-items.jpg"
        alt="DH22 — Информация"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-5xl font-black uppercase tracking-tight text-white sm:text-7xl">
          Info
        </h1>
      </div>
    </section>
  );
}

function Tabs({
  value,
  onChange,
}: {
  value: TabKey;
  onChange: (t: TabKey) => void;
}) {
  const items: { key: TabKey; label: string }[] = [
    { key: "delivery", label: "Доставка и оплата" },
    { key: "returns", label: "Возврат и обмен" },
    { key: "contacts", label: "Контакты" },
  ];

  return (
    <div
      className="sticky top-3 z-30 mx-auto mt-4 w-[calc(100%-48px)] max-w-[1400px] rounded-full bg-white/80 p-1 shadow-lg backdrop-blur"
      role="tablist"
      aria-label="Информация DH22"
    >
      <div className="grid grid-cols-3 gap-1">
        {items.map((it) => {
          const active = it.key === value;
          return (
            <button
              key={it.key}
              role="tab"
              aria-selected={active}
              aria-controls={`panel-${it.key}`}
              onClick={() => onChange(it.key)}
              className="h-12 rounded-full px-4 text-sm font-semibold uppercase tracking-wide transition-colors"
              style={{
                backgroundColor: active ? ACCENT : "transparent",
                color: active ? "#fff" : "#111",
              }}
            >
              {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-neutral-100 p-6 shadow-sm">
      {children}
    </div>
  );
}

function Delivery() {
  return (
    <section
      id="panel-delivery"
      role="tabpanel"
      aria-labelledby="delivery"
      className="space-y-6"
    >
      <h2
        className="text-4xl font-black uppercase tracking-tight"
        style={{ color: ACCENT }}
      >
        Доставка и оплата
      </h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <h3 className="mb-2 text-xl font-bold">По Москве</h3>
          <p>Курьерская доставка в пределах МКАД (есть возможность примерки).</p>
          <p className="mt-2">Можно заказать до 5 изделий на выбор.</p>
          <p className="mt-2">
            Если вещи не подошли — оплачивается только стоимость доставки.
          </p>
          <p className="mt-2">
            При оформлении заказа укажите удобные дату и время; заказы до 20:00 — на следующий день.
          </p>
          <p className="mt-3">
            Стоимость: с примеркой — <b>500 ₽</b>, без примерки — <b>400 ₽</b>.
          </p>
        </Card>

        <Card>
          <h3 className="mb-2 text-xl font-bold">По России</h3>
          <p>
            Доставка по всей России (службы доставки, напр. СДЭК). Стоимость и
            сроки рассчитываются в корзине в зависимости от адреса и веса
            заказа.
          </p>
          <p className="mt-2">Оплата: онлайн картой / СБП.</p>
        </Card>

        <Card>
          <h3 className="mb-2 text-xl font-bold">Международная доставка</h3>
          <p>Отправляем при 100% предоплате.</p>
          <p className="mt-2">
            Ориентировочные сроки: 4–10 дней. Для стран СНГ — 3–10 дней.
          </p>
        </Card>
      </div>
    </section>
  );
}

function Returns() {
  return (
    <section
      id="panel-returns"
      role="tabpanel"
      aria-labelledby="returns"
      className="space-y-6"
    >
      <h2
        className="text-4xl font-black uppercase tracking-tight"
        style={{ color: ACCENT }}
      >
        Возврат и обмен
      </h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <h3 className="mb-2 text-xl font-bold">Условия</h3>
          <ul className="list-disc space-y-2 pl-5">
            <li>Срок возврата — <b>14 календарных дней</b> с момента получения.</li>
            <li>Товар должен быть в надлежащем виде: без следов носки, с ярлыками.</li>
            <li>Деньги возвращаем тем же способом, которым была оплата.</li>
          </ul>
        </Card>

        <Card>
          <h3 className="mb-2 text-xl font-bold">Как оформить</h3>
          <p>
            Напишите нам на{" "}
            <a
              href="mailto:info@dh22.ru"
              className="underline"
              style={{ color: ACCENT }}
            >
              info@dh22.ru
            </a>{" "}
            или в{" "}
            <a
              href="https://wa.me/79165630633"
              target="_blank"
              rel="noreferrer"
              className="underline"
              style={{ color: ACCENT }}
            >
              WhatsApp
            </a>
            . Укажите номер заказа, ФИО и причину возврата/обмена.
          </p>
        </Card>

        <Card>
          <h3 className="mb-2 text-xl font-bold">Исключения</h3>
          <p>
            Индивидуально изготовленные и заметно использованные товары обмену и
            возврату не подлежат (при наличии следов носки/повреждений/без
            ярлыков).
          </p>
        </Card>
      </div>
    </section>
  );
}

function Contacts() {
  return (
    <section
      id="panel-contacts"
      role="tabpanel"
      aria-labelledby="contacts"
      className="space-y-6"
    >
      <h2
        className="text-4xl font-black uppercase tracking-tight"
        style={{ color: ACCENT }}
      >
        Контакты
      </h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <h3 className="mb-2 text-xl font-bold">Email</h3>
          <a
            href="mailto:info@dh22.ru"
            className="font-medium underline"
            style={{ color: ACCENT }}
          >
            info@dh22.ru
          </a>
        </Card>

        <Card>
          <h3 className="mb-2 text-xl font-bold">Instagram</h3>
          <a
            href="https://instagram.com/dh22_am"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline"
            style={{ color: ACCENT }}
          >
            @dh22_am
          </a>
        </Card>

        <Card>
          <h3 className="mb-2 text-xl font-bold">WhatsApp</h3>
          <a
            href="https://wa.me/79165630633"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline"
            style={{ color: ACCENT }}
          >
            +7 916 563-06-33
          </a>
        </Card>
      </div>
    </section>
  );
}

export default function InfoPage() {
  const [tab, setTab] = React.useState<TabKey>("delivery");

  return (
    <main className="mx-auto mb-16 mt-6 grid w-[calc(100%-48px)] max-w-[1400px] gap-8">
      <Hero />

      <Tabs value={tab} onChange={setTab} />

      {/* Контент табов */}
      <div className="mx-auto w-full max-w-[1400px] space-y-12 rounded-dh22">
        {tab === "delivery" && <Delivery />}
        {tab === "returns" && <Returns />}
        {tab === "contacts" && <Contacts />}
      </div>
        <Footer />
    </main>
  );
}
