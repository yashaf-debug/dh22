export function resolveImageUrl(src?: string, variant = 'public') {
  if (!src) return '/placeholder.svg';
  if (src.startsWith('http')) return src;
  if (src.startsWith('/i/')) {
    const id = src.split('/').pop()!;
    const base = process.env.NEXT_PUBLIC_CF_IMAGES_BASE; // напр. https://imagedelivery.net/<HASH>
    return base ? `${base}/${id}/${variant}` : `/i/${id}`;
  }
  return src;
}
export function firstFromJsonArray(json?: string): string | undefined {
  if (!json) return undefined;
  try { const arr = JSON.parse(json); return Array.isArray(arr) && arr.length ? arr[0] : undefined; } catch { return undefined; }
}
export function formatPriceRubKopecks(v?: number, currency = 'RUB') {
  if (!v && v !== 0) return '';
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(v / 100);
}
