-- product variants per color/size
CREATE TABLE IF NOT EXISTS product_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  color TEXT NOT NULL,
  size  TEXT NOT NULL,
  sku   TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  UNIQUE(product_id, color, size),
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ускорим выборки по товару
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
