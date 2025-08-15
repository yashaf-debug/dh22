"use client";
import Link from "next/link";
import { useAdminToken } from "./useAdminToken";

export default function AdminNav() {
  const t = useAdminToken();
  return (
    <nav className="text-lg font-semibold">
      <Link href={{ pathname: "/admin", query: t ? { t } : {} }} className="mr-4 hover:underline">
        Заказы
      </Link>
      <Link href={{ pathname: "/admin/products", query: t ? { t } : {} }} className="hover:underline">
        Каталог
      </Link>
    </nav>
  );
}
