'use client';
import { useState } from 'react';

export default function AddToCart({ product }) {
  const [size, setSize] = useState((product.sizes && product.sizes[0]) || '');
  const [color, setColor] = useState((product.colors && product.colors[0]) || '');
  const [qty, setQty] = useState(1);

  function add() {
    let cart = [];
    try {
      const raw = localStorage.getItem('dh22_cart');
      cart = raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error('Failed to read cart, resetting', err);
      try {
        localStorage.removeItem('dh22_cart');
      } catch (err2) {
        console.error('Failed to clear corrupt cart', err2);
      }
    }

    const existing = cart.find(i => i.slug === product.slug && i.size === size && i.color === color);
    if (existing) existing.qty += qty;
    else cart.push({ slug: product.slug, name: product.name, price: product.price, image: product.images[0], size, color, qty });

    try {
      localStorage.setItem('dh22_cart', JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to update cart in storage', err);
    }
    alert('Товар добавлен в корзину');
  }

  return (
    <div className="flex flex-col gap-3 mt-4">
      {Array.isArray(product.sizes) && product.sizes.length > 0 && (
        <div className="flex gap-2 items-center">
          <span className="text-sm w-20">Размер</span>
          <select className="border px-2 py-1" value={size} onChange={e => setSize(e.target.value)}>
            {product.sizes.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      )}
      {Array.isArray(product.colors) && product.colors.length > 0 && (
        <div className="flex gap-2 items-center">
          <span className="text-sm w-20">Цвет</span>
          <select className="border px-2 py-1" value={color} onChange={e => setColor(e.target.value)}>
            {product.colors.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      )}
      <div className="flex gap-2 items-center">
        <span className="text-sm w-20">Кол-во</span>
        <input type="number" min={1} className="border px-2 py-1 w-24" value={qty} onChange={e => setQty(parseInt(e.target.value) || 1)} />
      </div>
      <button className="btn btn-primary" onClick={add}>Добавить в корзину</button>
    </div>
  );
}
