import { query } from "@/lib/d1";

export async function getBestsellers() {
  return await query(
    `
    SELECT p.id, p.slug, p.title, p.price, p.cover_url, p.is_sale, p.is_bestseller
    FROM products p
    WHERE p.is_active=1 AND p.is_bestseller=1
    ORDER BY p.sort DESC, p.updated_at DESC
    LIMIT 12
  `
  );
}

export async function getClothes() {
  return await query(
    `
    SELECT p.id, p.slug, p.title, p.price, p.cover_url
    FROM products p
    WHERE p.is_active=1 AND p.category='clothes'
    ORDER BY p.sort DESC, p.created_at DESC
    LIMIT 12
  `
  );
}
