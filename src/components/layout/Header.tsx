"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/layout/Nav";

const navItems = [
  { href: "/new", label: "Новинки" },
  { href: "/catalog/clothes", label: "Одежда" },
  { href: "/catalog/accessories", label: "Аксессуары" },
  { href: "/info", label: "Информация" },
  { href: "/about", label: "О бренде" },
  { href: "/gift-card", label: "Gift Card" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className="sticky z-40 mx-auto w-[calc(100%-48px)] max-w-[1400px]"
      style={{ top: "max(12px, env(safe-area-inset-top))" }}
    >
      {/* Desktop версия: видна только >= md */}
      <div className="hidden md:block">
        {/* DESKTOP BAR */}
        <div className="rounded-full border border-black/10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="flex items-center justify-between px-4 py-3 text-[13px] uppercase tracking-wide">
            <Nav />
            <Link href="/" className="wordmark text-lg font-semibold tracking-widest">
              DH22
            </Link>
            <nav className="flex gap-6">
              <Link href="/favorites" className="hover:opacity-70">
                Избранное (0)
              </Link>
              <Link href="/cart" className="hover:opacity-70">
                Корзина (0)
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile версия: видна только < md */}
      <div className="md:hidden">
        {/* MOBILE BAR */}
        <div className="rounded-full bg-white/85 shadow backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              aria-label="Открыть меню"
              onClick={() => setOpen(true)}
              className="h-8 w-8 rounded-full ring-accent/20 hover:ring-2"
            >
              <span className="block h-[2px] w-6 bg-black" />
              <span className="mt-1 block h-[2px] w-6 bg-black" />
              <span className="mt-1 block h-[2px] w-6 bg-black" />
            </button>

            <Link href="/" className="text-xl font-black tracking-wide">
              DH22
            </Link>

            {/* RIGHT: fav + cart icons */}
            <div className="flex items-center gap-2">
              <a
                href="/favorites"
                aria-label="Избранное"
                className="relative grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow-sm ring-1 ring-black/5"
              >
                {/* Heart icon */}
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#7B61FF]" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
                </svg>
                <span className="sr-only">Избранное</span>
              </a>

              <a
                href="/cart"
                aria-label="Корзина"
                className="relative grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow-sm ring-1 ring-black/5"
              >
                {/* Cart icon */}
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#7B61FF]" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="9" cy="21" r="1.7" />
                  <circle cx="17" cy="21" r="1.7" />
                  <path d="M3 3h2l2.2 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6l1.3-7.2H6.2" />
                </svg>
                <span className="sr-only">Корзина</span>
              </a>
            </div>
          </div>
        </div>

        {open && (
          <div className="fixed inset-0 z-50">
            <button
              aria-label="Закрыть меню"
              onClick={() => setOpen(false)}
              className="absolute inset-0 z-50 bg-black/40"
            />
            <aside
              className="absolute left-0 top-0 z-50 h-full w-[82%] max-w-[360px] translate-x-0 bg-white p-6 shadow-2xl transition"
              role="dialog"
              aria-modal="true"
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="text-3xl font-extrabold">DH22</div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Закрыть меню"
                  className="h-8 w-8 rounded-full ring-accent/20 hover:ring-2"
                >
                  ✕
                </button>
              </div>

              <nav className="space-y-5">
                {navItems.map((i) => (
                  <Link
                    key={i.href}
                    href={i.href}
                    onClick={() => setOpen(false)}
                    className="block text-2xl font-semibold tracking-wide"
                  >
                    {i.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-10 space-y-3 text-sm text-neutral-600">
                <Link href="/privacy">Политика конфиденциальности</Link>
                <br />
                <Link href="/terms">Пользовательское соглашение</Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </header>
  );
}

