import { first } from './db';

export async function getProductBySlug(slug: string) {
  return first(
    `SELECT slug,name,price,category,main_image,image_url,images FROM products WHERE slug=? AND active=1 AND quantity>0`,
    slug
  );
}
