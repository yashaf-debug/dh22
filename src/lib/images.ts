// src/lib/images.ts
// Helper utilities for image URLs and props.

export function r2(url?: string | null) {
  if (!url) return '/placeholder.svg';
  if (url.startsWith('http')) return url;
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE || '';
  const clean = url.startsWith('/') ? url.slice(1) : url;
  return `${base}/${clean}`;
}

// Little helper for safe <img> props
export function imgProps(src?: string | null, alt = '') {
  const s = r2(src);
  return { src: s, alt, loading: 'lazy' as const, referrerPolicy: 'no-referrer' as const };
}

