"use client";

import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";

type ChipProps = {
  href: string;
  label: string;
  title: string;
  icon: "heart" | "cart";
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

const ACCENT = "#7B61FF";

function Chip({ href, label, title, icon, onClick }: ChipProps) {
  return (
    <a
      href={href}
      title={title}
      onClick={onClick}
      className="relative inline-flex items-center justify-center rounded-full border border-black/10 bg-white p-3 shadow-sm md:hidden"
      aria-label={label}
    >
      {icon === "heart" ? (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="none"
            stroke={ACCENT}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
          />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="none"
            stroke={ACCENT}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 6h15l-1.5 9h-12zM6 6l-1-3H2M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          />
        </svg>
      )}
    </a>
  );
}

export default function HeaderButtons({
  favCount = 0,
}: {
  favCount?: number;
}) {
  const cartItemCount = useCart((s) => s.count());
  const { openFavs, openCart } = useUI();
  const onFavsClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();
    openFavs();
  };
  const onCartClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (cartItemCount === 0) {
      e.preventDefault();
      openCart();
    }
  };
  return (
    <div className="flex items-center gap-3">
      <Chip
        href="#"
        label="Избранное"
        title="Избранное"
        icon="heart"
        onClick={onFavsClick}
      />
      <Chip
        href="/cart"
        label="Корзина"
        title="Корзина"
        icon="cart"
        onClick={onCartClick}
      />

      <a
        href="#"
        className="hidden md:inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 shadow-sm"
        onClick={onFavsClick}
      >
        <span className="text-[15px] font-semibold">Избранное</span>
        <span className="ml-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-black/80 px-2 text-xs font-bold text-white">
          {favCount}
        </span>
      </a>
      <a
        href="/cart"
        className="hidden md:inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 shadow-sm"
        onClick={onCartClick}
      >
        <span className="text-[15px] font-semibold">Корзина</span>
        <span className="ml-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-black/80 px-2 text-xs font-bold text-white">
          {cartItemCount}
        </span>
      </a>
    </div>
  );
}

