'use client';
import { useState, useEffect } from 'react';
import { track } from '@/app/lib/analytics';

export default function AddToCart({ product }) {
  const [size, setSize] = useState((product.sizes && product.sizes[0]) || '');
  const [color, setColor] = useState((product.colors && product.colors[0]) || '');
  const maxQty = Math.max(1, Number(product?.quantity ?? 99));
  const [qtyInput, setQtyInput] = useState("1");

  useEffect(() => {
    track.view_item({ id: product.slug, name: product.name, price: product.price / 100, category: product.category });
  }, [product]);

  function onQtyChange(e) {
    const digits = e.target.value.replace(/[^\d]/g, "");
    setQtyInput(digits);
  }

  function normalizeQty(v) {
    let n = parseInt(v, 10);
    if (!Number.isFinite(n) || n < 1) n = 1;
    if (n > maxQty) n = maxQty;
    return String(n);
  }

  function onQtyBlur() {
    setQtyInput(prev => normalizeQty(prev));
  }

  function inc() {
    setQtyInput(p => normalizeQty(String((parseInt(p || "1", 10) || 1) + 1)));
  }

  function dec() {
    setQtyInput(p => normalizeQty(String((parseInt(p || "1", 10) || 1) - 1)));
  }

  function add() {
    const normalized = normalizeQty(qtyInput);
    setQtyInput(normalized);
    const qty = parseInt(normalized, 10);
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
    track.add_to_cart({ id: product.slug, name: product.name, price: product.price / 100, qty });
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
        <button type="button" onClick={dec} className="border px-2 py-1">–</button>
        <input
          type="text"
          inputMode="numeric"
          pattern="\d*"
          className="border px-2 py-1 w-24"
          value={qtyInput}
          onChange={onQtyChange}
          onBlur={onQtyBlur}
          min={1}
          max={product.quantity}
        />
        <button type="button" onClick={inc} className="border px-2 py-1">+</button>
      </div>
      <button className="btn btn-primary" onClick={add} disabled={product.quantity <= 0}>
        Добавить в корзину
      </button>
    </div>
  );
}
