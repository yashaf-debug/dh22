"use client";
import * as React from "react";
import { isFav, toggleFav, subscribeFavs } from "@/lib/favorites";

export default function FavHeart({
  id,
  size = 22,
  className = "",
}: { id: number; size?: number; className?: string }) {
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    setActive(isFav(id));
    return subscribeFavs(() => setActive(isFav(id)));
  }, [id]);

  return (
    <button
      type="button"
      onClick={() => toggleFav(id)}
      aria-label={active ? "Убрать из избранного" : "Добавить в избранное"}
      className={`rounded-full bg-white/90 p-2 shadow transition hover:bg-white ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={active ? "#7B61FF" : "none"}
        stroke={active ? "#7B61FF" : "#111"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
  );
}

