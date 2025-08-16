'use client';
import { useFavorites } from '@/store/favorites';
import { useUI } from '@/store/ui';
import { fmtRub } from '@/lib/normalize';

export default function FavoritesSheet() {
  const { favsOpen, closeFavs } = useUI();
  const favs = useFavorites((s) => s.list());
  const remove = useFavorites((s) => s.remove);
  const clear  = useFavorites((s) => s.clear);

  return (
    <div
      aria-hidden={!favsOpen}
      className={`fixed inset-0 z-[70] ${favsOpen ? '' : 'pointer-events-none'}`}
    >
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity ${favsOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={closeFavs}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-[520px] bg-white shadow-xl transition-transform
                    ${favsOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog" aria-label="Избранное"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-xl font-extrabold uppercase tracking-wide">Избранное</h3>
          <button onClick={closeFavs} className="rounded-full p-2 hover:bg-black/5">&times;</button>
        </div>

        {favs.length === 0 ? (
          <div className="grid h-[calc(100%-64px)] place-items-center p-6 text-neutral-500">
            Список пуст 🙌
          </div>
        ) : (
          <div className="flex h-[calc(100%-64px)] flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {favs.map((p) => (
                <a key={p.id} href={`/product/${p.slug}`} className="flex gap-4 rounded-xl border p-3 hover:bg-neutral-50">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.cover_url || '/placeholder.svg'} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p.title}</div>
                    <div className="mt-1 text-[13px] font-semibold">{fmtRub(p.price_cents)}</div>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); remove(p.id); }}
                    className="self-start rounded-full p-2 text-neutral-500 hover:bg-black/5"
                    aria-label="Убрать из избранного"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" className="fill-current"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.5C11.59 5.01 13.26 4 15 4 17.5 4 19.5 6 19.5 8.5c0 3.78-3.4 6.86-8.05 11.54L12 21.35z"/></svg>
                  </button>
                </a>
              ))}
            </div>

            <div className="border-t p-4">
              <button onClick={clear} className="w-full rounded-xl border px-4 py-3 text-sm font-semibold hover:bg-neutral-50">
                Очистить раздел
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
