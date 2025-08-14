import { first } from './db';

export async function getProductBySlug(slug: string) {
  return first(
    `SELECT slug,name,price,category,image_url,image_key FROM products WHERE slug=? AND active=1 AND quantity>0`,
    slug
  );
}
