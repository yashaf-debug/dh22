// src/app/product/[slug]/ProductClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { r2Url } from '@/lib/r2';
import { rub } from '@/app/lib/money';

type Product = {
  id: number;
  slug: string;
  name: string;
  price: number;
  description?: string | null;
  colors?: string[] | null;
  sizes?: string[] | null;
  main_image?: string | null;
  images?: string[] | null;
};

type Variant = { id: number; color: string; size: string; stock: number; sku?: string|null };

export default function ProductClient({ product, variants }: { product: Product; variants: Variant[] }) {
  const gallery: string[] = Array.isArray(product.images) ? product.images : [];
  const pics = [product.main_image, ...gallery].filter(Boolean) as string[];
  const uniquePics = pics.filter((p, i, arr) => arr.indexOf(p) === i);
  const [active, setActive] = useState(0);

  const colors = Array.from(new Set(variants.filter(v=>v.stock>0).map(v=>v.color)));
  const sizes = Array.from(new Set(variants.filter(v=>v.stock>0).map(v=>v.size)));
  const [color, setColor] = useState<string | undefined>(colors[0]);
  const [size, setSize] = useState<string | undefined>(sizes[0]);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(1);
  }, [color, size]);

  const filteredSizes = color ? Array.from(new Set(variants.filter(v=>v.color===color && v.stock>0).map(v=>v.size))) : sizes;
  const filteredColors = size ? Array.from(new Set(variants.filter(v=>v.size===size && v.stock>0).map(v=>v.color))) : colors;
  const selected = variants.find(v => v.color === color && v.size === size);

  const maxQty = selected?.stock || 0;

  const addToCart = () => {
    if (!selected || !maxQty) return;
    const item = {
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: uniquePics[0],
      qty,
      color: color || null,
      size: size || null,
      variantId: selected.id,
      productId: product.id,
    };
    try {
      const raw = localStorage.getItem('dh22_cart');
      const cart = raw ? JSON.parse(raw) : [];
      const existing = cart.find((i: any) => i.variantId === item.variantId);
      if (existing) {
        existing.qty = Math.min(maxQty, existing.qty + qty);
      } else {
        cart.push(item);
      }
      localStorage.setItem('dh22_cart', JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to update cart', err);
      alert('Не удалось добавить в корзину');
      return;
    }
    location.href = '/cart';
  };

  return (
    <div key={product.id} className="grid md:grid-cols-[1fr_1fr] gap-8">
      <div className="pdp-gallery">
        <div className="pdp-main">
          {uniquePics[active] && <img src={r2Url(uniquePics[active])} alt={product.name} className="product-img" />}
        </div>
        {uniquePics.length > 1 && (
          <div className="pdp-thumbs">
            {uniquePics.map((p, i) => (
              <button
                key={i}
                className={i === active ? 'thumb active' : 'thumb'}
                onClick={() => setActive(i)}
              >
                <img src={r2Url(p)} alt={`thumb ${i + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-medium">{product.name}</h1>
        <div className="text-xl mt-2">{rub(product.price)}</div>
        {product.description && <p className="opacity-80 mt-4">{product.description}</p>}

        {filteredColors.length ? (
          <div className="mt-6">
            <div className="text-sm opacity-70 mb-1">Цвет</div>
            <select className="border px-2 py-2 w-full" value={color} onChange={e => setColor(e.target.value)}>
              {filteredColors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        ) : null}

        {filteredSizes.length ? (
          <div className="mt-4">
            <div className="text-sm opacity-70 mb-1">Размер</div>
            <select className="border px-2 py-2 w-full" value={size} onChange={e => setSize(e.target.value)}>
              {filteredSizes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ) : null}

        <div className="mt-4">
          <div className="text-sm opacity-70 mb-1">Количество</div>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            className="border px-3 py-2 w-24"
            value={qty}
            max={maxQty}
            onChange={(e) => {
              const val = Number(e.target.value.replace(/\D/g, '')) || 1;
              setQty(Math.max(1, Math.min(maxQty, val)));
            }}
          />
        </div>

        <button
          className="mt-6 bg-black text-white px-4 py-3"
          onClick={addToCart}
          disabled={!selected || maxQty === 0}
        >
          В корзину
        </button>
      </div>
    </div>
  );
}

