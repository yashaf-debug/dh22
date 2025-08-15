export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { all, first, run } from "@/app/lib/db";

const ok = (x: any = {}) => NextResponse.json({ ok: true, ...x }, { status: 200 });
const fail = (error: string, detail?: any) =>
  NextResponse.json({ ok: false, error, detail }, { status: 200 });

function parseArray(v: any): any[] {
  if (Array.isArray(v)) return v;
  if (typeof v === "string" && v) {
    try { return JSON.parse(v); } catch {}
  }
  return [];
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const raw = await first(
      `SELECT id, slug, name, description, price, main_image, images_json
         FROM products WHERE id=? OR slug=?`,
      params.id,
      params.id
    );
    if (!raw) return fail("not_found");
    const gallery = (() => {
      try { return JSON.parse(raw.images_json ?? "[]"); } catch { return []; }
    })();
    const variants = await all(
      `SELECT id, color, size, sku, stock FROM product_variants WHERE product_id=? ORDER BY id`,
      raw.id
    );
    const item = { ...raw, gallery, variants };
    return ok({ item });
  } catch (e: any) {
    return fail("get_product_failed", String(e));
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    let body: any;
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      body = await req.json();
    } else {
      const form = await req.formData();
      body = Object.fromEntries(form.entries());
    }

    const name = String(body.name || "").trim();
    const description = body.description ? String(body.description) : "";
    const priceRub = Number(body.priceRub ?? body.price_rub ?? body.price ?? 0);
    const price = Math.round(priceRub * 100);
    const main_image = String(body.main_image || "").trim();
    const gallery = parseArray(body.gallery ?? body.gallery_json);
    const variants = parseArray(body.variants ?? body.variants_json);

    const updated_at = new Date().toISOString();
    await run(
      `UPDATE products
          SET name=?, description=?, price=?, main_image=?, images_json=?, updated_at=?
        WHERE id=?`,
      name,
      description,
      price,
      main_image,
      JSON.stringify(gallery),
      updated_at,
      params.id
    );

    for (const v of variants) {
      await run(
        `INSERT INTO product_variants(product_id,color,size,sku,stock)
             VALUES(?,?,?,?,?)
             ON CONFLICT(product_id,color,size) DO UPDATE
               SET sku=excluded.sku, stock=excluded.stock`,
        params.id,
        String(v.color || "").trim(),
        String(v.size || "").trim(),
        v.sku ? String(v.sku) : null,
        Number(v.stock) || 0
      );
    }

    await run(
      `DELETE FROM product_variants
       WHERE product_id = ? AND (color||'|'||size) NOT IN (${variants.map(() => "?").join(",") || "''"})`,
      params.id,
      ...variants.map((v: any) => `${String(v.color || "").trim()}|${String(v.size || "").trim()}`)
    );

    const raw = await first(
      `SELECT id, slug, name, description, price, main_image, images_json FROM products WHERE id=?`,
      params.id
    );
    const gallery2 = (() => {
      try { return JSON.parse(raw.images_json ?? "[]"); } catch { return []; }
    })();
    const variants2 = await all(
      `SELECT id, color, size, sku, stock FROM product_variants WHERE product_id=? ORDER BY id`,
      params.id
    );
    const item = { ...raw, gallery: gallery2, variants: variants2 };
    return ok({ item });
  } catch (e: any) {
    return fail("update_product_failed", String(e));
  }
}

export const PUT = POST;

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await run("DELETE FROM products WHERE id=?", params.id);
    return ok();
  } catch (e: any) {
    return fail("delete_product_failed", String(e));
  }
}

