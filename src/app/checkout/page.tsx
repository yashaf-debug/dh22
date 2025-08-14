"use client";
export const runtime = 'edge';
import { useState, useEffect } from "react";
import CityAutocomplete from "@/app/components/CityAutocomplete";
import CdekMapPicker from "@/app/components/CdekMapPicker";
import { rub } from "../lib/money";
import { imgProps } from "@/lib/images";
import { evBeginCheckout, evSelectPVZ, evPaymentMethod } from "../lib/metrics";

type PVZ = { code: string; name: string; address: string };

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });
  const [city, setCity] = useState("Москва");
  const [cityCode, setCityCode] = useState<number | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<"same_day_msk" | "cdek_courier" | "cdek_pvz">("cdek_pvz");
  const [delivery, setDelivery] = useState<{ price_kop: number; eta: string; pvz: PVZ | null }>({ price_kop: 0, eta: "", pvz: null });
  const [loadingShip, setLoadingShip] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");

  useEffect(() => {
    const raw = localStorage.getItem('dh22_cart');
    const parsed = raw ? JSON.parse(raw) : [];
    setCart(parsed);
      const sum = parsed.reduce((s: number, i: any) => s + i.price * i.qty, 0) / 100;
      if (parsed.length) evBeginCheckout(sum);
  }, []);

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
        if (!j2.ok) {
          alert(
            `CDEK ${j2.status || ""}\n` +
              (typeof j2.detail === "string" ? j2.detail : JSON.stringify(j2.detail))
          );
          return;
        }
        window.location.href = j2.link || j2.url;
      } else {
        window.location.href = `/checkout/success?o=${encodeURIComponent(orderNumber)}`;
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
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
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            />
            <input
              className="border px-3 py-2"
              placeholder="+7..."
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            />
            <input
              className="border px-3 py-2"
              placeholder="email"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            />
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg">Доставка</h2>
            <CityAutocomplete
              value={city}
              onSelect={(n, code) => {
                setCity(n);
                setCityCode(code);
              }}
              onInput={(v) => setCity(v)}
              placeholder="Начните вводить город"
            />
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="dm"
                  value="same_day_msk"
                  checked={deliveryMethod === "same_day_msk"}
                  onChange={() => setDeliveryMethod("same_day_msk")}
                />
                <span>Срочно по Москве (сегодня)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="dm"
                  value="cdek_courier"
                  checked={deliveryMethod === "cdek_courier"}
                  onChange={() => setDeliveryMethod("cdek_courier")}
                />
                <span>СДЭК — курьер</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="dm"
                  value="cdek_pvz"
                  checked={deliveryMethod === "cdek_pvz"}
                  onChange={() => setDeliveryMethod("cdek_pvz")}
                />
                <span>СДЭК — пункт выдачи</span>
              </label>
            </div>
            {deliveryMethod === "cdek_pvz" && (
              <div className="flex items-center gap-3">
                <CdekMapPicker
                  city={city}
                  cityCode={cityCode || undefined}
                  yandexApiKey={process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || ""}
                  onSelect={(pvz) => {
                      setDelivery(d => ({ ...d, pvz }));
                      evSelectPVZ(pvz.code, pvz.address);
                  }}
                  buttonText="Выбрать ПВЗ на карте"
                />
                <div className="text-sm opacity-80">
                  {delivery.pvz ? `${delivery.pvz.name}` : "ПВЗ не выбран"}
                </div>
              </div>
            )}
            <div className="text-sm opacity-80">
              Стоимость доставки: {(delivery.price_kop / 100).toFixed(2)} ₽ {delivery.eta && `• ${delivery.eta}`}
            </div>
            {loadingShip && (
              <div className="text-sm opacity-70">Считаем доставку...</div>
            )}
          </section>

          <div className="flex flex-col gap-2">
            <h2 className="text-lg">Способ оплаты</h2>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="pm"
                value="online"
                checked={paymentMethod === "online"}
                onChange={() => {
                    setPaymentMethod('online');
                    evPaymentMethod('online');
                }}
              />
              <span>Онлайн (CDEK Pay)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="pm"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => {
                    setPaymentMethod('cod');
                    evPaymentMethod('cod');
                }}
              />
              <span>При получении</span>
            </label>
          </div>

  <button className="btn btn-primary w-48" disabled={loading} onClick={submit}>
            {loading ? "Создаём..." : "Перейти к оплате"}
          </button>
        </div>

        <aside className="flex flex-col gap-3">
          <h2 className="text-lg">Ваш заказ</h2>
          {cart.map((i, idx) => (
            <div key={idx} className="flex items-center gap-3 border-b pb-3">
              <div className="w-16 h-20">
                <img {...imgProps(i.image || i.image_url, i.name)} className="cart-thumb" />
              </div>
              <div className="flex-1">
                <div className="text-sm">{i.name}</div>
                <div className="text-xs opacity-70">× {i.qty}</div>
              </div>
              <div className="text-sm">{rub(i.price * i.qty)}</div>
            </div>
          ))}
          <div className="text-sm">Доставка: {rub(deliveryTotal)}</div>
          <div className="text-lg mt-2">Итого: {rub(orderTotal)}</div>
        </aside>
      </div>
    </>
  );
}
