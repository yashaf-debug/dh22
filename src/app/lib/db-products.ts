import { first } from './db';

export async function getProductBySlug(slug: string) {
  const p: any = await first(
    `SELECT slug,name,price,category,main_image,image_url,images_json FROM products WHERE slug=? AND active=1 AND quantity>0`,
    slug
  );
  if (!p) return null;
  return {
    ...p,
    images: (() => { try { return JSON.parse(p.images_json ?? '[]'); } catch { return []; } })(),
  };
}
