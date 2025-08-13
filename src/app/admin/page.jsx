export const runtime = "edge";

import Link from "next/link";
import { headers } from "next/headers";

async function loadData({ token, q, status, limit = 100 }) {
  const h = headers();
  const base =
    process.env.PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    `${h.get("x-forwarded-proto") || "https"}://${h.get("host")}`;
  const u = new URL(`${base}/api/admin/orders`);
  if (q) u.searchParams.set("q", q);
  if (status) u.searchParams.set("status", status);
  u.searchParams.set("limit", String(limit));
  const r = await fetch(u.toString(), { cache: "no-store", headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return { ok:false, items:[] };
  return r.json();
}

function Rub({ v }) {
  return <span>{(Number(v||0)/100).toFixed(2)} ₽</span>;
}

export default async function AdminList({ searchParams }) {
  const token = searchParams?.t || "";
  const q = searchParams?.q || "";
  const status = searchParams?.status || "";
  const data = token ? await loadData({ token, q, status }) : { ok:false, items:[] };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl mb-4">Заказы</h1>
      {!token && <div className="text-red-600 mb-4">Добавь ?t=ТВОЙ_ТОКЕН в URL</div>}

      <form className="mb-4 flex flex-wrap gap-2">
        <input
          type="hidden"
          name="t"
          defaultValue={token}
        />
        <input
          name="q"
          defaultValue={q}
          placeholder="Поиск: номер / телефон / email"
          className="border px-3 py-2 min-w-[240px]"
        />
        <select name="status" defaultValue={status} className="border px-3 py-2">
          <option value="">Все статусы</option>
          <option value="new">new</option>
          <option value="awaiting_payment">awaiting_payment</option>
          <option value="paid">paid</option>
          <option value="packed">packed</option>
          <option value="shipped">shipped</option>
          <option value="delivered">delivered</option>
          <option value="canceled">canceled</option>
          <option value="refunded">refunded</option>
        </select>
        <button className="px-4 py-2 border">Искать</button>
      </form>

      <div className="space-y-2">
        {data?.items?.map((o)=>(
          <Link
            key={o.number}
            href={`/admin/${encodeURIComponent(o.number)}?t=${encodeURIComponent(token)}`}
            className="block border p-3 hover:bg-gray-50"
          >
            <div className="flex justify-between">
              <div>
                <div className="font-medium">#{o.number}</div>
                <div className="text-sm opacity-80">
                  {o.customer_name} • {o.customer_phone} • {o.customer_email}
                </div>
              </div>
              <div className="text-sm text-right">
                <div>{o.status}{o.payment_method ? ` • ${o.payment_method}` : ""}</div>
                <div><Rub v={o.amount_total} /></div>
                <div className="opacity-60">{o.created_at}</div>
              </div>
            </div>
            <div className="text-xs opacity-70">
              Доставка: {o.delivery_method || "—"} • {(Number(o.delivery_price||0)/100).toFixed(2)} ₽
            </div>
          </Link>
        ))}

        {!data?.items?.length && <div className="opacity-70">Нет заказов</div>}
      </div>
    </div>
  );
}

