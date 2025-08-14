import { getRequestContext } from '@cloudflare/next-on-pages';
import type { D1Database } from '@cloudflare/workers-types';

export function d1(): D1Database {
  const ctx = getRequestContext?.();
  const env = (ctx as any)?.env as { DH22_DB?: D1Database; DB?: D1Database } | undefined;

  const db =
    env?.DH22_DB ??
    env?.DB ??
    (globalThis as any)?.DH22_DB ??
    (globalThis as any)?.DB;

  if (!db) {
    console.error('D1 binding "DH22_DB" (или "DB") не найден. Проверь Settings → Functions → D1 bindings.');
    throw new Error('Missing D1 binding DH22_DB');
  }
  return db as D1Database;
}

export async function queryAll<T>(sql: string, ...params: any[]): Promise<T[]> {
  const stmt = d1().prepare(sql).bind(...params);
  const { results } = await stmt.all<T>();
  return results ?? [];
}
