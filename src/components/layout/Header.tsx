import Link from "next/link";
import Nav from "@/components/layout/Nav";

export default function Header() {
  return (
    <header className="fixed left-1/2 top-4 z-[100] w-[calc(100%-48px)] max-w-[1400px] -translate-x-1/2 rounded-full border border-black/10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
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
    </header>
  );
}
