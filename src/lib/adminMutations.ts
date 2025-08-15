import { query } from "@/lib/d1";
import { tableCols } from "@/lib/schema";

type RowId = { id: number };
type ColInfo = { name: string; type?: string; notnull: number; dflt_value?: any };

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

function stripQuotes(v: any) {
  if (typeof v !== "string") return v;
  const m = v.match(/^'(.*)'$/);
  return m ? m[1] : v;
}

export async function createDraftProduct() {
  const allCols = await query<ColInfo>(`PRAGMA table_info(products);`);
  const colsSet = await tableCols("products");

  // Базовые значения (максимально безопасные)
  const data: Record<string, any> = {
    name: "Новый товар",
    slug: await uniqueSlug("new-product"),
    price: 0,
    currency: "RUB",
    description: "",
    active: 0,
    is_new: 0,
    category: "",         // ВАЖНО: строка, т.к. у вас NOT NULL
    subcategory: "",
    main_image: "",
    image_url: "",
    images_json: "[]",
    sizes_json: "[]",
    colors_json: "[]",
    quantity: 0,
  };

  // Начальный список полей из data, которые реально есть в таблице
  const fields: string[] = Object.keys(data).filter((k) => colsSet.has(k));
  const values: any[] = fields.map((f) => data[f]);

  // Для всех столбцов с NOT NULL и без DEFAULT — гарантируем значение
  for (const c of allCols) {
    if (!colsSet.has(c.name)) continue;
    const hasInInsert = fields.includes(c.name);
    const hasDefault = c.dflt_value !== null && c.dflt_value !== undefined;
    const isNotNull = c.notnull === 1;

    if (isNotNull && !hasDefault && !hasInInsert) {
      // Подставляем безопасный дефолт по типу
      const type = String(c.type || "").toUpperCase();
      const safe =
        type.includes("INT") || type.includes("REAL") || type.includes("NUM")
          ? 0
          : ""; // для TEXT / прочего
      fields.push(c.name);
      values.push(safe);
    }

    // Если поле уже в insert и у него указан NULL — заменим на безопасный
    if (hasInInsert) {
      const idx = fields.indexOf(c.name);
      if ((values[idx] === null || values[idx] === undefined) && isNotNull) {
        const type = String(c.type || "").toUpperCase();
        values[idx] =
          hasDefault ? stripQuotes(c.dflt_value) :
          (type.includes("INT") || type.includes("REAL") || type.includes("NUM") ? 0 : "");
      }
    }
  }

  let rows: RowId[] = [];
  try {
    rows = await query<RowId>(
      `INSERT INTO products (${fields.join(",")}) VALUES (${fields.map(() => "?").join(",")}) RETURNING id`,
      values
    );
  } catch {
    await query(
      `INSERT INTO products (${fields.join(",")}) VALUES (${fields.map(() => "?").join(",")})`,
      values
    );
    rows = await query<RowId>(`SELECT last_insert_rowid() AS id`);
  }

  const id = rows?.[0]?.id;
  if (!id) throw new Error("draft_create_failed");
  return Number(id);
}

