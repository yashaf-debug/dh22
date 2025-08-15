ALTER TABLE products ADD COLUMN IF NOT EXISTS is_bestseller INTEGER NOT NULL DEFAULT 0; -- 0/1 вместо boolean
CREATE INDEX IF NOT EXISTS idx_products_is_bestseller ON products(is_bestseller);
