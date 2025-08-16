export const runtime = "edge";

import { NextResponse } from "next/server";
import { all } from "@/app/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("ids") || "";
  const ids = raw
    .split(",")
    .map(s => Number(s))
    .filter(n => Number.isFinite(n));
  if (!ids.length) return NextResponse.json([]);

  const qs = `SELECT id, slug, name as title, main_image as cover_url, price as price_cents
              FROM products
              WHERE id IN (${ids.map(() => "?").join(",")})`;

  const rows = await all(qs, ...ids);
  return NextResponse.json(rows ?? []);
}

