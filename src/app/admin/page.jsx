export const runtime = "edge";
import { headers } from "next/headers";
import Link from "next/link";

async function getOrders(token) {
  if (token !== process.env.ADMIN_TOKEN) return [];
  const h = headers();
  const base =
    process.env.PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    `${h.get("x-forwarded-proto") || "https"}://${h.get("host")}`;
  const r = await fetch(
    `${base}/api/admin/orders?token=${encodeURIComponent(token)}`,
    { cache: "no-store" }
  );
  if (!r.ok) return [];
  return r.json();
}

export default async function Admin({ searchParams }) {
  const token = searchParams?.t || "";
  const data = await getOrders(token);
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl mb-4">Заказы</h1>
      {!token && <div className="text-red-600">Добавь ?t=ТВОЙ_ТОКЕН в URL</div>}
      <div className="space-y-2">
        {data.map((o) => (
          <div key={o.number} className="border p-3 flex justify-between">
            <div>
              <div className="font-medium">
                <Link href={`/admin/${o.number}?t=${encodeURIComponent(token)}`}>{o.number}</Link>
              </div>
              <div className="text-sm opacity-80">
                {o.customer_name} • {o.customer_phone}
              </div>
            </div>
            <div className="text-sm">
              {o.status} • {o.payment_method} • {(o.amount_total / 100).toFixed(2)} ₽
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
