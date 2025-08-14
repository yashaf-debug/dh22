"use client";
import { useState } from "react";
import { authHeaders } from "../_lib";
import { resolveImageUrl } from "@/lib/images";

function safeJsonArray(v) {
  try {
    if (Array.isArray(v)) return v;
    const p = JSON.parse(String(v));
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

export default function ProductForm({ token, initial, onSaved }) {
  const [form, setForm] = useState(initial || { active: true, quantity: 0 });
  const [sizes, setSizes] = useState(initial?.sizes ? String(initial.sizes) : "[]");
  const [colors, setColors] = useState(initial?.colors ? String(initial.colors) : "[]");

  function set(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }
  async function uploadToR2(file) {
    const fd = new FormData();
    fd.set('file', file);
    const res = await fetch('/api/images/upload-r2', { method:'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'upload error');
    // data.stored = "/r/<key>"
    set('main_image', data.stored);
  }
  async function submit() {
    const payload = {
      ...form,
      price: Number(form.price) || 0,
      quantity: Number(form.quantity) || 0,
      sizes: safeJsonArray(sizes),
      colors: safeJsonArray(colors),
    };
    const method = form.id ? "PATCH" : "POST";
    const url = form.id ? `/api/admin/products/${form.id}` : "/api/admin/products";
    const r = await fetch(url, { method, headers: { "content-type": "application/json", ...authHeaders(token) }, body: JSON.stringify(payload) });
    const ct = r.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? await r.json() : { ok: false, error: await r.text() };
    if (!data.ok) {
      alert(`Ошибка: ${data.error}${data.detail ? " — "+data.detail : ""}`);
      return;
    }
    onSaved && onSaved(data);
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col">Slug
          <input className="border px-2 py-1" value={form.slug || ""} onChange={(e) => set("slug", e.target.value)} />
        </label>
        <label className="flex flex-col">Название
          <input className="border px-2 py-1" value={form.name || ""} onChange={(e) => set("name", e.target.value)} />
        </label>
        <label className="flex flex-col">Категория
          <input className="border px-2 py-1" value={form.category || ""} onChange={(e) => set("category", e.target.value)} />
        </label>
        <label className="flex flex-col">Цена (в копейках)
          <input type="number" className="border px-2 py-1" value={form.price || 0} onChange={(e) => set("price", e.target.value)} />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!!form.active} onChange={(e) => set("active", e.target.checked)} /> Активен
        </label>
        <label className="flex flex-col">Остаток
          <input type="number" className="border px-2 py-1" value={form.quantity || 0} onChange={(e) => set("quantity", e.target.value)} />
        </label>
      </div>

      <label className="flex flex-col">Описание
        <textarea className="border px-2 py-1" rows={6} value={form.description || ""} onChange={(e) => set("description", e.target.value)} />
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col">Основное фото URL
          <input className="border px-2 py-1" value={form.main_image || ""} onChange={(e) => set("main_image", e.target.value)} />
        </label>
        <div className="flex items-center gap-2">
          <input type="file" onChange={async (e)=>{
            const f = e.currentTarget.files?.[0];
            if (!f) return;
            try { await uploadToR2(f); } catch {}
          }} />
        </div>
      </div>
      {form.main_image ? (
        <img
          src={resolveImageUrl(form.main_image, 'width=600,fit=cover')}
          alt="preview"
          className="h-24 w-auto border mt-2 object-contain"
        />
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col">Размеры (JSON)
          <input className="border px-2 py-1" value={sizes} onChange={(e) => setSizes(e.target.value)} />
        </label>
        <label className="flex flex-col">Цвета (JSON)
          <input className="border px-2 py-1" value={colors} onChange={(e) => setColors(e.target.value)} />
        </label>
      </div>

      <button className="border px-4 py-2" onClick={submit}>{form.id ? "Сохранить" : "Создать"}</button>
    </div>
  );
}

