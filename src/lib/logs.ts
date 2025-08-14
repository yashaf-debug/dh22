type Level = 'info'|'warn'|'error';

export async function logEvent(level: Level, src: string, msg: string, data?: unknown) {
  try {
    // @ts-ignore — D1 binding должен называться DB (или поправь на свой)
    const db = process.env.DB || (globalThis as any).DB;
    // Если в проекте уже есть обёртка над D1 — используй её
    // Здесь — универсально через env/binding на Pages Functions
    if (!(db && 'prepare' in db)) return;

    await db
      .prepare(`CREATE TABLE IF NOT EXISTS logs(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts TEXT NOT NULL,
        level TEXT NOT NULL,
        src TEXT NOT NULL,
        msg TEXT NOT NULL,
        data TEXT
      )`).run();

    await db
      .prepare(`INSERT INTO logs (ts, level, src, msg, data) VALUES (?1, ?2, ?3, ?4, ?5)`)
      .bind(new Date().toISOString(), level, src, msg, data ? JSON.stringify(data) : null)
      .run();
  } catch {
    // no-op
  }
}
