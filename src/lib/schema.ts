import { query } from "@/lib/d1";

type Cache = Record<string, Set<string>>;
let cache: Cache | null = null;

export async function tableCols(table: string): Promise<Set<string>> {
  if (!cache) cache = {};
  if (!cache[table]) {
    try {
      const rows = await query<any>(`PRAGMA table_info(${table});`);
      cache[table] = new Set(rows.map((r: any) => r.name));
    } catch {
      cache[table] = new Set();
    }
  }
  return cache[table]!;
}
export async function hasCol(table: string, col: string) {
  return (await tableCols(table)).has(col);
}

