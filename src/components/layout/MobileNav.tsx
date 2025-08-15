"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const nav = [
  { href: "/new",              label: "Новинки" },
  { href: "/catalog/clothes",  label: "Одежда" },
  { href: "/catalog/accessories", label: "Аксессуары" },
  { href: "/info",             label: "Информация" },
  { href: "/about",            label: "О бренде" },
  { href: "/gift-card",        label: "Gift Card" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  // Блокируем скролл при открытом меню
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Пилловая шапка — ВСЕГДА видна */}
      <div className="fixed left-1/2 top-2 z-[60] w-[calc(100%-24px)] -translate-x-1/2 rounded-full bg-white/85 shadow backdrop-blur md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            aria-label="Открыть меню"
            onClick={() => setOpen(true)}
            className="h-8 w-8 rounded-full ring-accent/20 hover:ring-2"
          >
            {/* иконка бургер */}
            <span className="block h-[2px] w-6 bg-black" />
            <span className="mt-1 block h-[2px] w-6 bg-black" />
            <span className="mt-1 block h-[2px] w-6 bg-black" />
          </button>

          <Link href="/" className="text-xl font-black tracking-wide">DH22</Link>

          <div className="flex items-center gap-4 text-sm">
            <Link href="/favorites" className="opacity-80">Избранное (0)</Link>
            <Link href="/cart" className="opacity-80">Корзина (0)</Link>
          </div>
        </div>
      </div>

      {/* Оверлей + сайд-панель */}
      {open && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <button
            aria-label="Закрыть меню"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <aside
            className="absolute left-0 top-0 h-full w-[82%] max-w-[360px] translate-x-0 bg-white p-6 shadow-2xl transition"
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
              {nav.map((i) => (
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
    </>
  );
}

