import { query } from "@/lib/d1";

type SchemaCache = Record<string, Set<string>>;
let cache: SchemaCache | null = null;

export async function ensureSchema(): Promise<SchemaCache> {
  if (cache) return cache;
  cache = {};
  // при необходимости добавьте и другие таблицы
  const tables = ["products"];
  for (const t of tables) {
    try {
      const rows = await query<any>(`PRAGMA table_info(${t});`);
      cache[t] = new Set(rows.map((r: any) => r.name));
    } catch {
      cache[t] = new Set(); // безопасный дефолт
    }
  }
  return cache!;
}

export async function hasColumn(table: string, col: string) {
  const s = await ensureSchema();
  return s[table]?.has(col) ?? false;
}
