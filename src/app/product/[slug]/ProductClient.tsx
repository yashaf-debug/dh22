"use client";

import * as React from "react";
import Image from "next/image";
import ProductTabs from "@/components/product/ProductTabs";
import { fmtRub } from "@/lib/normalize";
import FavHeart from "@/components/favorites/FavHeart";

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
          name: product.name,
          image: product.images[0] || "",
        }),
      });
      // опционально обработаем ответ сервера
      if (res.ok) {
        const data = await res.json();
        try {
          localStorage.setItem("dh22_cart", JSON.stringify(data.cart));
          window.dispatchEvent(new Event('cart_updated'));
        } catch (err) {
          console.error("Failed to save cart", err);
        }
        alert("Товар добавлен в корзину");
        console.log("Cart updated", data);
      }
    } finally {
      setAdding(false);
    }
  }

  const AddButton = ({ className = "" }) => (
    <button
      onClick={handleAdd}
      disabled={!canAdd || adding}
      className={`h-11 rounded-xl text-sm font-bold uppercase tracking-wider ${canAdd ? "bg-accent text-white hover:brightness-95" : "bg-neutral-200 text-neutral-500"} ${className}`}
    >
      {adding ? "Добавление..." : "Добавить в корзину"}
    </button>
  );

  return (
    <div className="pb-16 md:pb-0">
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[1.2fr_1fr]">
        {/* ---------- ГАЛЕРЕЯ: горизонтальный свайп ---------- */}
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto md:block md:space-y-4 md:overflow-visible md:snap-none md:gap-0">
          {product.images?.filter(Boolean).map((src, i) => (
            <div key={i} className="w-full shrink-0 snap-center overflow-hidden rounded-dh22 bg-neutral-100 md:w-auto md:shrink md:snap-none">
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
          <div className="relative rounded-dh22 border border-neutral-200 bg-white p-5 shadow-sm">
            <FavHeart item={{ id: product.id, slug: product.slug, title: product.name, price_cents: product.price, cover_url: product.images[0] || '' }} className="absolute right-4 top-4" />
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
            <AddButton className="mb-5 hidden w-full md:block" />

            <ProductTabs
              description={product.description || "Описание отсутствует."}
              care={product.care || ""}
            />
          </div>
        </aside>
      </div>

      {/* липкая кнопка на мобильных */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white p-4 shadow-[0_-1px_5px_rgba(0,0,0,0.1)] md:hidden">
        <AddButton className="w-full" />
      </div>
    </div>
  );
}
