"use client";

import { useEffect, useRef, useState } from "react";

import { evPurchase } from "@/app/lib/metrics";

type SuccessProps = { searchParams?: { o?: string; order?: string } };

type OrderState = { status: string; paid: boolean };

type OrderItem = { id: string; name: string; price: number; qty: number };

type Order = {
  number: string;
  status: string;
  amount_total?: number;
  shipping_price?: number;
  payment_method?: string;
  customer_tg_chat_id?: string | null;
  items?: OrderItem[];
};

export default function CheckoutSuccessClient({ searchParams }: SuccessProps) {
  const number = (searchParams?.o || searchParams?.order || "").trim();

  const [state, setState] = useState<OrderState>({ status: "loading", paid: false });
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [payBusy, setPayBusy] = useState(false);
  const sentRef = useRef(false);

  // telegram deeplink state
  const [tgUrl, setTgUrl] = useState("");
  const [tgReady, setTgReady] = useState(false);

  useEffect(() => {
    if (!number) return;

    localStorage.removeItem("dh22_cart");
    window.dispatchEvent(new Event("cart_updated"));
    let t: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const r = await fetch(`/api/orders/${encodeURIComponent(number)}`, { cache: "no-store" });
        if (r.ok) {
          const j = await r.json();
          const paid = j?.order?.status === "paid";
          setOrder(j?.order ? { ...j.order, items: j.items } : null);
          setItems((j?.items || []).map((i: any) => ({ id: i.slug, name: i.name, price: i.price / 100, qty: i.qty })));
          setState({ status: j?.order?.status || "new", paid });
          if (paid && !sentRef.current) {
            sentRef.current = true;
            const purchaseItems = (j.items || []).map((i: any) => ({ id: i.slug, name: i.name, price: i.price / 100, qty: i.qty }));
            evPurchase({
              number: j.order.number,
              revenue: (j.order.amount_total || 0) / 100,
              shipping: (j.order.shipping_price || 0) / 100,
              items: purchaseItems,
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
  }, [number, order?.customer_tg_chat_id]);

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
          <div className="text-sm text-gray-600">
            Статус: {state.status}
          </div>

          {order && (
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <div>
                  <div className="text-xs uppercase tracking-[0.08em] text-gray-500">Оплата</div>
                  <div className="font-semibold">{state.paid ? "Оплачено" : "Ожидает оплаты"}</div>
                </div>
                {showPayButton && (
                  <button
                    disabled={payBusy}
                    onClick={payOnlineNow}
                    className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:opacity-50"
                  >
                    Оплатить сейчас
                  </button>
                )}
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4 text-sm">
                <div className="text-xs uppercase tracking-[0.08em] text-gray-500">Сумма</div>
                <div className="font-semibold">{order?.amount_total ? `${(order.amount_total / 100).toFixed(0)} ₽` : "—"}</div>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4 text-sm">
                <div className="text-xs uppercase tracking-[0.08em] text-gray-500">Доставка</div>
                <div className="font-semibold">{order?.shipping_price ? `${(order.shipping_price / 100).toFixed(0)} ₽` : "—"}</div>
              </div>

              {items.length > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-4 text-sm">
                  <div className="text-xs uppercase tracking-[0.08em] text-gray-500">Состав заказа</div>
                  <ul className="mt-2 space-y-2">
                    {items.map((i) => (
                      <li key={i.id} className="flex justify-between">
                        <span>
                          {i.name} × {i.qty}
                        </span>
                        <span>{i.price.toFixed(0)} ₽</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {showTgButton && (
            <a
              href={tgUrl}
              className="inline-flex items-center gap-2 rounded-full bg-[#229ED9] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1c82b2]"
            >
              Получать обновления в Telegram
            </a>
          )}
        </>
      )}
    </div>
  );
}
