"use client";
import { useEffect, useState } from "react";
import { rub } from "../lib/money";

export default function CartPage() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('dh22_cart');
      setCart(raw ? JSON.parse(raw) : []);
    } catch (err) {
      console.error('Failed to load cart, resetting', err);
      setCart([]);
      try {
        localStorage.removeItem('dh22_cart');
      } catch (err2) {
        console.error('Failed to clear corrupt cart', err2);
      }
    }
  }, []);

  const total = cart.reduce((s,i)=> s + i.price * i.qty, 0);

  function remove(idx){
    const next = cart.slice();
    next.splice(idx, 1);
    setCart(next);
    try {
      localStorage.setItem('dh22_cart', JSON.stringify(next));
    } catch (err) {
      console.error('Failed to update cart in storage', err);
    }
  }

  function clear() {
    setCart([]);
    try {
      localStorage.removeItem('dh22_cart');
    } catch (err) {
      console.error('Failed to clear cart from storage', err);
    }
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl mb-6">Корзина</h1>
      {!cart.length && <div>Корзина пуста.</div>}
      {cart.length>0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2 flex flex-col gap-4">
            {cart.map((i,idx)=>(
              <div key={idx} className="flex items-center gap-4 border-b pb-4">
                <img src={i.image} className="w-24 h-32 object-cover border" alt={i.name} />
                <div className="flex-1">
                  <div className="text-sm">{i.name}</div>
                  <div className="text-xs opacity-70">{[i.color,i.size].filter(Boolean).join(' · ')}</div>
                  <div className="text-sm">{rub(i.price)}</div>
                </div>
                <div className="text-sm">× {i.qty}</div>
                <button className="btn" onClick={()=>remove(idx)}>Удалить</button>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-lg">Итого: {rub(total)}</div>
            <button className="btn" onClick={clear}>Очистить корзину</button>
            <p className="text-xs opacity-70">Оплата и доставка — на следующих шагах.</p>
          </div>
        </div>
      )}
    </div>
  );
}
