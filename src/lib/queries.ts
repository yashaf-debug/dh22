import { normalize } from "@/lib/normalize";
import { query } from "@/lib/d1";

export async function getLatest(limit = 12) {
  // Без жёстких колонок: только то, что точно есть
  const rows = await query<any>(
    `
    SELECT * FROM products
    WHERE is_active = 1
    ORDER BY COALESCE(updated_at, created_at) DESC
    LIMIT ${limit}
  `
  );
  return rows.map(normalize);
}

export async function getBestsellersSafe(limit = 12) {
  // Пытаемся через метку в tags; если нет — просто последние
  const rows = await query<any>(
    `
    SELECT * FROM products
    WHERE is_active = 1
    ORDER BY COALESCE(updated_at, created_at) DESC
    LIMIT 100
  `
  );
  const norm = rows.map(normalize);
  const best = norm.filter(p =>
    String(p.tags).toLowerCase().includes("bestseller")
    || p.is_bestseller === 1
  );
  return (best.length ? best.slice(0, limit) : norm.slice(0, limit));
}

export async function getClothesSafe(limit = 12) {
  const rows = await query<any>(
    `
    SELECT * FROM products
    WHERE is_active = 1 AND (category = 'clothes' OR category_slug = 'clothes')
    ORDER BY COALESCE(updated_at, created_at) DESC
    LIMIT ${limit}
  `
  );
  return rows.map(normalize);
}
