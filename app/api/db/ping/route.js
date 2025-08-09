export const runtime = 'edge';
import { all } from "@/src/app/lib/db";
export async function GET() {
  const rows = await all("SELECT 1+1 AS two");
  return new Response(JSON.stringify({ ok: true, two: rows[0]?.two || 0 }), { headers: { "content-type": "application/json; charset=utf-8" }});
}
