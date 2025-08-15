import { query } from "@/lib/d1";
import { tableCols } from "@/lib/schema";

type RowId = { id: number };

function slugify(base: string) {
  return (
    base
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-а-яё]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "product"
  );
}

async function uniqueSlug(base: string) {
  let candidate = slugify(base);
  let i = 1;
  for (;;) {
    const rows = await query<RowId>(
      `SELECT id FROM products WHERE slug = ? LIMIT 1`,
      [candidate]
    );
    if (!rows.length) return candidate;
    candidate = `${base}-${++i}`;
  }
}

export async function createDraftProduct() {
  const cols = await tableCols("products");

  const data: Record<string, any> = {
    name: "Новый товар",
    slug: await uniqueSlug("new-product"),
    price: 0,
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

  const fields = Object.keys(data).filter((k) => cols.has(k));
  const values = fields.map((f) => data[f]);

  let rows: RowId[] = [];
  try {
    // если D1 поддерживает RETURNING
    rows = await query<RowId>(
      `INSERT INTO products (${fields.join(",")}) VALUES (${fields
        .map(() => "?")
        .join(",")}) RETURNING id`,
      values
    );
  } catch {
    // фолбэк для окружений без RETURNING
    await query(
      `INSERT INTO products (${fields.join(",")}) VALUES (${fields
        .map(() => "?")
        .join(",")})`,
      values
    );
    rows = await query<RowId>(`SELECT last_insert_rowid() AS id`);
  }

  const id = rows?.[0]?.id;
  if (!id) throw new Error("draft_create_failed");
  return Number(id);
}

