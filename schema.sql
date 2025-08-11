PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'RUB',
  category TEXT NOT NULL,
  subcategory TEXT,
  colors TEXT NOT NULL,   -- JSON
  sizes TEXT NOT NULL,    -- JSON
  images TEXT NOT NULL,   -- JSON
  is_new INTEGER NOT NULL DEFAULT 0,
  stock TEXT NOT NULL,    -- JSON
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category, subcategory);

CREATE TABLE IF NOT EXISTS cities (
  code INTEGER PRIMARY KEY,              -- city_code из СДЭК
  city TEXT NOT NULL,
  region TEXT,
  country_code TEXT DEFAULT 'RU',
  search TEXT NOT NULL                   -- нормализованное "город, регион"
);
CREATE INDEX IF NOT EXISTS idx_cities_search ON cities(search);
