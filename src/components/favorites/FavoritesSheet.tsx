"use client";
import * as React from "react";
import { clearFavs, readFavs, subscribeFavs, toggleFav } from "@/lib/favorites";
import { fmtRub } from "@/lib/normalize";

type Mini = {
  id: number;
  slug: string;
  title: string;
  cover_url: string | null;
  price_cents: number;
};

async function loadProducts(ids: number[]): Promise<Mini[]> {
  if (!ids.length) return [];
  const r = await fetch(`/api/products/by-ids?ids=${ids.join(",")}`, { cache: "no-store" });
  if (!r.ok) return [];
  return await r.json();
}

export default function FavoritesSheet() {
  const [open, setOpen] = React.useState(false);
  const [ids, setIds] = React.useState<number[]>([]);
  const [items, setItems] = React.useState<Mini[]>([]);
  const [loading, setLoading] = React.useState(false);

  // управление через хэш
  React.useEffect(() => {
    const syncHash = () => setOpen(location.hash === "#favorites");
    syncHash();
    const onHash = () => syncHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // следим за изменениями списка
  React.useEffect(() => {
    setIds(readFavs());
    return subscribeFavs(setIds);
  }, []);

  // загрузка карточек
  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const data = await loadProducts(ids);
      if (alive) {
        // сохраняем порядок, как в ids
        const index = new Map(data.map(d => [d.id, d]));
        setItems(ids.map(id => index.get(id)).filter(Boolean) as Mini[]);
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [ids]);

  const close = () => {
    if (location.hash === "#favorites") history.replaceState(null, "", location.pathname + location.search);
    setOpen(false);
  };

  return (
    <>
      {/* затемнение */}
      <div
        className={`fixed inset-0 z-[70] bg-black/30 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={close}
        aria-hidden={!open}
      />
      {/* панель */}
      <aside
        className={`fixed right-0 top-0 z-[80] h-full w-full max-w-[520px] transform bg-white shadow-xl transition-transform
                    ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-label="Избранное"
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-xl font-extrabold uppercase tracking-wide">Вишлист</h3>
          <button onClick={close} aria-label="Закрыть" className="rounded-full p-2 hover:bg-neutral-100">
            <svg width="22" height="22" viewBox="0 0 24 24" stroke="#111" strokeWidth="2" fill="none">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex h-[calc(100%-116px)] flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {loading && <div className="py-10 text-center text-sm text-neutral-500">Загружаем…</div>}
            {!loading && items.length === 0 && (
              <div className="py-10 text-center text-sm text-neutral-500">В избранном пока пусто</div>
            )}
            <ul className="space-y-4">
              {items.map(p => (
                <li key={p.id} className="flex gap-4 rounded-2xl border p-3">
                  <a href={`/product/${p.slug}`} className="block w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.cover_url ?? "/placeholder.svg"} alt={p.title} className="h-24 w-24 object-cover" />
                  </a>
                  <div className="min-w-0 flex-1">
                    <a href={`/product/${p.slug}`} className="line-clamp-2 font-medium hover:underline">
                      {p.title}
                    </a>
                    <div className="mt-1 text-sm text-neutral-500">{fmtRub(p.price_cents)}</div>
                    <div className="mt-2 flex gap-3">
                      <a
                        href={`/product/${p.slug}`}
                        className="rounded-lg bg-black px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white"
                      >
                        К товару
                      </a>
                      <button
                        onClick={() => toggleFav(p.id)}
                        className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t p-4">
            <button
              onClick={clearFavs}
              className="w-full rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-neutral-50"
            >
              Очистить раздел
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

