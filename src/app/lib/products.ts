export function productImageSrc(p: any): string {
  if (p.image_url) return p.image_url;
  if (p.image_key) return `/i/${p.image_key}`;
  return '/placeholder.svg';
}
