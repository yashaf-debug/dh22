"use client";
export const runtime = 'edge'
import { useEffect, useState, useRef } from "react";
import { evPurchase } from "@/app/lib/metrics";

export default function SuccessPage({ searchParams }) {
  const number = (searchParams?.o || searchParams?.order || "").trim();

  const [state, setState] = useState({ status: "loading", paid: false });
  const [order, setOrder] = useState<any>(null);
  const [payBusy, setPayBusy] = useState(false);
    const sentRef = useRef(false);

  // telegram deeplink state
  const [tgUrl, setTgUrl] = useState("");
  const [tgReady, setTgReady] = useState(false);

  useEffect(() => {
    if (!number) return;

    localStorage.removeItem("dh22_cart");
    let t;
    const tick = async () => {
      try {
        const r = await fetch(`/api/orders/${encodeURIComponent(number)}`, { cache: "no-store" });
        if (r.ok) {
          const j = await r.json();
          const paid = j?.order?.status === "paid";
          setOrder(j?.order ? { ...j.order, items: j.items } : null);
          setState({ status: j?.order?.status || "new", paid });
          if (paid && !sentRef.current) {
            sentRef.current = true;
            const items = (j.items || []).map((i: any) => ({ id: i.slug, name: i.name, price: i.price / 100, qty: i.qty }));
            evPurchase({
              number: j.order.number,
              revenue: (j.order.amount_total || 0) / 100,
              shipping: (j.order.shipping_price || 0) / 100,
              items,
            });
          }
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

  // подготавливаем deeplink, если клиент ещё не подписан
  useEffect(() => {
    if (!number) return;
    if (order && order.customer_tg_chat_id) {
      setTgReady(false);
      setTgUrl("");
      return;
    }
    (async () => {
      try {
        const r = await fetch(`/api/tg/deeplink?o=${encodeURIComponent(number)}`, { cache: "no-store" });
        const j = await r.json();
        if (j?.ok && j.url) {
          setTgUrl(j.url);
          setTgReady(true);
        } else {
          setTgReady(false);
        }
      } catch {
        setTgReady(false);
      }
    })();
  }, [number, order?.customer_tg_chat_id]); // если пользователь подписался после клика, состояние обновится

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
        alert("Не удалось открыть оплату: " + (j?.error || "ошибка"));
      }
    } catch {
      alert("Сеть недоступна");
    } finally {
      setPayBusy(false);
    }
  }

  const showPayButton =
    order &&
    (order.payment_method === "cod" || order.payment_method === "upon_receipt") &&
    !state.paid;

  const showTgButton = Boolean(tgReady && tgUrl && order && !order.customer_tg_chat_id);

  return (
    <div className="container mx-auto px-4 py-16 space-y-4">
      <h1 className="text-2xl">Спасибо за заказ!</h1>
      <div className="opacity-80">
        Номер заказа: <b>{number || "—"}</b>
      </div>

      {!number && (
        <div className="text-red-600">
          Не передан номер заказа. Вернитесь на сайт и оформите заказ заново.
        </div>
      )}

      {number && (
        <>
          <div className="mt-2">
            {state.paid ? (
              <div className="text-green-600">Оплата зафиксирована. Мы начали сборку заказа.</div>
            ) : (
              <div>
                Ожидаем подтверждение оплаты… Статус: <b>{state.status}</b>
              </div>
            )}
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

          {/* Кнопка подписки в Telegram */}
          {showTgButton ? (
            <div className="mt-6">
              <a href={tgUrl} target="_blank" className="inline-block px-4 py-2 border">
                Получать апдейты в Telegram
              </a>
              <div className="text-sm opacity-70 mt-1">
                Нажмите, откройте бота и подтвердите подписку — мы пришлём уведомления по этому заказу.
              </div>
            </div>
          ) : order && order.customer_tg_chat_id ? (
            <div className="mt-6 text-green-600">
              Вы подписаны на уведомления в Telegram.
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
