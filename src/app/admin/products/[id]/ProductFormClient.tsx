"use client";
import { useState } from "react";
import { adminFetch } from "@/lib/adminFetch";

const CATEGORIES = {
  "Женская одежда": ["Юбки", "Жакеты", "Платья", "Футболки"],
  "Аксессуары": ["Сумки", "Ремни", "Украшения", "Жакеты"], // примеры; поправьте под себя
};

export default function ProductFormClient({ product }: { product: any }) {
  const [saving, setSaving] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    // если есть таблица вариантов — соберём их в сериализованный вид, который ожидает API
    // (оставьте как у вас было; главное — отправлять на endpoint с токеном)
    setSaving(true);
    try {
      const res = await adminFetch(`/api/admin/products/${product.id}`, { method: "POST", body: fd });
      // ожидаем JSON { ok: true } либо просто 200 без тела
      let ok = res.ok;
      try {
        const json = await res.json();
        ok = ok && (json.ok ?? json.success ?? true);
      } catch { /* тело не JSON — трактуем как успех */ }
      alert(ok ? "Сохранено" : "Не удалось сохранить");
      if (ok) location.reload();
    } catch (e) {
      alert("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  const cat = product.category ?? "";
  const sub = product.subcategory ?? "";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* остальные поля name, slug, price, images ... */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <div className="mb-1 text-sm font-medium">Категория</div>
          <select name="category" defaultValue={cat} className="h-10 w-full rounded border px-3">
            <option value="">—</option>
            {Object.keys(CATEGORIES).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <div className="mb-1 text-sm font-medium">Подкатегория</div>
          <select name="subcategory" defaultValue={sub} className="h-10 w-full rounded border px-3">
            <option value="">—</option>
            {(CATEGORIES[cat] ?? []).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <button disabled={saving} className="rounded border px-4 py-2">
        {saving ? "Сохраняю..." : "Сохранить"}
      </button>
    </form>
  );
}
