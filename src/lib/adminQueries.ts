import { query } from "@/lib/d1";
import { tableCols } from "@/lib/schema";
import { normalizeProduct } from "@/lib/normalize";

function orderClause(cols: Set<string>) {
  const order: string[] = [];
  if (cols.has("updated_at")) order.push("updated_at DESC");
  if (cols.has("created_at")) order.push("created_at DESC");
  if (cols.has("id"))        order.push("id DESC");
  return order.length ? "ORDER BY " + order.join(", ") : "";
}

export async function listProductsAdmin(opts: { q?: string; limit?: number; offset?: number } = {}) {
  const { q = "", limit = 100, offset = 0 } = opts;

  const cols = await tableCols("products");
  const where: string[] = [];
  const params: any[] = [];

  // Фильтр активности: У ВАС колонка называется "active"
  if (cols.has("active")) where.push("active = 1");

  // Поиск по name/slug/description
  if (q.trim()) {
    const likeCols = ["name", "slug", "description"].filter(c => cols.has(c));
    if (likeCols.length) {
      where.push("(" + likeCols.map(() => "?? LIKE ?").join(" OR ") + ")");
      // подставим имена колонок и параметры
      const arr: any[] = [];
      likeCols.forEach(c => { arr.push(c); arr.push(`%${q}%`); });
      // позже соберём SQL через безопасную замену имен
      // для простоты — сформируем строку вручную:
      const clause = "(" + likeCols.map(c => `${c} LIKE ?`).join(" OR ") + ")";
      where.pop(); where.push(clause);
      likeCols.forEach(() => params.push(`%${q}%`));
    }
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const order = orderClause(cols);

  // Подтянем суммарный остаток из product_variants (если есть таблица)
  const hasVariants = true; // таблица есть
  const stockExpr = hasVariants
    ? `(SELECT COALESCE(SUM(v.stock),0) FROM product_variants v WHERE v.product_id = p.id) AS variants_stock`
    : `0 AS variants_stock`;

  const sql = `
    SELECT p.*, ${stockExpr}
    FROM products p
    ${whereSql}
    ${order}
    LIMIT ${limit} OFFSET ${offset}
  `;
  const rows = await query<any>(sql, params);
  return rows.map(normalizeProduct);
}


export async function getProductById(id: number) {
  const [p] = await query<any>("SELECT * FROM products WHERE id = ?", [id]);
  if (!p) return null;
  const variants = await query<any>(
    "SELECT id, color, size, stock, sku FROM product_variants WHERE product_id = ? ORDER BY id",
    [id]
  );
  return { product: p, variants };
}
