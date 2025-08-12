export const runtime = "edge";

import { NextRequest } from "next/server";
import { first } from "@/app/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const row: any = await first("SELECT mime, bytes FROM uploads WHERE id=?", params.id);
  if (!row) return new Response("Not found", { status: 404 });
  return new Response(row.bytes, {
    headers: { "content-type": row.mime, "cache-control": "public, max-age=31536000, immutable" },
  });
}

