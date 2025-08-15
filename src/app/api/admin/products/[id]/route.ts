export const runtime = "edge";

import { NextResponse } from "next/server";
import { query } from "@/lib/d1";

function getToken(req: Request) {
  const url = new URL(req.url);
  return url.searchParams.get("t") || req.headers.get("x-admin-token") || "";
}

function isAllowed(token: string) {
  // TODO: сравнить с секретом/таблицей kv; пока простая проверка на непустой
  return Boolean(token);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const token = getToken(req);
  if (!isAllowed(token)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const method = (form.get("_method") || "").toString().toUpperCase();

  if (method === "DELETE") {
    await query("DELETE FROM products WHERE id = ?", [params.id]);
    await query("DELETE FROM product_variants WHERE product_id = ?", [params.id]);
    return NextResponse.json({ ok: true });
  }

  // UPDATE полей (минимально важные)
  const name = form.get("name");
  const slug = form.get("slug");
  const price = Number(form.get("price") || 0);
  const category = form.get("category");
  const subcategory = form.get("subcategory");
  const main_image = form.get("main_image") || form.get("image_url");

  await query(
    `UPDATE products
     SET name = COALESCE(?, name),
         slug = COALESCE(?, slug),
         price = COALESCE(?, price),
         category = COALESCE(?, category),
         subcategory = COALESCE(?, subcategory),
         main_image = COALESCE(?, main_image),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, slug, price, category, subcategory, main_image, params.id]
  );

  // при необходимости — обновление variants: пройдите по formData и синхронизируйте
  return NextResponse.json({ ok: true });
}
