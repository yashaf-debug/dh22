export type Raw = Record<string, any>;

export function pickTitle(p: Raw) {
  return p.title ?? p.name ?? p.product_name ?? p.title_ru ?? p.slug ?? "Товар";
}
export function pickPrice(p: Raw) {
  // храним в копейках? поддержим оба варианта
  if (typeof p.price_cents === "number") return p.price_cents;
  if (typeof p.price === "number") return p.price; // уже в копейках
  return 0;
}
export function pickCover(p: Raw) {
  return p.cover_url ?? p.image_url ?? p.image ?? p.cover ?? "/placeholder.svg";
}
export function normalize(p: Raw) {
  return {
    id: p.id,
    slug: p.slug ?? String(p.id ?? ""),
    title: pickTitle(p),
    price_cents: pickPrice(p),
    cover_url: pickCover(p),
    // мягкие флаги (если колонок нет — дефолт)
    is_sale: p.is_sale ?? 0,
    is_bestseller: p.is_bestseller ?? 0,
    tags: p.tags ?? "",
  };
}
