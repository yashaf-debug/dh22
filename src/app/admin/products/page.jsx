"use client";
export const runtime = 'edge';
import { useEffect, useState } from "react";
import Link from "next/link";
import { authHeaders } from "../_lib";
import { resolveImageUrl } from "@/lib/images";

export default function AdminProductsList({ searchParams }) {
  const t = searchParams?.t || "";
  const [q, setQ] = useState(searchParams?.q || "");
  const [items, setItems] = useState([]);

  async function load() {
    const r = await fetch(`/api/admin/products?q=${encodeURIComponent(q)}`, { cache: "no-store", headers: authHeaders(t) });
    const j = await r.json();
    setItems(j?.items || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);
  return (
    <div className="container mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl">Товары</h1>
      <div className="flex gap-2">
        <input className="border px-2 py-1" placeholder="поиск…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="border px-3" onClick={load}>Искать</button>
        <Link href="/admin/products/new" className="btn btn-sm">+ Новый</Link>
      </div>
      <div className="divide-y">
          {items.map((p) => {
            const img = resolveImageUrl(p.main_image || p.image_url);
            return (
              <div key={p.id} className="py-3 flex items-center gap-4">
                <img src={img} alt="" className="w-12 h-12 object-cover border" />
                <div className="flex-1">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm opacity-70">{p.slug} • {p.category || "—"} • {p.active ? "активен" : "скрыт"} • остаток {p.quantity}</div>
                </div>
                <Link className="border px-3 py-1" href={`/admin/products/${p.id}?t=${encodeURIComponent(t)}`}>Править</Link>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={async () => {
                    if (!confirm('Удалить товар?')) return;
                    await fetch(`/api/admin/products/${p.id}`, { method:'DELETE', headers: authHeaders(t) });
                    load();
                  }}
                >Удалить</button>
              </div>
            );
          })}
      </div>
    </div>
  );
}

