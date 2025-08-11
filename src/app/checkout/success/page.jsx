"use client";
export const runtime = 'edge';
import { useEffect, useState } from "react";

export default function SuccessPage({ searchParams }) {
  const number = searchParams?.o || searchParams?.order || "";
  const [state, setState] = useState({ status:"loading", paid:false });
  const [order, setOrder] = useState<any>(null);
  const [payBusy, setPayBusy] = useState(false);

  useEffect(()=>{
    localStorage.removeItem("dh22_cart");
    let t;
    const tick = async () => {
      try {
        const r = await fetch(`/api/orders/${encodeURIComponent(number)}`, { cache:"no-store" });
        if (r.ok) {
          const j = await r.json();
          const paid = j?.order?.status === "paid";
          setOrder(j?.order || null);
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
    return ()=> clearTimeout(t);
  }, [number]);

  async function payOnlineNow() {
    try {
      setPayBusy(true);
      const p = await fetch("/api/pay/cdek/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderNumber: number })
      });
      const j = await p.json();
      if (j?.ok && (j.link || j.url)) {
        window.location.href = j.link || j.url;
      } else {
        alert("Не удалось создать платёж: " + (j?.error || "ошибка"));
      }
    } catch (e) {
      alert("Сеть недоступна");
    } finally {
      setPayBusy(false);
    }
  }

  const showPayButton =
    order &&
    (order.payment_method === "cod" || order.payment_method === "upon_receipt") &&
    !state.paid;

  return (
    <div className="container mx-auto px-4 py-16 space-y-4">
      <h1 className="text-2xl">Спасибо за заказ!</h1>
      <div className="opacity-80">Номер заказа: <b>{number}</b></div>

      <div className="mt-2">
        {state.paid
          ? <div className="text-green-600">Оплата зафиксирована. Мы начали сборку заказа.</div>
          : <div>Ожидаем подтверждение оплаты… Статус: <b>{state.status}</b></div>}
      </div>

      {showPayButton && (
        <div className="mt-6">
          <button
            onClick={payOnlineNow}
            disabled={payBusy}
            className="inline-block px-4 py-2 bg-black text-white"
          >
            {payBusy ? "Открываем оплату…" : "Оплатить онлайн"}
          </button>
          <div className="text-sm opacity-70 mt-1">
            Вы выбрали оплату при получении. Можно оплатить онлайн — это ускорит обработку заказа.
          </div>
        </div>
      )}
    </div>
  );
}
