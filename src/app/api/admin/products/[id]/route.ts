export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { first, run } from "@/app/lib/db";

const getToken = (url: string) => {
  const u = new URL(url);
  return u.searchParams.get("token") || u.searchParams.get("t") || "";
};
const ok = (x: any = {}) => NextResponse.json({ ok: true, ...x }, { status: 200 });
const fail = (error: string, detail?: any) =>
  NextResponse.json({ ok: false, error, detail }, { status: 200 });

const toInt = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : d);
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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (getToken(req.url) !== process.env.ADMIN_TOKEN) return fail("unauthorized");
    const item = await first(
      `SELECT id, slug, name, price, quantity, active, category, description,
              COALESCE(main_image, image_url) AS main_image,
              sizes, colors, updated_at
         FROM products
        WHERE id=? OR slug=?`,
      params.id, params.id
    );
    if (!item) return fail("not_found");
    return ok({ item });
  } catch (e: any) {
    return fail("get_product_failed", String(e));
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (getToken(req.url) !== process.env.ADMIN_TOKEN) return fail("unauthorized");

    const b = await req.json();
    const name        = String(b.name || "").trim();
    const slug        = slugify(b.slug || name);
    const price       = toInt(b.price);
    const quantity    = toInt(b.quantity, 0);
    const active      = toBool(b.active) ? 1 : 0;
    const category    = String(b.category || "").trim();
    const description = String(b.description || "");
    const sizes       = JSON.stringify(toArr(b.sizes));
    const colors      = JSON.stringify(toArr(b.colors));
    const main_image  = String(b.main_image || b.image_url || "").trim();
    const updated_at  = new Date().toISOString();

    await run(
      `UPDATE products
          SET slug=?, name=?, price=?, quantity=?, active=?,
              category=?, description=?, sizes=?, colors=?, main_image=?, updated_at=?
        WHERE id=?`,
      slug, name, price, quantity, active,
      category, description, sizes, colors, main_image, updated_at,
      params.id
    );
    const item = await first("SELECT * FROM products WHERE id=?", params.id);
    return ok({ item });
  } catch (e: any) {
    return fail("update_product_failed", String(e));
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (getToken(req.url) !== process.env.ADMIN_TOKEN) return fail("unauthorized");
    await run("DELETE FROM products WHERE id=?", params.id);
    return ok();
  } catch (e: any) {
    return fail("delete_product_failed", String(e));
  }
}

