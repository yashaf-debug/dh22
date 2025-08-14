const R2_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_BASE || '').replace(/\/+$/,'');
const DEFAULT_OPTS = 'width=1200,quality=85';

export function resolveImageUrl(src?: string, opts = DEFAULT_OPTS) {
  if (!src) return '/placeholder.svg';
  if (src.startsWith('http')) return `/cdn-cgi/image/${opts}/${src}`;
  // поддерживаем хранение вида "/r2/<key>" или просто "<key>"
  const key = src.replace(/^\/?r2\//,'');
  if (!R2_BASE) return '/placeholder.svg';
  return `/cdn-cgi/image/${opts}/${R2_BASE}/${encodeURI(key)}`;
}

export function firstFromJsonArray(json?: string): string | undefined {
  if (!json) return undefined;
  try { const arr = JSON.parse(json); return Array.isArray(arr) && arr.length ? arr[0] : undefined; } catch { return undefined; }
}

export function formatPriceRubKopecks(v?: number, currency='RUB') {
  if (v===undefined || v===null) return '';
  return new Intl.NumberFormat('ru-RU',{style:'currency',currency}).format(v/100);
}
