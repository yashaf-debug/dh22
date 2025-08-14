"use client";

import { useEffect, useState } from "react";
import { evViewItem, evAddToCart } from "@/app/lib/metrics";

type Props = {
  product: { slug:string; name:string; price:number; category?:string };
};

export default function ProductClient({ product }: Props) {
  const [qty, setQty] = useState(1);

  useEffect(()=>{
    evViewItem({
      id: product.slug,
      name: product.name,
      price: product.price / 100,
      category: product.category,
    });
  }, [product.slug]);

  const addToCart = () => {
    evAddToCart({
      id: product.slug,
      name: product.name,
      price: product.price / 100,
      qty,
    });
    // logic of adding to cart
    try {
      const raw = localStorage.getItem('dh22_cart');
      const cart = raw ? JSON.parse(raw) : [];
      const existing = cart.find((i:any)=> i.slug===product.slug);
      if (existing) existing.qty += qty; else cart.push({ slug: product.slug, name: product.name, price: product.price, qty });
      localStorage.setItem('dh22_cart', JSON.stringify(cart));
      alert('Товар добавлен в корзину');
    } catch {}
  };

  return (
    <div>
      <h1 className="text-2xl mb-2">{product.name}</h1>
      <div className="opacity-70 mb-4">{(product.price/100).toLocaleString()} ₽</div>

      <label className="block text-sm mb-1">Количество</label>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={qty}
        onChange={(e)=>{
          const v = e.target.value.replace(/\D/g, "");
          setQty(v === "" ? 1 : Math.max(1, parseInt(v, 10)));
        }}
        className="border px-3 py-2 rounded w-24"
      />

      <button onClick={addToCart} className="btn-primary mt-4">В корзину</button>
    </div>
  );
}
