export function productImageSrc(p: any): string {
  return p.image_key ? `/i/${p.image_key}` : '/placeholder.svg';
}
