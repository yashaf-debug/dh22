import { NextResponse } from "next/server";
import { query } from "@/lib/d1";

export const runtime = "edge";

function getToken(req: Request) {
  const u = new URL(req.url);
  return u.searchParams.get("t") || req.headers.get("x-admin-token") || "";
}
function ok(data: any = { ok: true }) { return NextResponse.json(data); }
function bad(msg = "unauthorized", code = 401) { return NextResponse.json({ ok: false, error: msg }, { status: code }); }

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const t = getToken(req);
  if (!t) return bad();

  const id = Number(params.id);
  const form = await req.formData();

  const method = (form.get("_method") || "").toString().toUpperCase();
  if (method === "DELETE") {
    await query("DELETE FROM products WHERE id=?", [id]);
    await query("DELETE FROM product_variants WHERE product_id=?", [id]);
    return ok();
  }

  const fields = [
    "name","slug","description","care_text","price","currency","active","is_new","is_bestseller",
    "category","subcategory","main_image","image_url",
    "images_json","sizes_json","colors_json","quantity"
  ] as const;

  const sets: string[] = [];
  const paramsArr: any[] = [];
  for (const f of fields) {
    let val: any = form.get(f);
    if (val === null || val === undefined) continue;
    if (f === "active" || f === "is_new" || f === "is_bestseller") {
      val = val ? 1 : 0;
    }
    sets.push(`${f} = ?`);
    paramsArr.push(f.endsWith("_json") ? String(val) : val);
  }
  if (sets.length) {
    sets.push("updated_at = CURRENT_TIMESTAMP");
    await query(`UPDATE products SET ${sets.join(", ")} WHERE id = ?`, [...paramsArr, id]);
  }

  const variantsRaw = form.get("variants");
  if (variantsRaw) {
    let arr: any[] = [];
    try { arr = JSON.parse(String(variantsRaw)); } catch {}
    await query("DELETE FROM product_variants WHERE product_id = ?", [id]);
    for (const v of arr) {
      await query(
        "INSERT INTO product_variants (product_id,color,size,stock,sku) VALUES (?,?,?,?,?)",
        [id, v.color ?? "", v.size ?? "", Number(v.stock ?? 0), v.sku ?? ""]
      );
    }
  }

  return ok();
}
