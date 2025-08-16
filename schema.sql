PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS uploads (
  id TEXT PRIMARY KEY,
  mime TEXT NOT NULL,
  bytes BLOB NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  category TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  is_bestseller INTEGER NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  care_text TEXT,
  main_image TEXT,
  image_url TEXT,
  sizes TEXT NOT NULL DEFAULT '[]',   -- JSON
  colors TEXT NOT NULL DEFAULT '[]',  -- JSON
  images_json TEXT NOT NULL DEFAULT '[]', -- JSON
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

CREATE TABLE IF NOT EXISTS product_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color TEXT,
  size TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT,
  UNIQUE(product_id, color, size)
);

CREATE TABLE IF NOT EXISTS cities (
  code INTEGER PRIMARY KEY,              -- city_code из СДЭК
  city TEXT NOT NULL,
  region TEXT,
  country_code TEXT DEFAULT 'RU',
  search TEXT NOT NULL                   -- нормализованное "город, регион"
);
CREATE INDEX IF NOT EXISTS idx_cities_search ON cities(search);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  path TEXT,
  headers TEXT,
  body TEXT
);

CREATE TABLE IF NOT EXISTS kv (
  k TEXT PRIMARY KEY,
  v TEXT,
  expires_at INTEGER
);
