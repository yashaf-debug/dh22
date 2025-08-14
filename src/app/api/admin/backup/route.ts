import { NextRequest } from 'next/server';
import { logEvent } from '@/lib/logs';

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  if (!key || key !== process.env.ADMIN_BACKUP_KEY) {
    return new Response('Forbidden', { status: 403 });
  }

  // @ts-ignore
  const db = process.env.DB || (globalThis as any).DB;
  if (!(db && 'prepare' in db)) {
    return new Response('No DB binding', { status: 500 });
  }

  // 1) Собираем список таблиц
  const tables = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
  const dump: Record<string, unknown> = { _meta: { ts: new Date().toISOString() } };

  for (const t of tables.results || []) {
    const name = (t as any).name as string;
    const rows = await db.prepare(`SELECT * FROM "${name}"`).all();
    dump[name] = rows.results || [];
  }

  const json = JSON.stringify(dump);

  // 2) Кладём в R2
  // Привязка Pages Functions: R2_BACKUPS
  // @ts-ignore
  const bucket = (globalThis as any).R2_BACKUPS || (process.env as any).R2_BACKUPS;
  if (!bucket || !('put' in bucket)) {
    return new Response('No R2 binding R2_BACKUPS', { status: 500 });
  }

  const yyyy = new Date().toISOString().slice(0,10);
  const keyName = `d1-backup/${yyyy}/backup-${Date.now()}.json`;

  await bucket.put(keyName, json, {
    httpMetadata: { contentType: 'application/json' },
  });

  await logEvent('info','backup','uploaded-to-r2',{ key: keyName, bytes: json.length });

  return new Response(
    JSON.stringify({ ok: true, key: keyName, bytes: json.length }),
    { headers: { 'content-type': 'application/json' } }
  );
}
