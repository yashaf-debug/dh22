export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { all, first, run } from "@/app/lib/db";

function ok(data: any = {}) {
  return NextResponse.json({ ok: true, ...data }, { status: 200 });
}
function fail(error: string, detail?: any, status = 200) {
  return NextResponse.json({ ok: false, error, detail }, { status });
}

function parseArr(x: any) {
  if (!x) return [];
  if (Array.isArray(x)) return x;
  try {
    const s = String(x).trim();
    if (!s) return [];
    return JSON.parse(s);
  } catch {
    return [];
  }
}

function int(v: any, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : d;
}
function bool(v: any) {
  if (typeof v === "boolean") return v;
  return v === "1" || v === 1 || String(v).toLowerCase() === "true";
}
const normSlug = (s: string) =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04FF-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || "";
    if (token !== process.env.ADMIN_TOKEN) return fail("unauthorized");

    const q = (searchParams.get("q") || "").trim();
    const rows = await all(
      `
      SELECT id, slug, name, price, quantity, active,
             COALESCE(main_image, image_url) AS image_url,
             category, updated_at
      FROM products
      WHERE (? = '' OR name LIKE '%'||?||'%' OR slug LIKE '%'||?||'%')
      ORDER BY id DESC
      LIMIT 200
      `,
      q, q, q
    );

    return ok({ items: rows });
  } catch (e: any) {
    return fail("get_products_failed", String(e));
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || "";
    if (token !== process.env.ADMIN_TOKEN) return fail("unauthorized");

    const body = await req.json();
    const name       = (body.name || "").toString().trim();
    const price      = int(body.price, 0);
    const quantity   = int(body.quantity, 0);
    const active     = bool(body.active);
    const category   = (body.category || "").toString().trim();
    const description= (body.description || "").toString();
    const sizes      = JSON.stringify(parseArr(body.sizes));
    const colors     = JSON.stringify(parseArr(body.colors));
    const main_image = (body.main_image || body.image_url || "").toString().trim();
    const slug       = normSlug(body.slug || name) || `item-${Date.now()}`;
    const updated_at = new Date().toISOString();

    await run(
      `INSERT INTO products (slug, name, price, quantity, active, category, description, sizes, colors, main_image, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      slug, name, price, quantity, active ? 1 : 0, category, description, sizes, colors, main_image, updated_at
    );

    const row = await first(`SELECT * FROM products WHERE slug=?`, slug);
    return ok({ item: row });
  } catch (e: any) {
    return fail("create_product_failed", String(e));
  }
}

