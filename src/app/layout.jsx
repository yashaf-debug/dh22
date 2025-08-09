import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "DH22 — Магазин",
  description: "Плотная ткань / Контрастный шов / Точная посадка"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body className="font-sans">
        <header className="border-b border-black/10">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-6">
            <Link href="/" className="text-2xl tracking-tight">DH22</Link>
            <nav className="flex items-center gap-5">
              <Link className="navlink" href="/new">Новинки</Link>
              <Link className="navlink" href="/women">Женская одежда</Link>
              <Link className="navlink" href="/accessories">Аксессуары</Link>
              <Link className="navlink" href="/cart">Корзина</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-black/10 mt-16">
          <div className="container mx-auto px-4 py-10 text-sm flex flex-col md:flex-row gap-4 justify-between">
            <div>© {new Date().getFullYear()} DH22</div>
            <div className="opacity-70">Доставка / Возврат / Политика конфиденциальности</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
