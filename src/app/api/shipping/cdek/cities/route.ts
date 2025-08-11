export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { all, run } from "@/app/lib/db"; // наши хелперы для D1

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ")
    .trim();
}

// очень простой транслит: mos, mosc, moskva -> "мос"
function translitToRu(q: string) {
  const x = q.toLowerCase();
  if (x.startsWith("mos")) return "мос";
  return q;
}

async function getToken(base: string, id: string, secret: string) {
  if (!id || !secret) return null;
  const r = await fetch(
    `${base}/oauth/token?grant_type=client_credentials&client_id=${encodeURIComponent(id)}&client_secret=${encodeURIComponent(secret)}`,
    { method: "POST" }
  );
  if (!r.ok) return null;
  const j = await r.json().catch(()=>null);
  return j?.access_token || null;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const raw = (url.searchParams.get("q") || "").trim();
  const limit = Math.min(20, Math.max(5, Number(url.searchParams.get("limit") || 10)));
  if (raw.length < 2) return NextResponse.json([]);

  const q = norm(translitToRu(raw));

  // 1) Сначала ищем в своём кэше (быстро и предсказуемо)
  // Поддерживаем и prefix ("мо%"), и contains по второму слову ("% мо%")
  const cached = await all(
    `SELECT code, city, region, country_code
       FROM cities
      WHERE search LIKE ? OR search LIKE ?
      ORDER BY city
      LIMIT ?`,
    `${q}%`,
    `% ${q}%`,
    limit
  );

  if (cached.length >= limit) {
    return NextResponse.json(
      cached.map((c:any)=>({
        code: c.code,
        name: c.city,
        region: c.region,
        country_code: c.country_code,
        full: [c.city, c.region].filter(Boolean).join(", ")
      }))
    );
  }

  // 2) Если кэш дал мало — дотягиваем из СДЭК и кладём в кэш (upsert)
  const { env } = getRequestContext();
  const base = env.CDEK_API_BASE || "https://api.cdek.ru/v2";
  const token = await getToken(base, env.CDEK_API_CLIENT_ID || "", env.CDEK_API_CLIENT_SECRET || "");

  let ext: any[] = [];
  if (token) {
    for (const variant of [raw, raw.toUpperCase(), q]) {
      const r = await fetch(
        `${base}/location/cities?country_codes=RU&city=${encodeURIComponent(variant)}&size=${limit}`,
        { headers: { authorization: `Bearer ${token}` } }
      );
      const j = await r.json().catch(()=>[]);
      if (Array.isArray(j) && j.length) { ext = j; break; }
    }
  }

  // upsert в D1 и объединённый ответ
  const merged: any[] = [...cached];
  for (const c of Array.isArray(ext) ? ext : []) {
    const code = Number(c.code);
    const city = String(c.city || "");
    const region = String(c.region || "");
    const cc = String(c.country_code || "RU");
    const search = norm([city, region].filter(Boolean).join(", "));
    await run(
      `INSERT INTO cities (code, city, region, country_code, search)
       VALUES (?,?,?,?,?)
       ON CONFLICT(code) DO UPDATE SET
         city=excluded.city,
         region=excluded.region,
         country_code=excluded.country_code,
         search=excluded.search`,
      code, city, region, cc, search
    );
    merged.push({ code, city, region, country_code: cc });
  }

  // Убираем дубли по code и ограничиваем лимитом
  const seen = new Set<number>();
  const out = merged.filter((c:any)=> {
    if (seen.has(c.code)) return false;
    seen.add(c.code);
    return true;
  }).slice(0, limit).map((c:any)=>({
    code: c.code,
    name: c.city,
    region: c.region,
    country_code: c.country_code,
    full: [c.city, c.region].filter(Boolean).join(", ")
  }));

  return NextResponse.json(out);
}
