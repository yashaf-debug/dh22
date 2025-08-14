// src/app/product/[slug]/ProductClient.tsx
'use client';

import { useState } from 'react';
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
};

export default function ProductClient({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState<string | undefined>(product.colors?.[0]);
  const [size, setSize] = useState<string | undefined>(product.sizes?.[0]);

  const addToCart = () => {
    const item = {
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.main_image,
      qty,
      color: color || null,
      size: size || null,
    };
    try {
      const raw = localStorage.getItem('dh22_cart');
      const cart = raw ? JSON.parse(raw) : [];
      const existing = cart.find((i: any) => i.slug === item.slug && i.color === item.color && i.size === item.size);
      if (existing) {
        existing.qty += qty;
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

  const src = r2Url(product.main_image) || '/images/placeholder.png';

  return (
    <div key={product.id} className="grid md:grid-cols-[1fr_1fr] gap-8">
      <div>
        <img
          src={src}
          alt={`Фото «${product.name}»`}
          loading="lazy"
          decoding="async"
          className="product-img"
        />
      </div>

      <div>
        <h1 className="text-3xl font-medium">{product.name}</h1>
        <div className="text-xl mt-2">{rub(product.price)}</div>
        {product.description && <p className="opacity-80 mt-4">{product.description}</p>}

        {product.colors?.length ? (
          <div className="mt-6">
            <div className="text-sm opacity-70 mb-1">Цвет</div>
            <select className="border px-2 py-2 w-full" value={color} onChange={e => setColor(e.target.value)}>
              {product.colors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        ) : null}

        {product.sizes?.length ? (
          <div className="mt-4">
            <div className="text-sm opacity-70 mb-1">Размер</div>
            <select className="border px-2 py-2 w-full" value={size} onChange={e => setSize(e.target.value)}>
              {product.sizes.map(s => <option key={s} value={s}>{s}</option>)}
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
            onChange={(e) =>
              setQty(Math.max(1, Number(e.target.value.replace(/\D/g, '')) || 1))
            }
          />
        </div>

        <button className="mt-6 bg-black text-white px-4 py-3" onClick={addToCart}>
          В корзину
        </button>
      </div>
    </div>
  );
}

