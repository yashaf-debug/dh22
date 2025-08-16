"use client";

import * as React from "react";
import Image from "next/image";
import { fmtRub } from "@/lib/normalize";

type Variant = { id: number; color: string; size: string; stock: number; sku?: string };
type Product = {
  id: number; slug: string; name: string; description?: string;
  price: number; care?: string; images: string[]; variants: Variant[];
};

export default function ProductClient({ product }: { product: Product }) {
  // ----- деривации из вариантов -----
  const colors = React.useMemo(
    () => Array.from(new Set(product.variants.map(v => v.color).filter(Boolean))),
    [product.variants]
  );
  const sizes = React.useMemo(
    () => Array.from(new Set(product.variants.map(v => v.size).filter(Boolean))),
    [product.variants]
  );

  // ----- выбранные параметры -----
  const [color, setColor] = React.useState<string>(colors[0] ?? "");
  const [size, setSize]   = React.useState<string>(sizes[0] ?? "");
  const [qty, setQty]     = React.useState<number>(1);
  const [tab, setTab]     = React.useState<"desc"|"care"|"size">("desc");
  const [adding, setAdding] = React.useState(false);

  // текущий вариант
  const variant = React.useMemo(
    () => product.variants.find(v => v.color === color && v.size === size),
    [product.variants, color, size]
  );

  const inStock = (variant?.stock ?? 0) > 0;
  const canAdd  = Boolean(variant?.id) && inStock && qty > 0;

  async function handleAdd() {
    if (!canAdd || !variant) return;
    try {
      setAdding(true);
      // подставьте ваш роут корзины/мутацию
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: product.slug,
          price: product.price,
          qty,
          color,
          size,
          variantId: variant.id,
        }),
      });
      // опционально обработаем ответ сервера
      if (res.ok) {
        const data = await res.json();
        console.log("Cart updated", data);
      }
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[1.2fr_1fr]">
      {/* ---------- ГАЛЕРЕЯ: обычные изображения, БЕЗ внутреннего скролла ---------- */}
      <div className="space-y-4">
        {product.images?.filter(Boolean).map((src, i) => (
          <div key={i} className="overflow-hidden rounded-dh22 bg-neutral-100">
            <Image
              src={src}
              alt={`${product.name} ${i + 1}`}
              width={1400}
              height={1750}
              className="h-auto w-full object-cover"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* ---------- САЙДБАР: прилипает при скролле страницы ---------- */}
      <aside className="md:sticky md:top-24">
        <div className="rounded-dh22 border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-1 text-2xl font-extrabold uppercase tracking-tight">
            {product.name}
          </div>
          <div className="mb-6 text-lg font-semibold text-neutral-900">
            {fmtRub(product.price)}
          </div>

          {/* цвет */}
          {colors.length > 0 && (
            <div className="mb-4">
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-500">Цвет</div>
              <div className="flex flex-wrap gap-2">
                {colors.map(c => {
                  const selected = c === color;
                  return (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      aria-pressed={selected}
                      className={`h-9 rounded-full border px-3 text-sm ${selected ? "border-accent bg-accent text-white" : "border-neutral-300 bg-white"}`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* размер */}
          {sizes.length > 0 && (
            <div className="mb-4">
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-500">Размер</div>
              <div className="flex flex-wrap gap-2">
                {sizes.map(s => {
                  const selected = s === size;
                  // есть ли вариант с таким размером и текущим цветом
                  const exists = product.variants.some(v => v.size === s && v.color === color && (v.stock ?? 0) > 0);
                  return (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      disabled={!exists}
                      aria-pressed={selected}
                      className={`h-9 rounded-full border px-3 text-sm ${selected ? "border-accent bg-accent text-white" : "border-neutral-300 bg-white"} ${!exists ? "opacity-40 line-through" : ""}`}
                      title={!exists ? "Нет в наличии" : ""}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* остаток + кол-во */}
          <div className="mb-4 flex items-center justify-between">
            <div className={`text-sm ${inStock ? "text-neutral-600" : "text-red-600"}`}>
              {inStock ? `В наличии: ${variant?.stock}` : "Нет в наличии"}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="h-8 w-8 rounded-md border text-lg"
                onClick={() => setQty(q => Math.max(1, q - 1))}
                aria-label="Уменьшить количество"
              >−</button>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={e => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="h-8 w-14 rounded-md border text-center"
              />
              <button
                className="h-8 w-8 rounded-md border text-lg"
                onClick={() => setQty(q => q + 1)}
                aria-label="Увеличить количество"
              >+</button>
            </div>
          </div>

          {/* добавить в корзину */}
          <button
            onClick={handleAdd}
            disabled={!canAdd || adding}
            className={`mb-5 h-11 w-full rounded-xl text-sm font-bold uppercase tracking-wider ${canAdd ? "bg-accent text-white hover:brightness-95" : "bg-neutral-200 text-neutral-500"}`}
          >
            {adding ? "Добавление..." : "Добавить в корзину"}
          </button>

          {/* вкладки */}
          <div className="flex gap-2">
            <TabBtn active={tab==="desc"} onClick={()=>setTab("desc")}>Описание</TabBtn>
            <TabBtn active={tab==="care"} onClick={()=>setTab("care")}>Состав и уход</TabBtn>
            <TabBtn active={tab==="size"} onClick={()=>setTab("size")}>Размерная сетка</TabBtn>
          </div>

          <div className="mt-4 text-[15px] leading-7 text-neutral-800">
            {tab === "desc" && <p>{product.description || "Описание отсутствует."}</p>}
            {tab === "care" && <p>{product.care || "Информация по уходу и составу будет добавлена."}</p>}
            {tab === "size" && (
              <div className="overflow-x-auto">
                {/* пример простой сетки (можете заменить вашей таблицей) */}
                <table className="w-full text-sm">
                  <thead className="text-left text-neutral-500">
                    <tr>
                      <th className="py-2 pr-4">Параметр</th>
                      <th className="py-2 pr-4">XS</th>
                      <th className="py-2 pr-4">S</th>
                      <th className="py-2 pr-4">M</th>
                      <th className="py-2">L</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="py-2 pr-4">Обхват груди</td><td className="py-2 pr-4">79–84</td><td className="py-2 pr-4">85–89</td><td className="py-2 pr-4">90–94</td><td className="py-2">95–99</td></tr>
                    <tr><td className="py-2 pr-4">Под грудью</td><td className="py-2 pr-4">65–70</td><td className="py-2 pr-4">70–75</td><td className="py-2 pr-4">75–80</td><td className="py-2">80–85</td></tr>
                    <tr><td className="py-2 pr-4">Талия</td><td className="py-2 pr-4">57–60</td><td className="py-2 pr-4">60–65</td><td className="py-2 pr-4">66–70</td><td className="py-2">71–75</td></tr>
                    <tr><td className="py-2 pr-4">Бёдра</td><td className="py-2 pr-4">86–90</td><td className="py-2 pr-4">90–94</td><td className="py-2 pr-4">95–98</td><td className="py-2">99–103</td></tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

function TabBtn({ active, onClick, children }:{active:boolean; onClick:()=>void; children:React.ReactNode}) {
  return (
    <button
      onClick={onClick}
      className={`h-9 rounded-full px-3 text-sm font-semibold ${active ? "bg-accent text-white" : "bg-neutral-100 text-neutral-800"}`}
    >
      {children}
    </button>
  );
}

