"use client";
export const runtime = 'edge';

import { useEffect, useState } from "react";

export default function SuccessPage({ searchParams }) {
  const number = searchParams?.o || searchParams?.order || "";
  const [state, setState] = useState({ status: "loading", paid: false });

  useEffect(() => {
    // очистить корзину один раз
    localStorage.removeItem("dh22_cart");
    let t;
    const tick = async () => {
      try {
        const r = await fetch(`/api/orders/${encodeURIComponent(number)}`, { cache: "no-store" });
        if (r.ok) {
          const j = await r.json();
          const paid = j?.order?.status === "paid";
          setState({ status: j?.order?.status || "new", paid });
          if (!paid) t = setTimeout(tick, 2000);
        } else {
          t = setTimeout(tick, 3000);
        }
      } catch {
        t = setTimeout(tick, 3000);
      }
    };
    tick();
    return () => clearTimeout(t);
  }, [number]);

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-2xl mb-2">Спасибо за заказ!</h1>
      <div className="opacity-80">
        Номер заказа: <b>{number}</b>
      </div>
      <div className="mt-4">
        {state.paid ? (
          <div className="text-green-600">Оплата зафиксирована. Мы начали сборку заказа.</div>
        ) : (
          <div>
            Ожидаем подтверждение оплаты… Статус: <b>{state.status}</b>
          </div>
        )}
      </div>
    </div>
  );
}