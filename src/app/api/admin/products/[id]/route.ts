export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { all, first, run } from "@/app/lib/db";

function okToken(url: URL) {
  return (url.searchParams.get("token") || "") === (process.env.ADMIN_TOKEN || "");
}

async function loadOne(idOrSlug: string) {
  const isNum = /^\d+$/.test(idOrSlug);
  const row: any = isNum
    ? await first("SELECT * FROM products WHERE id=?", idOrSlug)
    : await first("SELECT * FROM products WHERE slug=?", idOrSlug);
  if (row) row.main_image = (row.main_image && row.main_image !== "/i") ? row.main_image : (row.image_url || "");
  return row;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  if (!okToken(url)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  const row = await loadOne(params.id);
  if (!row) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, item: row });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  if (!okToken(url)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const b = await req.json();
  const row = await loadOne(params.id);
  if (!row) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const fields: string[] = [];
  const vals: any[] = [];

  function set(name: string, v: any) {
    fields.push(`${name}=?`);
    vals.push(v);
  }

  if (typeof b.slug === "string" && b.slug.trim() && b.slug.trim() !== row.slug) {
    const exists = await first("SELECT id FROM products WHERE slug=? AND id<>?", b.slug.trim(), row.id);
    if (exists) return NextResponse.json({ ok: false, error: "slug_exists" }, { status: 409 });
    set("slug", b.slug.trim());
  }
  if (typeof b.name === "string") set("name", b.name.trim());
  if (b.price != null) set("price", Math.max(0, parseInt(b.price)));
  if (typeof b.category === "string") set("category", b.category.trim());
  if (b.active != null) set("active", b.active ? 1 : 0);
  if (b.quantity != null) set("quantity", Math.max(0, parseInt(b.quantity)));
  if (typeof b.description === "string") set("description", b.description);
  if (typeof b.main_image === "string") {
    let m = b.main_image.trim();
    set("main_image", m && m !== "/i" ? m : null);
  }
  if (b.sizes) set("sizes", JSON.stringify(b.sizes));
  if (b.colors) set("colors", JSON.stringify(b.colors));
  if (b.gallery) set("gallery", JSON.stringify(b.gallery));

  set("updated_at", new Date().toISOString());

  if (fields.length) {
    await run(`UPDATE products SET ${fields.join(", ")} WHERE id=?`, ...vals, row.id);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  if (!okToken(url)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const row = await loadOne(params.id);
  if (!row) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  await run("UPDATE products SET active=0, quantity=0, updated_at=? WHERE id=?", new Date().toISOString(), row.id);
  return NextResponse.json({ ok: true });
}

