export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { all, first, run } from "@/app/lib/db";

function okToken(url: URL) {
  return (url.searchParams.get("token") || "") === (process.env.ADMIN_TOKEN || "");
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  if (!okToken(url)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const q = (url.searchParams.get("q") || "").trim();
  const active = url.searchParams.get("active");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);

  const where: string[] = [];
  const params: any[] = [];

  if (q) {
    where.push("(name LIKE ? OR slug LIKE ? OR description LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (active === "1" || active === "0") {
    where.push("active=?");
    params.push(parseInt(active));
  }

  const rows = await all(
    `SELECT id,slug,name,price,category,active,quantity,
            COALESCE(main_image,image_url) AS main_image
       FROM products
       ${where.length ? "WHERE " + where.join(" AND ") : ""}
       ORDER BY id DESC
       LIMIT ?`,
    ...params,
    limit
  );
  return NextResponse.json({ ok: true, items: rows });
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  if (!okToken(url)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });

  const b = await req.json();
  const name = (b.name || "").trim();
  const slug = (b.slug || "").trim();
  if (!name || !slug) return NextResponse.json({ ok: false, error: "name_slug_required" }, { status: 400 });

  const exists = await first("SELECT id FROM products WHERE slug=?", slug);
  if (exists) return NextResponse.json({ ok: false, error: "slug_exists" }, { status: 409 });

  const price = Math.max(0, parseInt(b.price || 0));
  const active = b.active ? 1 : 0;
  const quantity = Math.max(0, parseInt(b.quantity || 0));
  const category = (b.category || "").trim();
  const description = b.description || "";
  const main_image = (b.main_image || "").trim();
  const sizes = JSON.stringify(b.sizes || []);
  const colors = JSON.stringify(b.colors || []);
  const gallery = JSON.stringify(b.gallery || []);

  await run(
    `INSERT INTO products (slug,name,price,category,active,quantity,description,main_image,sizes,colors,gallery,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,strftime('%Y-%m-%dT%H:%M:%fZ','now'))`,
    slug,
    name,
    price,
    category,
    active,
    quantity,
    description,
    main_image,
    sizes,
    colors,
    gallery
  );

  const p: any = await first("SELECT id FROM products WHERE slug=?", slug);
  return NextResponse.json({ ok: true, id: p?.id });
}

