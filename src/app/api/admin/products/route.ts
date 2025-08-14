export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { all, first, run } from "@/app/lib/db";

const getToken = (req: NextRequest) => req.headers.get("authorization")?.split(" ")[1] || "";
const ok = (x: any = {}) => NextResponse.json({ ok: true, ...x }, { status: 200 });
const fail = (error: string, detail?: any) =>
  NextResponse.json({ ok: false, error, detail }, { status: 200 });

const toInt = (v: any, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : d;
};
const toBool = (v: any) =>
  typeof v === "boolean" ? v : v === 1 || v === "1" || String(v).toLowerCase() === "true";
const toArr = (v: any) => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try { return JSON.parse(String(v)); } catch { return []; }
};
const slugify = (s: string) =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04ff-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export async function GET(req: NextRequest) {
  try {
    if (getToken(req) !== process.env.ADMIN_TOKEN) return fail("unauthorized");
    const q = (new URL(req.url).searchParams.get("q") || "").trim();
    const items = await all(
      `SELECT id, slug, name, price, quantity, active,
              main_image, image_url, images,
              category, updated_at
         FROM products
        WHERE (? = '' OR name LIKE '%'||?||'%' OR slug LIKE '%'||?||'%')
        ORDER BY id DESC
        LIMIT 200`,
      q, q, q
    );
    return ok({ items });
  } catch (e: any) {
    return fail("get_products_failed", String(e));
  }
}

export async function POST(req: NextRequest) {
  try {
    if (getToken(req) !== process.env.ADMIN_TOKEN) return fail("unauthorized");

    const b = await req.json();
    const name        = String(b.name || "").trim();
    const price       = toInt(b.price);
    const quantity    = toInt(b.quantity, 0);
    const active      = toBool(b.active) ? 1 : 0;
    const category    = String(b.category || "").trim();
    const description = String(b.description || "");
    const sizes       = JSON.stringify(toArr(b.sizes));
    const colors      = JSON.stringify(toArr(b.colors));
    const main_image  = String(b.main_image || b.image_url || "").trim();
    const baseSlug    = slugify(b.slug || name) || `item-${Date.now()}`;

    // делаем slug уникальным
    let slug = baseSlug;
    for (let i = 0; i < 3; i++) {
      const ex = await first("SELECT id FROM products WHERE slug=?", slug);
      if (!ex) break;
      slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
    }

    const updated_at = new Date().toISOString();
    await run(
      `INSERT INTO products (slug, name, price, quantity, active, category, description,
                             sizes, colors, main_image, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      slug, name, price, quantity, active, category, description,
      sizes, colors, main_image, updated_at
    );

    const item = await first("SELECT * FROM products WHERE slug=?", slug);
    return ok({ item });
  } catch (e: any) {
    return fail("create_product_failed", String(e));
  }
}

