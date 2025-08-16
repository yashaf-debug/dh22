import { query } from "@/lib/d1";
import { tableCols } from "@/lib/schema";
import { normalizeProduct } from "@/lib/normalize";

const ORDER = "ORDER BY COALESCE(updated_at, created_at, id) DESC";
const q = query;

export async function getProductBySlug(slug: string) {
  return q(`SELECT * FROM products WHERE slug = ? AND active = 1 LIMIT 1`, [slug]);
}

export async function getVariants(productId: number) {
  return q(`SELECT * FROM product_variants WHERE product_id = ? ORDER BY id`, [productId]);
}

export async function getProductFull(slug: string) {
  const rows = await q<any>(
    `SELECT id, slug, name, description, price, care_text, main_image, image_url, images_json
     FROM products WHERE slug = ? LIMIT 1`,
    [slug]
  );
  const row = rows[0];
  if (!row) return null;
  const variants = await q<any>(
    `SELECT id, product_id, color, size, stock, sku FROM product_variants WHERE product_id = ?`,
    [row.id]
  );
  const images: string[] = [];
  if (row.main_image) images.push(row.main_image);
  if (row.image_url) images.push(row.image_url);
  try {
    const arr = JSON.parse(row.images_json || "[]");
    for (const u of arr) if (u) images.push(u);
  } catch {}
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: Number(row.price ?? 0),
    care: row.care_text,
    images: images.filter(Boolean),
    variants,
  } as {
    id: number;
    slug: string;
    name: string;
    description?: string;
    price: number;
    care?: string;
    images: string[];
    variants: any[];
  };
}

export async function getBestsellers(limit = 48) {
  return q(
    `SELECT id, slug, name as title, price as price_cents, main_image as cover_url
     FROM products
     WHERE active = 1 AND is_bestseller = 1
     ORDER BY id DESC
     LIMIT ?`,
    [limit]
  );
}

// --- slug -> русское название в БД
const CATEGORY_MAP: Record<string, string> = {
  clothes: "Одежда",
  accessories: "Аксессуары",
  new: "Новинки",
};

// Универсально: по slug каталога
export async function getByCategorySlug(slug: string, limit = 100) {
  const cat = CATEGORY_MAP[slug] ?? slug;
  const rows = await query<any>(
    `
    SELECT p.*, (SELECT COALESCE(SUM(v.stock),0) FROM product_variants v WHERE v.product_id=p.id) AS variants_stock
    FROM products p
    WHERE active = 1 AND category = ?
    ${ORDER}
    LIMIT ${limit}
    `,
    [cat]
  );

  return rows.map(normalizeProduct);
}

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
    WHERE ${/* категория у вас русская */""} (category IN ('Одежда','Женская одежда'))
    ${ORDER}
    LIMIT ${limit}
  `);
  return rows.map(normalizeProduct);
}

export async function getNew(limit = 12) {
  const rows = await query<any>(`
    SELECT p.*, (SELECT COALESCE(SUM(v.stock),0) FROM product_variants v WHERE v.product_id=p.id) AS variants_stock
    FROM products p
    WHERE is_new = 1 OR is_new = '1'
    ${ORDER}
    LIMIT ${limit}
  `);
  return rows.map(normalizeProduct);
}

