'use client';
import { useCart } from '@/store/cart';
import { useUI } from '@/store/ui';
import { fmtRub } from '@/lib/normalize';

const ACCENT = '#7B61FF';

export default function CartSheet() {
  const { cartOpen, closeCart } = useUI();
  const lines   = useCart((s) => s.list());
  const subtotal = useCart((s) => s.subtotal());
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);

  return (
    <div aria-hidden={!cartOpen} className={`fixed inset-0 z-[70] ${cartOpen ? '' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity ${cartOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={closeCart}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-[520px] bg-white shadow-xl transition-transform
                    ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog" aria-label="Корзина"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-xl font-extrabold uppercase tracking-wide">Корзина</h3>
          <button onClick={closeCart} className="rounded-full p-2 hover:bg-black/5">&times;</button>
        </div>

        {lines.length === 0 ? (
          <div className="grid h-[calc(100%-64px)] place-items-center p-6 text-neutral-500">
            Ваша корзина пуста
          </div>
        ) : (
          <div className="flex h-[calc(100%-64px)] flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {lines.map((l) => (
                <div key={l.key} className="flex gap-4 rounded-xl border p-3">
                  <a href={`/product/${l.slug}`} className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.cover_url || '/placeholder.svg'} alt="" className="h-full w-full object-cover" />
                  </a>

                  <div className="min-w-0 flex-1">
                    <a href={`/product/${l.slug}`} className="block truncate text-sm font-medium hover:underline">
                      {l.title}
                    </a>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-neutral-600">
                      {l.color ? <span className="rounded-full bg-neutral-100 px-2 py-[2px]">Цвет: {l.color}</span> : null}
                      {l.size ? <span className="rounded-full bg-neutral-100 px-2 py-[2px]">Размер: {l.size}</span> : null}
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center rounded-full border">
                        <button onClick={() => dec(l.key)} className="h-8 w-8 rounded-full text-lg">−</button>
                        <div className="min-w-[36px] text-center text-sm">{l.qty}</div>
                        <button onClick={() => inc(l.key)} className="h-8 w-8 rounded-full text-lg">＋</button>
                      </div>
                      <div className="ml-auto text-[15px] font-semibold">{fmtRub(l.price_cents * l.qty)}</div>
                      <button
                        onClick={() => remove(l.key)}
                        className="rounded-full p-2 text-neutral-500 hover:bg-black/5"
                        aria-label="Удалить позицию"
                      >
                        &#10005;
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t p-6">
              <div className="mb-3 flex items-center justify-between text-[15px]">
                <span className="text-neutral-700">Итого</span>
                <span className="font-semibold">{fmtRub(subtotal)}</span>
              </div>

              <div className="flex gap-3">
                <a
                  href="/checkout"
                  className="inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: ACCENT }}
                >
                  Оформить заказ
                </a>
                <button
                  onClick={clear}
                  className="rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-neutral-50"
                >
                  Очистить
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

