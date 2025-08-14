const BASE = (process.env.NEXT_PUBLIC_R2_PUBLIC_BASE || '').replace(/\/$/, '');

export function r2Url(path?: string) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path; // на случай абсолютных ссылок
  if (path.startsWith('/r2/')) {
    const base = (process.env.NEXT_PUBLIC_R2_PUBLIC_BASE || '').replace(/\/$/, '');
    return `${base}/${path.slice(4)}`;
  }
  return path; // fallback
}

export function toR2Url(pathOrKey?: string | null): string | null {
  if (!pathOrKey) return null;
  const key = String(pathOrKey)
    .replace(/^https?:\/\/[^/]+\/?/, '')
    .replace(/^\/+/, '')
    .replace(/^r2\//, '')
    .replace(/^\/?r2\//, '');
  return BASE ? `${BASE}/${key}` : `/${key}`;
}

export function toR2Key(urlOrPath: string): string {
  return String(urlOrPath)
    .replace(/^https?:\/\/[^/]+\/?/, '')
    .replace(/^\/+/, '')
    .replace(/^r2\//, '')
    .replace(/^\/?r2\//, '');
}
