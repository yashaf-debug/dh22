"use client";

export function cfLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  const q = Math.min(100, Math.max(40, quality || 75));
  const path = src.startsWith('/') ? src : `/${src}`;
  return `/cdn-cgi/image/width=${width},quality=${q},fit=cover,format=auto${path}`;
}
