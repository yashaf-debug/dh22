import { getRequestContext } from "@cloudflare/next-on-pages";
export const runtime = "edge";

export async function all(sql, ...params) {
  const db = getRequestContext().env.DH22_DB;
  const ps = db.prepare(sql);
  const r = params.length ? await ps.bind(...params).all() : await ps.all();
  return r.results || [];
}

export async function first(sql, ...params) {
  const rows = await all(sql, ...params);
  return rows[0] || null;
}

export async function run(sql, ...params) {
  const db = getRequestContext().env.DH22_DB;
  const ps = db.prepare(sql);
  return params.length ? await ps.bind(...params).run() : await ps.run();
}
