const R2_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_BASE || '').replace(/[/]+$/, '');
const CF_BASE = (process.env.NEXT_PUBLIC_CF_IMAGES_BASE || '').replace(/[/]+$/, '');
const DEFAULT_OPTS = 'width=1200,quality=85';

/** Вернёт корректный URL для <img>. Поддерживает:
 * - абсолютные http(s)
 * - локальные /images/*
 * - старые /i/<cf-image-id> (Cloudflare Images)
 * - R2: /r2/<key> или просто <key> из R2
 */
export function resolveImageUrl(src?: string, opts = DEFAULT_OPTS) {
  if (!src) return '/placeholder.svg';

  if (src.startsWith('http')) return `/cdn-cgi/image/${opts}/${src}`;

  if (src.startsWith('/images/') || src === '/placeholder.svg') return src;

  if (src.startsWith('/i/')) {
    const id = src.replace(/^[/]?i[/]/, '');
    if (CF_BASE) return `${CF_BASE}/${id}/public`;
    return '/placeholder.svg';
  }

  // R2: допустимы "r2/<key>" и "/r2/<key>" и просто "<key>"
  const key = src.replace(/^[/]?r2[/]/, '');
  if (R2_BASE) return `/cdn-cgi/image/${opts}/${R2_BASE}/${encodeURI(key)}`;

  return src;
}

export function rubKopecks(v?: number) {
  if (v == null) return '';
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(v / 100);
}
