"use client";
import { useState, useEffect, type ReactNode } from "react";
import { useFavorites } from '@/store/favorites';
import { useUI } from '@/store/ui';

function Pill({children, onClick}:{children:ReactNode; onClick:()=>void}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border bg-white/90 px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur hover:bg-white"
    >
      {children}
    </button>
  );
}

export function FavoritesButton() {
  const count = useFavorites((s) => s.count());
  const open = useUI((s) => s.openFavs);
  return (
    <Pill onClick={open}>
      <span className="i-heart" aria-hidden />
      Избранное <span className="rounded-full bg-neutral-900 px-2 py-[2px] text-xs text-white">{count()}</span>
    </Pill>
  );
}

export function CartButton() {
  const open = useUI((s) => s.openCart);
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = () => {
      try {
        const raw = localStorage.getItem('dh22_cart');
        const arr = raw ? JSON.parse(raw) : [];
        const total = Array.isArray(arr) ? arr.reduce((s: number, i: any) => s + (i.qty || 1), 0) : 0;
        setCount(total);
      } catch {
        setCount(0);
      }
    };
    update();
    window.addEventListener('storage', update);
    window.addEventListener('cart_updated', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('cart_updated', update);
    };
  }, []);
  return (
    <Pill onClick={open}>
      <span className="i-bag" aria-hidden />
      Корзина <span className="rounded-full bg-neutral-900 px-2 py-[2px] text-xs text-white">{count}</span>
    </Pill>
  );
}
