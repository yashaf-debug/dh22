"use client";
import * as React from "react";
import { readFavs, subscribeFavs } from "@/lib/favorites";
import Link from "next/link";

export default function FavBadge({ className = "" }: { className?: string }) {
  const [count, setCount] = React.useState<number>(0);

  React.useEffect(() => {
    setCount(readFavs().length);
    return subscribeFavs(ids => setCount(ids.length));
  }, []);

  return (
    <Link
      href="/#favorites"
      className={`flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-medium shadow hover:bg-white ${className}`}
      aria-label="Открыть избранное"
    >
      {/* сердечко */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"
           strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      <span className="whitespace-nowrap">Избранное ({count})</span>
    </Link>
  );
}

