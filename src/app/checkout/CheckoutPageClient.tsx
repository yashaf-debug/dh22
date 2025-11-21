"use client";

import { useState, useEffect } from "react";

import CityAutocomplete from "@/app/components/CityAutocomplete";
import CdekMapPicker from "@/app/components/CdekMapPicker";
import TurnstileWidget from "@/components/TurnstileWidget";
import { r2Url } from "@/lib/r2";
import { evBeginCheckout, evPaymentMethod, evSelectPVZ } from "../lib/metrics";
import { rub } from "../lib/money";
import { useCart } from "@/store/cart";

type PVZ = { code: string; name: string; address: string };

export default function CheckoutPageClient() {
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });
  const [city, setCity] = useState("Москва");
  const [cityCode, setCityCode] = useState<number | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<
    "same_day_msk" | "cdek_courier" | "cdek_pvz"
  >("cdek_pvz");
  const [delivery, setDelivery] = useState<{ price_kop: number; eta: string; pvz: PVZ | null }>(
    { price_kop: 0, eta: "", pvz: null }
  );
  const [loadingShip, setLoadingShip] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [cfToken, setCfToken] = useState("");
  const lines = useCart((s) => s.list());
  const cart = lines.map(({ title, cover_url, price_cents, id, ...rest }) => ({
    ...rest,
    variantId: id,
    name: title,
    image: cover_url,
    price: price_cents,
  }));

  useEffect(() => {
    const sum = cart.reduce((s: number, i: any) => s + i.price * i.qty, 0) / 100;
    if (cart.length) evBeginCheckout(sum);
  }, [cart]);

  const itemsTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const weight = cart.reduce((s, i) => s + (i.weight_g || 500) * i.qty, 0);

  useEffect(() => {
    async function recalc() {
      if (!city) {
        setDelivery((d) => ({ ...d, price_kop: 0, eta: "" }));
        return;
      }
      setLoadingShip(true);
      try {
        const r = await fetch("/api/shipping/cdek/quote", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ method: deliveryMethod, city, weight_g: weight }),
        });
        const j = await r.json();
        if (j.ok) {
          setDelivery((d) => ({ ...d, price_kop: j.price_kop, eta: j.eta }));
        } else {
          setDelivery((d) => ({ ...d, price_kop: 0, eta: "" }));
        }
      } finally {
        setLoadingShip(false);
      }
    }
    if (deliveryMethod === "same_day_msk" && !city.toLowerCase().includes("моск")) {
      alert("Срочная доставка доступна только по Москве");
      setDeliveryMethod("cdek_pvz");
      return;
    }
    recalc();
  }, [city, deliveryMethod, weight]);

  const deliveryTotal = delivery.price_kop || 0;
  const orderTotal = itemsTotal + deliveryTotal;

  async function submit() {
    if (!cart.length) return alert("Корзина пуста");
    if (!customer.name || !customer.phone || !customer.email)
      return alert("Заполни данные покупателя");
    if (!city) return alert("Укажи город доставки");
    setLoading(true);
    try {
      const payload = {
        customer,
        delivery: {
          method: deliveryMethod,
          city,
          address: deliveryMethod === "cdek_pvz" ? delivery.pvz?.address || "" : "",
          pvz_code: delivery.pvz?.code || null,
          pvz_name: delivery.pvz?.name || null,
          price_kop: delivery.price_kop || 0,
          eta: delivery.eta || "",
        },
        items: cart,
        amount: { total: orderTotal },
        payment_method: paymentMethod,
        "cf-turnstile-response": cfToken,
      };
      const r1 = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j1 = await r1.json();
      if (!j1.ok) throw new Error(j1.error || "Не удалось создать заказ");
      const orderNumber = j1.orderNumber;

      if (paymentMethod === "online") {
        const r2 = await fetch("/api/pay/cdek/create", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ orderNumber }),
        });
        let j2;
        try {
          j2 = await r2.json();
        } catch {
          const t = await r2.text();
          alert(t);
          return;
        }
        if (j2?.link) window.location.href = j2.link;
        else if (j2?.url) window.location.href = j2.url;
        else alert(j2?.error || "Неизвестная ошибка оплаты");
      } else {
        alert("Успех! Заявка на заказ создана, оператор свяжется с тобой в ближайшее время");
      }
    } catch (e) {
      alert((e as any).message || "Не удалось оформить заказ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrap pb-4">
      <form
        className="grid grid-cols-1 gap-6 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center gap-3">
            <img
              src={r2Url("/icon-whitebag.jpg")}
              alt="DH22 checkout"
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <div className="text-sm uppercase tracking-[0.1em] text-gray-500">DH22</div>
              <div className="text-2xl font-semibold text-accent">Оформление заказа</div>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm">
            <label className="block">
              <div className="mb-1 text-xs uppercase tracking-[0.1em] text-gray-500">Телефон*</div>
              <input
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-accent"
                type="tel"
                required
                placeholder="+7 (999) 999-99-99"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              />
            </label>

            <label className="block">
              <div className="mb-1 text-xs uppercase tracking-[0.1em] text-gray-500">Имя*</div>
              <input
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-accent"
                required
                placeholder="Например, Анастасия"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              />
            </label>

            <label className="block">
              <div className="mb-1 text-xs uppercase tracking-[0.1em] text-gray-500">Email*</div>
              <input
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-accent"
                type="email"
                required
                placeholder="Например, name@gmail.com"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              />
            </label>

            <label className="block">
              <div className="mb-1 text-xs uppercase tracking-[0.1em] text-gray-500">Город*</div>
              <CityAutocomplete value={city} onChange={(v) => setCity(v || "")} onSelect={(item) => setCityCode(item?.code || null)} />
            </label>

            <div className="space-y-3 rounded-xl bg-gray-50 p-4 text-sm">
              <div className="text-xs uppercase tracking-[0.1em] text-gray-500">Способ доставки</div>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  className="h-4 w-4"
                  checked={deliveryMethod === "cdek_pvz"}
                  onChange={() => setDeliveryMethod("cdek_pvz")}
                />
                <div>
                  <div className="font-semibold">В пункт выдачи СДЭК</div>
                  <div className="text-xs text-gray-500">С примеркой и частичным выкупом — от 250 ₽</div>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  className="h-4 w-4"
                  checked={deliveryMethod === "cdek_courier"}
                  onChange={() => setDeliveryMethod("cdek_courier")}
                />
                <div>
                  <div className="font-semibold">Курьером СДЭК</div>
                  <div className="text-xs text-gray-500">С примеркой и частичным выкупом — от 300 ₽</div>
                </div>
              </label>
              {city.toLowerCase().includes("моск") && (
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    className="h-4 w-4"
                    checked={deliveryMethod === "same_day_msk"}
                    onChange={() => setDeliveryMethod("same_day_msk")}
                  />
                  <div>
                    <div className="font-semibold">Срочная доставка по Москве</div>
                    <div className="text-xs text-gray-500">Доставим сегодня до 22:00 — от 600 ₽</div>
                  </div>
                </label>
              )}
            </div>

            {deliveryMethod === "cdek_pvz" && (
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-inner">
                <div className="mb-2 text-xs uppercase tracking-[0.1em] text-gray-500">Выберите пункт выдачи</div>
                <CdekMapPicker
                  city={city}
                  onSelect={(pvz) => {
                    setDelivery((d) => ({ ...d, pvz }));
                    if (pvz) {
                      evSelectPVZ({ code: pvz.code, city, address: pvz.address });
                    }
                  }}
                  onCityChange={(val) => setCity(val)}
                  onCityCodeChange={(code) => setCityCode(code)}
                />
              </div>
            )}

            <div className="space-y-3 rounded-xl bg-gray-50 p-4 text-sm">
              <div className="text-xs uppercase tracking-[0.1em] text-gray-500">Способ оплаты</div>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  className="h-4 w-4"
                  checked={paymentMethod === "online"}
                  onChange={() => {
                    setPaymentMethod("online");
                    evPaymentMethod("online");
                  }}
                />
                <div>
                  <div className="font-semibold">Онлайн на сайте</div>
                  <div className="text-xs text-gray-500">Банковской картой или через СБП</div>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  className="h-4 w-4"
                  checked={paymentMethod === "cod"}
                  onChange={() => {
                    setPaymentMethod("cod");
                    evPaymentMethod("cod");
                  }}
                />
                <div>
                  <div className="font-semibold">При получении</div>
                  <div className="text-xs text-gray-500">Картой курьеру или наличными</div>
                </div>
              </label>
            </div>

            <TurnstileWidget siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITEKEY as string} onSuccess={(t) => setCfToken(t)} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center gap-3">
              <div className="text-lg font-semibold text-accent">Состав заказа</div>
              <div className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                {cart.reduce((s, i) => s + i.qty, 0)} шт
              </div>
            </div>

            {cart.length === 0 ? (
              <p className="mt-3 text-sm text-gray-600">Корзина пуста. Добавьте товары, чтобы оформить заказ.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {cart.map((item) => (
                  <div key={item.variantId} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{item.name}</div>
                      <div className="text-xs text-gray-500">Размер: {item.size}</div>
                      <div className="text-sm font-semibold">{rub(item.price / 100)} × {item.qty}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600">Товары</div>
              <div className="font-semibold">{rub(itemsTotal / 100)}</div>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <div className="text-gray-600">Доставка</div>
              <div className="font-semibold">{loadingShip ? "…" : rub(deliveryTotal / 100)}</div>
            </div>
            <div className="mt-4 flex items-center justify-between text-lg font-semibold">
              <div>Итого</div>
              <div>{rub(orderTotal / 100)}</div>
            </div>

            <button
              type="submit"
              disabled={loading || !cart.length || !cfToken}
              className="mt-6 w-full rounded-xl bg-accent px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-accent/90 disabled:opacity-60"
            >
              {loading ? "Создаем заказ…" : "Оформить заказ"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
