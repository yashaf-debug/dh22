export const runtime = "edge";
import Link from "next/link";

async function loadData(number, token) {
  const base = process.env.PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
  const r = await fetch(`${base}/api/admin/order/${encodeURIComponent(number)}?token=${encodeURIComponent(token)}`, { cache:"no-store" });
  if (!r.ok) return null;
  return r.json();
}

export default async function AdminOrder({ params, searchParams }) {
  const token = searchParams?.t || "";
  const number = params.number;
  const data = token ? await loadData(number, token) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href={`/admin?t=${encodeURIComponent(token)}`} className="text-blue-600">← назад к списку</Link>
      </div>
      {!token && <div className="text-red-600">Добавь ?t=ТОКЕН в URL</div>}
      {!data?.ok && token && <div className="text-red-600">Не найдено</div>}
      {data?.ok && (
        <>
          <h1 className="text-2xl mb-2">Заказ {number}</h1>
          <div className="opacity-70 mb-4">{data.order.status} • {(data.order.amount_total/100).toFixed(2)} ₽</div>
          <div className="grid gap-2">
            {data.items.map((i)=>(
              <div key={i.slug} className="border p-2 flex justify-between">
                <div>{i.name}</div>
                <div className="opacity-70">{i.qty} × {(i.price/100).toFixed(2)} ₽</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
