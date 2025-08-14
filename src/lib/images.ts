const R2_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_BASE || '').replace(/\/+$/, '');
const CF_BASE = (process.env.NEXT_PUBLIC_CF_IMAGES_BASE || '').replace(/\/+$/, '');
const DEFAULT_OPTS = 'width=1200,quality=85';

export function resolveImageUrl(src?: string, opts = DEFAULT_OPTS) {
  // совсем пусто → плейсхолдер
  if (!src) return '/placeholder.svg';

  // абсолютный URL? оборачиваем в /cdn-cgi/image
  if (/^https?:\/\//i.test(src)) return `/cdn-cgi/image/${opts}/${src}`;

  // локальные иконки, svg и т.п.
  if (src.startsWith('/images/') || src === '/placeholder.svg') return src;

  // старые Cloudflare Images: /i/<id>
  if (src.startsWith('/i/')) {
    const id = src.replace(/^\/?i\//, '');
    return CF_BASE ? `${CF_BASE}/${id}/public` : '/placeholder.svg';
  }

  // R2: допускаем '/r2/<key>' или просто '<key>'
  const key = src.replace(/^\/?r2\//, '');
  if (R2_BASE) return `/cdn-cgi/image/${opts}/${R2_BASE}/${encodeURI(key)}`;

  // бэкап
  return '/placeholder.svg';
}

export function rubKopecks(v?: number) {
  if (v == null) return '';
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(v / 100);
}
