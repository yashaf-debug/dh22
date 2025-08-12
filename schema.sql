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
  quantity INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  main_image TEXT,
  image_url TEXT,
  sizes TEXT NOT NULL DEFAULT '[]',   -- JSON
  colors TEXT NOT NULL DEFAULT '[]',  -- JSON
  gallery TEXT NOT NULL DEFAULT '[]', -- JSON
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

CREATE TABLE IF NOT EXISTS cities (
  code INTEGER PRIMARY KEY,              -- city_code из СДЭК
  city TEXT NOT NULL,
  region TEXT,
  country_code TEXT DEFAULT 'RU',
  search TEXT NOT NULL                   -- нормализованное "город, регион"
);
CREATE INDEX IF NOT EXISTS idx_cities_search ON cities(search);

