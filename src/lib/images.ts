// src/lib/images.ts
const R2_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_BASE || '').replace(/\/$/, '');
const CF_IMAGES_BASE = (process.env.NEXT_PUBLIC_CF_IMAGES_BASE || '').replace(/\/$/, '');
const USE_CF_TRANSFORM = (process.env.NEXT_PUBLIC_USE_CF_IMAGE || '0') === '1';

// Превращаем значение из БД в полноценный URL картинки.
// Поддерживаем /r2/<key> и /i/<id> (Cloudflare Images), плюс абсолютные URL.
export function resolveImageUrl(src?: string | null, opts?: string): string {
  if (!src) return '/placeholder.svg';

  // Уже абсолютный URL
  if (/^https?:\/\//i.test(src)) {
    return USE_CF_TRANSFORM && opts ? `/cdn-cgi/image/${opts}/${src}` : src;
  }

  // R2: /r2/<key>
  if (src.startsWith('/r2/')) {
    const key = src.replace(/^\/r2\//, '');
    const raw = `${R2_BASE}/${key}`;
    return USE_CF_TRANSFORM && opts ? `/cdn-cgi/image/${opts}/${raw}` : raw;
  }

  // Cloudflare Images: /i/<id>
  if (src.startsWith('/i/')) {
    const id = src.replace(/^\/i\//, '');
    return `${CF_IMAGES_BASE}/${id}/public`;
  }

  // Любой другой относительный путь — превращаем в абсолютный
  const path = src.startsWith('/') ? src : `/${src}`;
  return path;
}

