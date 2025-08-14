const R2_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_BASE || '').replace(/\/+$/, '');
const CF_BASE = (process.env.NEXT_PUBLIC_CF_IMAGES_BASE || '').replace(/\/+$/, '');
const DEFAULT_OPTS = 'width=1200,quality=85';

export function resolveImageUrl(src?: string, opts = DEFAULT_OPTS) {
  if (!src) return '/placeholder.svg';

  // Полные внешние ссылки
  if (src.startsWith('http')) return `/cdn-cgi/image/${opts}/${src}`;

  // Локальные ассеты сайта
  if (src.startsWith('/images/') || src.startsWith('/placeholder.svg')) return src;

  // Старые Cloudflare Images: /i/<id>
  if (src.startsWith('/i/')) {
    const id = src.replace(/^\/?i\//, '');
    if (CF_BASE) return `${CF_BASE}/${id}/public`;
    return '/placeholder.svg';
  }

  // R2: /r2/<key> или просто <key>
  const key = src.replace(/^\/?r2\//, '');
  if (R2_BASE) return `/cdn-cgi/image/${opts}/${R2_BASE}/${encodeURI(key)}`;

  // Фолбэк — вернём как есть
  return src;
}

export function firstFromJsonArray(json?: string): string | undefined {
  if (!json) return undefined;
  try { const arr = JSON.parse(json); return Array.isArray(arr) && arr.length ? arr[0] : undefined; } catch { return undefined; }
}

export function formatPriceRubKopecks(v?: number, currency = 'RUB') {
  if (v === undefined || v === null) return '';
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(v / 100);
}
