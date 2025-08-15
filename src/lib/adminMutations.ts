import { query } from "@/lib/d1";
import { tableCols } from "@/lib/schema";

function slugify(base: string) {
  return base
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-а-яё]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "product";
}

async function uniqueSlug(base: string) {
  let slug = slugify(base);
  let i = 1;
  // простая проверка уникальности
  while (true) {
    const rows = await query<any>("SELECT id FROM products WHERE slug = ? LIMIT 1", [slug]);
    if (!rows.length) return slug;
    slug = `${base}-${++i}`;
  }
}

export async function createDraftProduct() {
  const cols = await tableCols("products");

  const name = "Новый товар";
  const slug = await uniqueSlug("new-product");

  // Собираем набор реально существующих колонок
  const data: Record<string, any> = {
    name,
    slug,
    price: 0, // копейки
    currency: "RUB",
    description: "",
    active: 0,
    is_new: 0,
    category: null,
    subcategory: null,
    main_image: "",
    image_url: "",
    images_json: "[]",
    sizes_json: "[]",
    colors_json: "[]",
    quantity: 0,
  };

  const fields = Object.keys(data).filter(k => cols.has(k));
  const values = fields.map(f => data[f]);

  // D1 поддерживает RETURNING, но оставим фолбэк на last_insert_rowid()
  let row = await query<any>(
    `INSERT INTO products (${fields.join(",")}) VALUES (${fields.map(()=>"?").join(",")}) RETURNING id`,
    values
  ).catch(async () => {
    await query<any>(`INSERT INTO products (${fields.join(",")}) VALUES (${fields.map(()=>"?").join(",")})`, values);
    const [r] = await query<any>("SELECT last_insert_rowid() AS id");
    return [r];
  });

  const id = Array.isArray(row) ? row[0]?.id : row?.id;
  if (!id) throw new Error("draft_create_failed");
  return Number(id);
}

