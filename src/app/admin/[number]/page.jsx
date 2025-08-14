export const runtime = "edge";

import Link from "next/link";
import { headers } from "next/headers";
import AdminStatusButtons from "@/app/components/AdminStatusButtons";

async function loadOrder(number, token) {
  const h = headers();
  const base =
    process.env.PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    `${h.get("x-forwarded-proto") || "https"}://${h.get("host")}`;
  const url = new URL(`${base}/api/admin/order/${encodeURIComponent(number)}`);
  const r = await fetch(url.toString(), { cache:"no-store", headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  return r.json();
}

function Rub({ v }) { return <span>{(Number(v||0)/100).toFixed(2)} ₽</span>; }

export default async function AdminOrder({ params, searchParams }) {
  const token = searchParams?.t || "";
  const number = params.number;
  const data = token ? await loadOrder(number, token) : null;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <Link href={`/admin?t=${encodeURIComponent(token)}`} className="text-blue-600">← назад</Link>
      </div>

      {!token && <div className="text-red-600">Добавь ?t=ТОКЕН в URL</div>}
      {!data?.ok && token && <div className="text-red-600">Не найдено</div>}

      {data?.ok && (
        <>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl">Заказ #{number}</h1>
              <div className="opacity-70">
                {data.order.status} • <Rub v={data.order.amount_total} />
                {data.order.payment_method ? ` • ${data.order.payment_method}` : ""}
              </div>
              <div className="text-sm opacity-70">{data.order.created_at}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <AdminStatusButtons number={number} token={token} current={data.order.status} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="border p-4">
              <div className="font-medium mb-2">Покупатель</div>
              <div>{data.order.customer_name}</div>
              <div className="opacity-70">{data.order.customer_phone}</div>
              <div className="opacity-70">{data.order.customer_email}</div>
            </div>

            <div className="border p-4">
              <div className="font-medium mb-2">Доставка</div>
              <div>Тип: {data.order.delivery_method || "—"}</div>
              <div>Город: {data.order.delivery_city || "—"}</div>
              <div>Адрес: {data.order.delivery_address || "—"}</div>
              <div>ПВЗ: {data.order.delivery_pvz_name || "—"}</div>
              <div>Стоимость: <Rub v={data.order.delivery_price || 0} /></div>
              <div>ETA: {data.order.delivery_eta || "—"}</div>

              {/* Новое: трекинг СДЭК */}
              {(() => {
                const track = (data.order.cdek_tracking_number || data.order.cdek_order_id || "").trim();
                if (!track) {
                  return (
                    <div className="mt-2 text-sm opacity-70">
                      Трекинг: — <span className="opacity-60">(введите трек при установке статуса «Отгружен»)</span>
                    </div>
                  );
                }
                const rel = `/t/cdek?track=${encodeURIComponent(track)}`;
                return (
                  <div className="mt-2 text-sm">
                    Трекинг: <span className="opacity-80">{track}</span>{" "}
                    <a href={rel} target="_blank" className="text-blue-600 underline">Отследить в СДЭК</a>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="border p-4">
            <div className="font-medium mb-3">Товары</div>
            <div className="space-y-2">
              {data.items.map((i)=>(
                <div key={i.slug} className="flex justify-between">
                  <div>{i.name} <span className="opacity-70">× {i.qty}</span></div>
                  <div className="opacity-80"><Rub v={i.price} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="border p-4">
            <div className="font-medium mb-3">История статусов</div>
            {data.history.length === 0
              ? <div className="opacity-70">Пусто</div>
              : (
                <div className="space-y-1 text-sm">
                  {data.history.map((h,idx)=>(
                    <div key={idx} className="flex justify-between">
                      <div>{h.from_status || "—"} → <b>{h.to_status}</b></div>
                      <div className="opacity-70">{h.actor} • {h.created_at}</div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </>
      )}
    </div>
  );
}

