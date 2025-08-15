"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function StickyHeader() {
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 60);
    onScroll(); window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: stuck ? 0 : -64, opacity: stuck ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className="fixed inset-x-0 top-0 z-50 page-wrap"
    >
      <div className="rounded-dh22 border border-black/5 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex items-center justify-between px-4 py-3 text-[13px] uppercase tracking-wide">
          <nav className="hidden gap-6 md:flex">
            <Link href="/new" className="hover:opacity-70">Новинки</Link>
            <Link href="/womens" className="hover:opacity-70">Женская одежда</Link>
            <Link href="/accessories" className="hover:opacity-70">Аксессуары</Link>
            <Link href="/info" className="hover:opacity-70">Информация</Link>
            <Link href="/about" className="hover:opacity-70">О бренде</Link>
            <Link href="/gift-card" className="hover:opacity-70">Gift Card</Link>
          </nav>
          <Link href="/" className="wordmark text-lg font-semibold tracking-widest">
            DH22
          </Link>
          <nav className="flex gap-6">
            <Link href="/favorites" className="hover:opacity-70">Избранное (0)</Link>
            <Link href="/cart" className="hover:opacity-70">Корзина (0)</Link>
          </nav>
        </div>
      </div>
    </motion.header>
  );
}
