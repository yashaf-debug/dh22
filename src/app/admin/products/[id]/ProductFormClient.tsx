"use client";
import { useEffect, useMemo, useState } from "react";
import { adminFetch } from "@/lib/adminFetch";

const CATS: Record<string, string[]> = {
  "Одежда": ["Платья","Футболки","Юбки","Жакеты"],
  "Аксессуары": ["Сумки","Ремни","Украшения"],
};

type Variant = { id?: number; color?: string; size?: string; stock?: number; sku?: string };

export default function ProductFormClient({ product, variants: initialVariants }: { product: any; variants: Variant[] }) {
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [priceRub, setPriceRub] = useState(() => Number(product?.price ?? 0) / 100);
  const [currency, setCurrency] = useState(product?.currency ?? "RUB");
  const [active, setActive] = useState(Boolean(product?.active ?? 1));
  const [isNew, setIsNew] = useState(Boolean(product?.is_new ?? 0));
  const [category, setCategory] = useState(
    product?.category === "Женская одежда" ? "Одежда" : (product?.category ?? "")
  );
  const [subcategory, setSubcategory] = useState(product?.subcategory ?? "");

  const [mainImage, setMainImage] = useState(product?.main_image ?? "");
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [imagesJson, setImagesJson] = useState(
    product?.images_json
      ? typeof product.images_json === "string"
        ? product.images_json
        : JSON.stringify(product.images_json)
      : "[]"
  );
  const [sizesJson, setSizesJson] = useState(
    product?.sizes_json
      ? typeof product.sizes_json === "string"
        ? product.sizes_json
        : JSON.stringify(product.sizes_json)
      : "[]"
  );
  const [colorsJson, setColorsJson] = useState(
    product?.colors_json
      ? typeof product.colors_json === "string"
        ? product.colors_json
        : JSON.stringify(product.colors_json)
      : "[]"
  );

  const [quantity, setQuantity] = useState<number | "">(product?.quantity ?? "");
  const [variants, setVariants] = useState<Variant[]>(
    (initialVariants || []).map(v => ({
      id: v.id,
      color: v.color ?? "",
      size: v.size ?? "",
      stock: Number(v.stock ?? 0),
      sku: v.sku ?? "",
    }))
  );

  const subcats = useMemo(() => CATS[category] ?? [], [category]);

  function addVariant() {
    setVariants(v => [...v, { color: "", size: "", stock: 0, sku: "" }]);
  }
  function removeVariant(idx: number) {
    setVariants(v => v.filter((_, i) => i !== idx));
  }
  function updateVariant(idx: number, patch: Partial<Variant>) {
    setVariants(v => v.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  }

  function safeArray(text: string) {
    const t = (text || "").trim();
    if (!t) return "[]";
    if (t.startsWith("[")) {
      try {
        JSON.parse(t);
        return t;
      } catch {
        /* fallthrough */
      }
    }
    const arr = t.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
    return JSON.stringify(arr);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("name", name);
      fd.set("slug", slug);
      fd.set("description", description);
      fd.set("price", String(Math.round(Number(priceRub || 0) * 100)));
      fd.set("currency", currency);
      fd.set("active", active ? "1" : "0");
      fd.set("is_new", isNew ? "1" : "0");
      fd.set("category", category);
      fd.set("subcategory", subcategory);
      fd.set("main_image", mainImage);
      fd.set("image_url", imageUrl);
      fd.set("images_json", safeArray(imagesJson));
      fd.set("sizes_json", safeArray(sizesJson));
      fd.set("colors_json", safeArray(colorsJson));
      if (quantity !== "") fd.set("quantity", String(quantity));

      fd.set(
        "variants",
        JSON.stringify(
          variants.map(v => ({
            color: v.color ?? "",
            size: v.size ?? "",
            stock: Number(v.stock ?? 0),
            sku: v.sku ?? "",
          }))
        )
      );

      const res = await adminFetch(`/api/admin/products/${product.id}`, { method: "POST", body: fd });
      const ok =
        res.ok &&
        ((await res.clone().text()).trim() === "" || (await res.json().catch(() => ({ ok: true }))).ok !== false);
      alert(ok ? "Сохранено" : "Не удалось сохранить");
      if (ok) location.reload();
    } catch (err) {
      alert("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <label className="block">
            <div className="mb-1 text-sm font-medium">Название</div>
            <input value={name} onChange={e => setName(e.target.value)} className="h-10 w-full rounded border px-3" />
          </label>
          <label className="block">
            <div className="mb-1 text-sm font-medium">Слаг</div>
            <input value={slug} onChange={e => setSlug(e.target.value)} className="h-10 w-full rounded border px-3" />
          </label>
          <label className="block">
            <div className="mb-1 text-sm font-medium">Описание</div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="min-h-[96px] w-full rounded border p-3"
            />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="col-span-2 block">
              <div className="mb-1 text-sm font-medium">Цена (₽)</div>
              <input
                type="number"
                step="0.01"
                value={priceRub}
                onChange={e => setPriceRub(Number(e.target.value))}
                className="h-10 w-full rounded border px-3"
              />
            </label>
            <label className="block">
              <div className="mb-1 text-sm font-medium">Валюта</div>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className="h-10 w-full rounded border px-3">
                <option value="RUB">RUB</option>
              </select>
            </label>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
              <span>Активен</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isNew} onChange={e => setIsNew(e.target.checked)} />
              <span>Новинка</span>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="block">
              <div className="mb-1 text-sm font-medium">Категория</div>
              <select value={category} onChange={e => setCategory(e.target.value)} className="h-10 w-full rounded border px-3">
                <option value="">—</option>
                {Object.keys(CATS).map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <div className="mb-1 text-sm font-medium">Подкатегория</div>
              <select
                value={subcategory}
                onChange={e => setSubcategory(e.target.value)}
                className="h-10 w-full rounded border px-3"
              >
                <option value="">—</option>
                {subcats.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <div className="mb-1 text-sm font-medium">Главное изображение (URL)</div>
            <input value={mainImage} onChange={e => setMainImage(e.target.value)} className="h-10 w-full rounded border px-3" />
          </label>
          <label className="block">
            <div className="mb-1 text-sm font-medium">Альтернативный URL</div>
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="h-10 w-full rounded border px-3" />
          </label>
          <label className="block">
            <div className="mb-1 text-sm font-medium">Галерея (JSON или через запятую/строки)</div>
            <textarea
              value={imagesJson}
              onChange={e => setImagesJson(e.target.value)}
              className="min-h-[80px] w-full rounded border p-2 monospace"
            />
          </label>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="block">
              <div className="mb-1 text-sm font-medium">Размеры (JSON или список)</div>
              <textarea
                value={sizesJson}
                onChange={e => setSizesJson(e.target.value)}
                className="min-h-[80px] w-full rounded border p-2 monospace"
              />
            </label>
            <label className="block">
              <div className="mb-1 text-sm font-medium">Цвета (JSON или список)</div>
              <textarea
                value={colorsJson}
                onChange={e => setColorsJson(e.target.value)}
                className="min-h-[80px] w-full rounded border p-2 monospace"
              />
            </label>
          </div>

          <label className="block">
            <div className="mb-1 text-sm font-medium">Количество (legacy, необязательно)</div>
            <input
              type="number"
              value={quantity}
              onChange={e => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
              className="h-10 w-full rounded border px-3"
            />
          </label>
        </div>
      </div>

      <div>
        <div className="mb-3 text-lg font-semibold">Варианты</div>
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-3 py-2 text-left">Цвет</th>
                <th className="px-3 py-2 text-left">Размер</th>
                <th className="px-3 py-2 text-left">Остаток</th>
                <th className="px-3 py-2 text-left">SKU</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {variants.map((v, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2">
                    <input
                      value={v.color ?? ""}
                      onChange={e => updateVariant(i, { color: e.target.value })}
                      className="h-9 w-full rounded border px-2"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={v.size ?? ""}
                      onChange={e => updateVariant(i, { size: e.target.value })}
                      className="h-9 w-full rounded border px-2"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={v.stock ?? 0}
                      onChange={e => updateVariant(i, { stock: Number(e.target.value) })}
                      className="h-9 w-full rounded border px-2"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={v.sku ?? ""}
                      onChange={e => updateVariant(i, { sku: e.target.value })}
                      className="h-9 w-full rounded border px-2"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="rounded border px-2 py-1"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={addVariant} className="mt-3 rounded border px-3 py-1">
          + добавить вариант
        </button>
      </div>

      <button disabled={saving} className="rounded border px-4 py-2">
        {saving ? "Сохраняю…" : "Сохранить"}
      </button>
    </form>
  );
}

