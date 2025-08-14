import { getRequestContext } from '@cloudflare/next-on-pages';
import type { D1Database } from '@cloudflare/workers-types';
export function d1() { return (getRequestContext().env as any).DB as D1Database; }
export async function queryAll<T>(sql: string, ...params: any[]): Promise<T[]> {
  const stmt = d1().prepare(sql).bind(...params);
  const { results } = await stmt.all<T>();
  return results ?? [];
}
