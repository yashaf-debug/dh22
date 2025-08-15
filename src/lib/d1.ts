import { d1 } from "@/lib/db";

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const stmt = d1().prepare(sql).bind(...params);
  const { results } = await stmt.all<T>();
  return results ?? [];
}
