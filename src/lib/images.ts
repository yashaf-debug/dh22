// src/lib/images.ts
const R2_BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_BASE || '').replace(/\/$/, '');
const USE_CF_TRANSFORM = (process.env.NEXT_PUBLIC_USE_CF_IMAGE || '0') === '1';

// Превращаем значение из БД в полноценный URL картинки.
// Поддерживаем /r/<key> (R2), плюс абсолютные URL.
export function resolveImageUrl(src?: string | null, opts?: string): string {
  if (!src) return '/placeholder.svg';

  // Уже абсолютный URL
  if (/^https?:\/\//i.test(src)) {
    return USE_CF_TRANSFORM && opts ? `/cdn-cgi/image/${opts}/${src}` : src;
  }

  // R2: allow bare keys like `folder/file.jpg` or prefix `r/`
  if (!src.startsWith('/') && !src.startsWith('r/')) {
    const key = src.replace(/^r\//, '');
    const raw = `${R2_BASE}/${key}`;
    return USE_CF_TRANSFORM && opts ? `/cdn-cgi/image/${opts}/${raw}` : raw;
  }

  if (src.startsWith('/r/')) {
    const key = src.replace(/^\/r\//, '');
    const raw = `${R2_BASE}/${key}`;
    return USE_CF_TRANSFORM && opts ? `/cdn-cgi/image/${opts}/${raw}` : raw;
  }

  // Любой другой относительный путь — превращаем в абсолютный
  const path = src.startsWith('/') ? src : `/${src}`;
  return path;
}

