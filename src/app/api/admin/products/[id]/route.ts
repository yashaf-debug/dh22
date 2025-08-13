export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { first, run } from "@/app/lib/db";

function ok(data: any = {}) {
  return NextResponse.json({ ok: true, ...data }, { status: 200 });
}
function fail(error: string, detail?: any, status = 200) {
  return NextResponse.json({ ok: false, error, detail }, { status });
}

function parseArr(x: any) {
  if (!x) return [];
  if (Array.isArray(x)) return x;
  try { return JSON.parse(String(x)); } catch { return []; }
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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = new URL(req.url).searchParams.get("token") || "";
    if (token !== process.env.ADMIN_TOKEN) return fail("unauthorized");

    const row = await first(
      `SELECT id, slug, name, price, quantity, active, category, description,
              COALESCE(main_image, image_url) AS main_image,
              sizes, colors, updated_at
       FROM products WHERE id=? OR slug=?`,
      params.id, params.id
    );
    if (!row) return fail("not_found", null, 404);
    return ok({ item: row });
  } catch (e: any) {
    return fail("get_product_failed", String(e));
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = new URL(req.url).searchParams.get("token") || "";
    if (token !== process.env.ADMIN_TOKEN) return fail("unauthorized");

    const body = await req.json();

    const name       = (body.name || "").toString().trim();
    const slug       = normSlug(body.slug || name);
    const price      = int(body.price, 0);
    const quantity   = int(body.quantity, 0);
    const active     = bool(body.active) ? 1 : 0;
    const category   = (body.category || "").toString().trim();
    const description= (body.description || "").toString();
    const sizes      = JSON.stringify(parseArr(body.sizes));
    const colors     = JSON.stringify(parseArr(body.colors));
    const main_image = (body.main_image || body.image_url || "").toString().trim();
    const updated_at = new Date().toISOString();

    await run(
      `UPDATE products
         SET slug=?,
             name=?, price=?, quantity=?, active=?,
             category=?, description=?,
             sizes=?, colors=?,
             main_image=?, updated_at=?
       WHERE id=?`,
      slug, name, price, quantity, active,
      category, description,
      sizes, colors,
      main_image, updated_at,
      params.id
    );

    const row = await first(`SELECT * FROM products WHERE id=?`, params.id);
    return ok({ item: row });
  } catch (e: any) {
    return fail("update_product_failed", String(e));
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = new URL(req.url).searchParams.get("token") || "";
    if (token !== process.env.ADMIN_TOKEN) return fail("unauthorized");

    await run(`DELETE FROM products WHERE id=?`, params.id);
    return ok();
  } catch (e: any) {
    return fail("delete_product_failed", String(e));
  }
}

