"use client";
export const runtime = "edge";
import { useRef, useState } from "react";
import { withToken } from "../_lib";

export default function ProductForm({ token, initial, onSaved }) {
  const [form, setForm] = useState(initial || { active: true, quantity: 0, sizes: [], colors: [], gallery: [] });
  const fileRef = useRef(null);

  function set(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }
  async function upload() {
    const f = fileRef.current?.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append("file", f);
    const r = await fetch(withToken("/api/admin/uploads", token), { method: "POST", body: fd });
    const j = await r.json();
    if (j?.ok) set("main_image", j.url);
    else alert(j?.error || "upload error");
  }
  async function submit() {
    const body = { ...form, price: parseInt(form.price || 0) || 0, quantity: parseInt(form.quantity || 0) || 0 };
    const method = form.id ? "PATCH" : "POST";
    const url = form.id ? withToken(`/api/admin/products/${form.id}`, token) : withToken("/api/admin/products", token);
    const r = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json();
    if (j?.ok) onSaved && onSaved(j);
    else alert(j?.error || "save error");
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
          <input type="file" ref={fileRef} />
          <button type="button" className="border px-3 py-1" onClick={upload}>Загрузить</button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col">Размеры (JSON)
          <input className="border px-2 py-1" value={JSON.stringify(form.sizes || [])} onChange={(e) => set("sizes", JSON.parse(e.target.value || "[]"))} />
        </label>
        <label className="flex flex-col">Цвета (JSON)
          <input className="border px-2 py-1" value={JSON.stringify(form.colors || [])} onChange={(e) => set("colors", JSON.parse(e.target.value || "[]"))} />
        </label>
      </div>

      <button className="border px-4 py-2" onClick={submit}>{form.id ? "Сохранить" : "Создать"}</button>
    </div>
  );
}

