'use client';
import Link from "next/link";

export default function AdminHeader({ token }) {
  const t = encodeURIComponent(token);
  return (
    <nav className="flex gap-4 border-b py-3 mb-6">
      <Link href={`/admin?t=${t}`}>Заказы</Link>
      <Link href={`/admin/products?t=${t}`}>Каталог</Link>
    </nav>
  );
}
