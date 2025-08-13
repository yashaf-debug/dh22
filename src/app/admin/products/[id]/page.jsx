"use client";
export const runtime = 'edge';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "../_Form";
import { authHeaders } from "../../_lib";

export default function EditProductPage({ params, searchParams }) {
  const token = searchParams?.t || "";
  const router = useRouter();
  const [item, setItem] = useState(null);

  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/admin/products/${params.id}`, { cache: "no-store", headers: authHeaders(token) });
      const j = await r.json();
      setItem(j?.item || null);
    })();
  }, [params.id, token]);

  if (!item) return <div className="container mx-auto px-4 py-8">Загрузка…</div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl">Правка товара</h1>
      <ProductForm token={token} initial={item} onSaved={() => router.push(`/admin/products?t=${encodeURIComponent(token)}`)} />
    </div>
  );
}

