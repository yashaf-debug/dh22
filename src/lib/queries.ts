import { query } from "@/lib/d1";
import { hasColumn } from "@/lib/schema";
import { normalize } from "@/lib/normalize";

function orderByFresh() {
  return "ORDER BY COALESCE(updated_at, created_at) DESC";
}

export async function getLatest(limit = 12) {
  const rows = await query<any>(`SELECT * FROM products ${orderByFresh()} LIMIT ${limit}`);
  return rows.map(normalize);
}

export async function getBestsellersSafe(limit = 12) {
  // Берём до 100 и фильтруем по доступным признакам
  const rows = await query<any>(`SELECT * FROM products ${orderByFresh()} LIMIT 100`);
  const norm = rows.map(normalize);

  const withFlag = (await hasColumn("products", "is_bestseller"))
    ? norm.filter(p => p.is_bestseller === 1)
    : [];

  const viaTags = norm.filter(p => {
    const t = String(p.tags).toLowerCase();
    return t.includes("bestseller") || t.includes("хит") || t.includes("hit");
  });

  const list = (withFlag.length ? withFlag : viaTags.length ? viaTags : norm);
  return list.slice(0, limit);
}

export async function getClothesSafe(limit = 12) {
  const byCategory = (await hasColumn("products", "category"))
    ? "category='clothes'"
    : (await hasColumn("products", "category_slug"))
      ? "category_slug='clothes'"
      : null;

  const where = byCategory ? `WHERE ${byCategory}` : "";
  const rows = await query<any>(`SELECT * FROM products ${where} ${orderByFresh()} LIMIT ${limit}`);
  return rows.map(normalize);
}
