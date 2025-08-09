import { run } from "./db";
let bootstrapped = false;

// Создаёт таблицы заказов, если их нет. Вызываем один раз на холодный старт.
export async function ensureOrdersTables() {
  if (bootstrapped) return;
  await run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      status TEXT NOT NULL DEFAULT 'new',
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      delivery_method TEXT NOT NULL,
      delivery_city TEXT,
      delivery_address TEXT,
      delivery_pvz_code TEXT,
      delivery_pvz_name TEXT,
      delivery_price INTEGER NOT NULL DEFAULT 0,
      delivery_eta TEXT,
      amount_total INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'RUB',
      payment_method TEXT NOT NULL DEFAULT 'online',
      cdekpay_payment_id TEXT,
      notes TEXT
    )
  `);
  try { await run("ALTER TABLE orders ADD COLUMN delivery_method TEXT NOT NULL DEFAULT 'cdek_pvz'"); } catch {}
  try { await run("ALTER TABLE orders ADD COLUMN delivery_city TEXT"); } catch {}
  try { await run("ALTER TABLE orders ADD COLUMN delivery_address TEXT"); } catch {}
  try { await run("ALTER TABLE orders ADD COLUMN delivery_pvz_code TEXT"); } catch {}
  try { await run("ALTER TABLE orders ADD COLUMN delivery_pvz_name TEXT"); } catch {}
  try { await run("ALTER TABLE orders ADD COLUMN delivery_price INTEGER NOT NULL DEFAULT 0"); } catch {}
  try { await run("ALTER TABLE orders ADD COLUMN delivery_eta TEXT"); } catch {}
  try { await run("ALTER TABLE orders ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'online'"); } catch {}
  await run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      qty INTEGER NOT NULL,
      image TEXT NOT NULL
    )
  `);
  await run(`CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(number)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`);
  bootstrapped = true;
}
