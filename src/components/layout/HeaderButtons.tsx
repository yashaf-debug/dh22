'use client';
import { useFavorites } from '@/store/favorites';
import { useCart } from '@/store/cart';
import { useUI } from '@/store/ui';

function Pill({children, onClick}:{children:React.ReactNode; onClick:()=>void}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border bg-white/90 px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur hover:bg-white"
    >
      {children}
    </button>
  );
}

export function FavoritesButton() {
  const count = useFavorites((s) => s.count);
  const open = useUI((s) => s.openFavs);
  return (
    <Pill onClick={open}>
      <svg width="18" height="18" viewBox="0 0 24 24" className="fill-current"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.5C11.59 5.01 13.26 4 15 4 17.5 4 19.5 6 19.5 8.5c0 3.78-3.4 6.86-8.05 11.54L12 21.35z"/></svg>
      Избранное
      <span className="rounded-full bg-neutral-900 px-2 py-[2px] text-xs text-white">{count()}</span>
    </Pill>
  );
}

export function CartButton() {
  const qty = useCart((s) => s.count());
  const open = useUI((s) => s.openCart);
  return (
    <Pill onClick={open}>
      <svg width="18" height="18" viewBox="0 0 24 24" className="fill-current"><path d="M7 4h-2l-1 2h-2v2h2l3.6 7.59-1.35 2.44c-.16.28-.25.61-.25.95 0 1.1.9 2 2 2h12v-2h-11.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.62h6.74c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1h-14.31l-.94-2zm3 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm8 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
      Корзина
      <span className="rounded-full bg-neutral-900 px-2 py-[2px] text-xs text-white">{qty}</span>
    </Pill>
  );
}

