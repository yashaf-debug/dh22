-- Заказы DH22
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  number        TEXT UNIQUE NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  status        TEXT NOT NULL DEFAULT 'new', -- new | awaiting_payment | payment_pending | paid | failed | cancelled
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  delivery_method TEXT NOT NULL,           -- same_day_msk | cdek_courier | cdek_pvz
  delivery_type TEXT NOT NULL,
  delivery_city TEXT,
  delivery_address TEXT,
  delivery_pvz_code TEXT,
  delivery_pvz_name TEXT,
  delivery_price INTEGER NOT NULL DEFAULT 0,
  delivery_eta TEXT,
  amount_total  INTEGER NOT NULL,        -- копейки
  currency      TEXT NOT NULL DEFAULT 'RUB',
  payment_method TEXT NOT NULL DEFAULT 'online',
  cdekpay_payment_id TEXT,               -- ID/UUID платежа в CDEK Pay (если есть)
  notes         TEXT
);

CREATE TABLE order_items (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id  INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  slug      TEXT NOT NULL,
  name      TEXT NOT NULL,
  price     INTEGER NOT NULL,            -- копейки
  qty       INTEGER NOT NULL,
  image     TEXT NOT NULL
);

CREATE INDEX idx_orders_number ON orders(number);
CREATE INDEX idx_order_items_order ON order_items(order_id);
