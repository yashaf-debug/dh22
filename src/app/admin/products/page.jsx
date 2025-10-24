import Link from "next/link";
import { listProductsAdmin } from "@/lib/adminQueries";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { fmtRub } from "@/lib/normalize";
export const runtime = 'edge';

export default async function AdminProductsPage({ searchParams }) {
  const t = searchParams?.t ?? "";
  const q = searchParams?.q ?? "";
  const items = await listProductsAdmin({ q, limit: 100 });

  return (
    <div>
      <h1 className="mb-4 text-3xl font-semibold">Товары</h1>

      <form method="GET" className="mb-6 flex gap-3">
        <input name="q" defaultValue={q} placeholder="поиск..." className="h-10 w-[280px] rounded border px-3" />
        {t ? <input type="hidden" name="t" value={t} /> : null}
        <button className="h-10 rounded border px-4">Искать</button>
        <Link href={{ pathname: "/admin/products/new", query: t ? { t } : {} }} className="flex h-10 items-center rounded border px-4">
          + Новый
        </Link>
      </form>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((p) => (
          <li key={p.id} className="flex items-center gap-4 rounded border p-3">
            <img src={p.cover_url} alt={p.name || p.slug} className="h-16 w-16 rounded object-cover" />
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{p.title}</div>
              <div className="text-sm opacity-70">{fmtRub(p.price_cents)}</div>
              <div className="text-xs opacity-60">
                {p.category}{p.subcategory ? ` / ${p.subcategory}` : ""} · Остаток: {p.stock_total}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={{ pathname: `/admin/products/${p.id}`, query: t ? { t } : {} }}
                className="rounded border px-3 py-1 text-sm"
              >
                Открыть
              </Link>
              {/* удаление — клиентский компонент */}
              <DeleteProductButton id={p.id} t={t} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
