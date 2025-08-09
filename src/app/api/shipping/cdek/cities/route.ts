export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

/** Мини-fallback: самые частые города (можно расширять по ходу).
 *  Код 44 — Москва (официальный city_code СДЭК).
 *  Остальные добавим позже, когда понадобятся (или подтянем из кеша D1).
 */
const FALLBACK: Array<{ code: number; name: string; region?: string }> = [
  { code: 44, name: "Москва", region: "г. Москва" },
  // { code: XXX, name: "Санкт-Петербург", region: "Ленинградская обл." },
  // { code: XXX, name: "Новосибирск", region: "Новосибирская обл." },
];

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ")
    .trim();
}

// очень простой транслит для «mos», «moskva»
function translitToRu(s: string) {
  const x = s.toLowerCase();
  if (x.startsWith("mos")) return "мос"; // mos* -> «мос*»
  return s;
}

async function getToken(base: string, id: string, secret: string) {
  const tokenUrl = `${base}/oauth/token?grant_type=client_credentials&client_id=${encodeURIComponent(id)}&client_secret=${encodeURIComponent(secret)}`;
  const r = await fetch(tokenUrl, { method: "POST" });
  if (!r.ok) return null;
  const t = await r.json().catch(() => null);
  return t?.access_token || null;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  let q = (url.searchParams.get("q") || "").trim();
  const limit = Math.min(20, Math.max(5, Number(url.searchParams.get("limit") || 10)));
  if (q.length < 2) return NextResponse.json([]);

  // Нормализуем и поддержим примитивный транслит
  const qNorm = norm(translitToRu(q));
  const { env } = getRequestContext();
  const base = env.CDEK_API_BASE || "https://api.cdek.ru/v2";
  const id = env.CDEK_API_CLIENT_ID || "";
  const secret = env.CDEK_API_CLIENT_SECRET || "";

  // 1) Пытаемся через СДЭК
  let list: any[] = [];
  try {
    const token = await getToken(base, id, secret);
    if (token) {
      // Пробуем дважды: как есть и в UPPER (на практике иногда помогает)
      for (const variant of [q, q.toUpperCase()]) {
        const r = await fetch(
          `${base}/location/cities?country_codes=RU&city=${encodeURIComponent(variant)}&size=${limit}`,
          { headers: { authorization: `Bearer ${token}` } }
        );
        const j = await r.json().catch(() => []);
        if (Array.isArray(j) && j.length) {
          list = j;
          break;
        }
      }
    }
  } catch {
    // глушим — ниже есть fallback
  }

  // 2) Если СДЭК ничего не дал — локальный fallback (и "умный" startsWith/contains)
  if (!Array.isArray(list) || list.length === 0) {
    const out = FALLBACK
      .filter(c => {
        const full = norm([c.name, c.region].filter(Boolean).join(", "));
        return full.startsWith(qNorm) || full.includes(qNorm);
      })
      .slice(0, limit)
      .map(c => ({
        code: c.code,
        name: c.name,
        region: c.region,
        country_code: "RU",
        full: [c.name, c.region].filter(Boolean).join(", ")
      }));

    return NextResponse.json(out);
  }

  // 3) Нормальный ответ СДЭК
  const out = list.slice(0, limit).map((c: any) => ({
    code: c.code,
    name: c.city,
    region: c.region,
    country_code: c.country_code,
    full: [c.city, c.region].filter(Boolean).join(", ")
  }));
  return NextResponse.json(out);
}

