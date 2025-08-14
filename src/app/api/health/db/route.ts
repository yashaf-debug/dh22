export const runtime = 'edge';

import { d1 } from '@/lib/db';

export async function GET() {
  const row = await d1().prepare('SELECT 1 AS ok').first<{ ok: number }>();
  return new Response(JSON.stringify({ ok: row?.ok === 1 }), {
    headers: { 'content-type': 'application/json' },
  });
}
