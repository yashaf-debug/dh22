export type Raw = Record<string, any>;

function firstFromJsonArray(s: any): string | null {
  try {
    const arr = typeof s === "string" ? JSON.parse(s) : Array.isArray(s) ? s : [];
    return Array.isArray(arr) && arr.length ? String(arr[0]) : null;
  } catch {
    return null;
  }
}

export function normalizeProduct(p: Raw) {
  // Титул — из name/slug
  const title = p.name ?? p.title ?? p.slug ?? "Товар";

  // Цена храним в копейках (у вас price=529000 -> 5 290 ₽)
  const price_cents = typeof p.price === "number" ? p.price : 0;

  // Картинка — main_image / image_url / первый из images_json
  const cover =
    p.main_image ??
    p.image_url ??
    firstFromJsonArray(p.images_json) ??
    "/placeholder.svg";

  // Суммарный остаток: variants.stock -> p.quantity -> p.stock
  const stock_total = typeof p.variants_stock === "number"
    ? p.variants_stock
    : (typeof p.quantity === "number" ? p.quantity
       : (typeof p.stock === "number" ? p.stock : 0));

  return {
    id: p.id,
    slug: p.slug ?? String(p.id ?? ""),
    title,
    price_cents,
    cover_url: cover,
    category: p.category ?? null,
    subcategory: p.subcategory ?? null,
    active: p.active ?? 1,
    is_new: p.is_new ?? 0,
    stock_total,
  };
}

export function fmtRub(cents: number) {
  const rub = Math.round((cents ?? 0) / 100);
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(rub);
}

