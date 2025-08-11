"use client";
export const runtime = 'edge';

import { useEffect, useState } from "react";

export default function SuccessPage({ searchParams }) {
  const number = searchParams?.o || searchParams?.order || "";
  const [state, setState] = useState({ status: "loading", paid: false, method: "online" });
  const [tg, setTg] = useState({ url: "", ready: false });

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
          const method = j?.order?.payment_method || "online";
          setState({ status: j?.order?.status || "new", paid, method });
          if (!paid && method === "online") t = setTimeout(tick, 2000);
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

  useEffect(() => {
    (async () => {
      if (!number) return;
      try {
        const r = await fetch(`/api/tg/deeplink?o=${encodeURIComponent(number)}`, { cache: "no-store" });
        const j = await r.json();
        if (j?.ok && j.url) setTg({ url: j.url, ready: true });
      } catch {}
    })();
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
        ) : state.method === "cod" ? (
          <div>Вы выбрали <b>оплату при получении</b>. Мы начали сборку заказа.</div>
        ) : (
          <div>Ожидаем подтверждение оплаты… Статус: <b>{state.status}</b></div>
        )}
      </div>
      {tg.ready && (
        <div className="mt-6">
          <a href={tg.url} target="_blank" className="inline-block px-4 py-2 border">
            Получать апдейты в Telegram
          </a>
          <div className="text-sm opacity-70 mt-1">
            Нажмите, откройте бота и подтвердите подписку — мы пришлём уведомления по этому заказу.
          </div>
        </div>
      )}
    </div>
  );
}
