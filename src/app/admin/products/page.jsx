import Link from "next/link";
import { listProductsAdmin } from "@/lib/adminQueries";
import { fmtRub } from "@/lib/normalize";

export const runtime = "edge";

export default async function AdminProductsPage({ searchParams }) {
  const q = searchParams?.q ?? "";
  const items = await listProductsAdmin({ q, limit: 100 });

  return (
    <div className="p-6">
      <nav className="mb-6 text-lg font-semibold">
        <Link href="/admin/orders" className="mr-4 hover:underline">Заказы</Link>
        <span className="opacity-60">Каталог</span>
      </nav>

      <h1 className="mb-4 text-3xl font-semibold">Товары</h1>

      <form method="GET" className="mb-6 flex gap-3">
        <input name="q" defaultValue={q} placeholder="поиск..." className="h-10 w-[280px] rounded border px-3" />
        <button className="h-10 rounded border px-4">Искать</button>
        <Link href="/admin/products/new" className="flex h-10 items-center rounded border px-4">+ Новый</Link>
      </form>

      {items.length === 0 ? (
        <div className="text-sm text-neutral-500">Ничего не найдено.</div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map(p => (
            <li key={p.id} className="flex items-center gap-4 rounded border p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.cover_url} alt="" className="h-16 w-16 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{p.title}</div>
                <div className="text-sm opacity-70">{fmtRub(p.price_cents)}</div>
                <div className="text-xs opacity-60">
                  {p.category}{p.subcategory ? ` / ${p.subcategory}` : ""} · Остаток: {p.stock_total}
                </div>
              </div>
              <Link href={`/admin/products/${p.id}`} className="rounded border px-3 py-1 text-sm">Открыть</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

