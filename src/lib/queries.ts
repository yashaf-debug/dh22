import { query } from "@/lib/d1";
import { tableCols } from "@/lib/schema";
import { normalizeProduct } from "@/lib/normalize";

const ORDER = "ORDER BY COALESCE(updated_at, created_at, id) DESC";

export async function getLatest(limit = 12) {
  const cols = await tableCols("products");
  const where = cols.has("active") ? "WHERE active = 1" : "";
  const rows = await query<any>(`
    SELECT p.*, (SELECT COALESCE(SUM(v.stock),0) FROM product_variants v WHERE v.product_id=p.id) AS variants_stock
    FROM products p
    ${where}
    ${ORDER}
    LIMIT ${limit}
  `);
  return rows.map(normalizeProduct);
}

export async function getClothes(limit = 12) {
  const rows = await query<any>(`
    SELECT p.*, (SELECT COALESCE(SUM(v.stock),0) FROM product_variants v WHERE v.product_id=p.id) AS variants_stock
    FROM products p
    WHERE ${/* категория у вас русская */""} (category='Женская одежда')
    ${ORDER}
    LIMIT ${limit}
  `);
  return rows.map(normalizeProduct);
}

export async function getAccessories(limit = 12) {
  const rows = await query<any>(`
    SELECT p.*, (SELECT COALESCE(SUM(v.stock),0) FROM product_variants v WHERE v.product_id=p.id) AS variants_stock
    FROM products p
    WHERE category='Аксессуары'
    ${ORDER}
    LIMIT ${limit}
  `);
  return rows.map(normalizeProduct);
}

export async function getNew(limit = 12) {
  const rows = await query<any>(`
    SELECT p.*, (SELECT COALESCE(SUM(v.stock),0) FROM product_variants v WHERE v.product_id=p.id) AS variants_stock
    FROM products p
    WHERE is_new = 1
    ${ORDER}
    LIMIT ${limit}
  `);
  return rows.map(normalizeProduct);
}

