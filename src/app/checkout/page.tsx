"use client";
export const runtime = 'edge';
import { useState, useEffect } from "react";
import { rub } from "../lib/money";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });
  const [delivery, setDelivery] = useState({ type: "cdek_pvz", address: "" });

  useEffect(() => {
    const raw = localStorage.getItem("dh22_cart");
    setCart(raw ? JSON.parse(raw) : []);
  }, []);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  async function submit() {
    if (!cart.length) return alert("Корзина пуста");
    if (!customer.name || !customer.phone || !customer.email)
      return alert("Заполни данные покупателя");
    try {
      setLoading(true);
      const r1 = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customer,
          delivery,
          items: cart,
          amount: { total },
        }),
      });
      const j1 = await r1.json();
      if (!j1.ok) throw new Error(j1.error || "Не удалось создать заказ");

      const r2 = await fetch("/api/pay/cdek/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderNumber: j1.orderNumber }),
      });
      const j2 = await r2.json();
      console.log("CDEK PAY create:", j2);
      if (!j2.ok) {
        setLoading(false);
        alert(
          `CDEK ${j2.status || ""}\n` +
            (typeof j2.detail === "string"
              ? j2.detail
              : JSON.stringify(j2.detail)),
        );
        return;
      }
      setLoading(false);
      if (j2.link || j2.url) {
        // Простой и надёжный сценарий: открываем платёж в этой вкладке
        window.location.href = j2.link || j2.url;
        return;
      }
      alert(
        j2.error ||
          "Заказ создан, но онлайн-оплата не настроена. Сохраните номер заказа: " +
            j1.orderNumber,
      );
    } catch (e: any) {
      setLoading(false);
      alert(e.message);
    }
  }

  return (
    <>
      <div className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 flex flex-col gap-4">
          <h1 className="text-2xl">Оформление заказа</h1>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg">Покупатель</h2>
            <input
              className="border px-3 py-2"
              placeholder="Имя и фамилия"
              value={customer.name}
              onChange={e => setCustomer({ ...customer, name: e.target.value })}
            />
            <input
              className="border px-3 py-2"
              placeholder="+7..."
              value={customer.phone}
              onChange={e => setCustomer({ ...customer, phone: e.target.value })}
            />
            <input
              className="border px-3 py-2"
              placeholder="email"
              value={customer.email}
              onChange={e => setCustomer({ ...customer, email: e.target.value })}
            />
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg">Доставка</h2>
            <select
              className="border px-3 py-2"
              value={delivery.type}
              onChange={e => setDelivery({ ...delivery, type: e.target.value })}
            >
              <option value="cdek_pvz">СДЭК — пункт выдачи</option>
              <option value="cdek_courier">СДЭК — курьер</option>
              <option value="self">Самовывоз</option>
            </select>
            <input
              className="border px-3 py-2"
              placeholder="Адрес (если нужно)"
              value={delivery.address}
              onChange={e => setDelivery({ ...delivery, address: e.target.value })}
            />
          </section>

          <button className="btn btn-primary w-48" disabled={loading} onClick={submit}>
            {loading ? "Создаём..." : "Перейти к оплате"}
          </button>
        </div>

        <aside className="flex flex-col gap-3">
          <h2 className="text-lg">Ваш заказ</h2>
          {cart.map((i, idx) => (
            <div key={idx} className="flex items-center gap-3 border-b pb-3">
              <img src={i.image} className="w-16 h-20 object-cover border" alt={i.name} />
              <div className="flex-1">
                <div className="text-sm">{i.name}</div>
                <div className="text-xs opacity-70">× {i.qty}</div>
              </div>
              <div className="text-sm">{rub(i.price * i.qty)}</div>
            </div>
          ))}
          <div className="text-lg mt-2">Итого: {rub(total)}</div>
        </aside>
      </div>
    </>
  );
}
