"use client";
import { useFavorites, type FavItem } from '@/store/favorites';

export default function FavHeart({
  item,
  size = 22,
  className = "",
}: { item: FavItem; size?: number; className?: string }) {
  const toggle = useFavorites((s) => s.toggle);
  const isFav = useFavorites((s) => s.has(item.id));

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        toggle(item);
      }}
      aria-label={isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
      className={`absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 shadow transition ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className={isFav ? 'fill-[#7B61FF] text-[#7B61FF]' : 'fill-neutral-800 text-neutral-800'}
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.5C11.59 5.01 13.26 4 15 4 17.5 4 19.5 6 19.5 8.5c0 3.78-3.4 6.86-8.05 11.54L12 21.35z"/>
      </svg>
    </button>
  );
}

