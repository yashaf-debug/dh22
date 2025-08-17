"use client";

const ACCENT = "#7B61FF";

function IconBtn({
  href,
  label,
  children,
  onClick,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full
                 border border-black/10 bg-white shadow-sm
                 hover:ring-2 hover:ring-[#7B61FF]/40 transition"
    >
      {children}
    </a>
  );
}

export default function HeaderIconActions() {
  return (
    <div className="ml-auto flex items-center gap-2">
      {/* Избранное */}
      <IconBtn href="/#favorites" label="Избранное">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
            fill="none"
            stroke={ACCENT}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </IconBtn>

      {/* Корзина */}
      <IconBtn href="/cart" label="Корзина">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M6 6h15l-1.5 9h-12zM6 6l-1-3H2M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
            fill="none"
            stroke={ACCENT}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </IconBtn>
    </div>
  );
}

