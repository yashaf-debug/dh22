// src/app/product/[slug]/ProductClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { rub } from '@/app/lib/money';
import type { Product } from '@/types/product';

export default function ProductClient({ product }: { product: Product }) {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const colors = Array.from(new Set(variants.filter(v => v.stock > 0).map(v => v.color)));
  const sizes = Array.from(new Set(variants.filter(v => v.stock > 0).map(v => v.size)));
  const [color, setColor] = useState<string | undefined>(colors[0]);
  const [size, setSize] = useState<string | undefined>(sizes[0]);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(1);
  }, [color, size]);

  const filteredSizes = color
    ? Array.from(new Set(variants.filter(v => v.color === color && v.stock > 0).map(v => v.size)))
    : sizes;
  const filteredColors = size
    ? Array.from(new Set(variants.filter(v => v.size === size && v.stock > 0).map(v => v.color)))
    : colors;
  const selected = variants.find(v => v.color === color && v.size === size);
  const maxQty = selected?.stock || 0;
  const primaryImage = product.main_image || product.gallery?.[0] || '';

  const addToCart = () => {
    if (!selected || !maxQty) return;
    const item = {
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: primaryImage,
      qty,
      color: color || null,
      size: size || null,
      sku: selected.sku || null,
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
    <div>
      <h1 className="text-3xl font-medium">{product.name}</h1>
      <div className="text-xl mt-2">{rub(product.price)}</div>
      {product.description && <p className="opacity-80 mt-4">{product.description}</p>}

      {filteredColors.length ? (
        <div className="mt-6">
          <div className="text-sm opacity-70 mb-1">Цвет</div>
          <select className="border px-2 py-2 w-full" value={color} onChange={e => setColor(e.target.value)}>
            {filteredColors.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {filteredSizes.length ? (
        <div className="mt-4">
          <div className="text-sm opacity-70 mb-1">Размер</div>
          <select className="border px-2 py-2 w-full" value={size} onChange={e => setSize(e.target.value)}>
            {filteredSizes.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {selected && <div className="mt-2 text-sm">В наличии: {selected.stock}</div>}

      <div className="mt-4">
        <div className="text-sm opacity-70 mb-1">Количество</div>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          className="border px-3 py-2 w-24"
          value={qty}
          min={1}
          max={maxQty}
          onChange={e => {
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
  );
}

