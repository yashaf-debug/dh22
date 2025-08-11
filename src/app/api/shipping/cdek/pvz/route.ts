export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { first, run } from "@/app/lib/db";

function norm(s: string) {
  return String(s || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ")
    .trim();
}

/** OAuth2 токен СДЭК с кэшем в D1 (таблица kv) */
async function getCdekToken(env: any) {
  const base = env.CDEK_API_BASE || "https://api.cdek.ru/v2";
  const now = Math.floor(Date.now() / 1000);

  const cached = await first("SELECT v, expires_at FROM kv WHERE k='cdek_token'");
  if (cached && cached.expires_at > now + 60) return cached.v as string;

  const r = await fetch(
    `${base}/oauth/token?grant_type=client_credentials&client_id=${encodeURIComponent(env.CDEK_API_CLIENT_ID || "")}&client_secret=${encodeURIComponent(env.CDEK_API_CLIENT_SECRET || "")}`,
    { method: "POST" }
  );
  if (!r.ok) throw new Error("CDEK auth failed");
  const j = await r.json();
  const token = j?.access_token as string;
  const exp = now + Number(j?.expires_in || 3600);

  await run(
    `INSERT INTO kv (k,v,expires_at) VALUES (?,?,?)
     ON CONFLICT(k) DO UPDATE SET v=excluded.v, expires_at=excluded.expires_at`,
    "cdek_token", token, exp
  );
  return token;
}

function mapPoint(p: any) {
  const loc = p?.location || {};
  return {
    code: String(p?.code || p?.id || ""),
    name: String(p?.name || ""),
    address: String(loc?.address || p?.address || ""),
    lat: Number(loc?.latitude || loc?.lat || 0),
    lon: Number(loc?.longitude || loc?.lng || 0),
    work_time: String(p?.work_time || ""),
    phones: Array.isArray(p?.phones) ? p.phones.map((x: any) => x.number).join(", ") : ""
  };
}

export async function GET(req: NextRequest) {
  const { env } = getRequestContext();
  const base = env.CDEK_API_BASE || "https://api.cdek.ru/v2";
  const url = new URL(req.url);

  const city = (url.searchParams.get("city") || "").trim();
  const cityCode = url.searchParams.get("city_code");
  const type = url.searchParams.get("type") || "PVZ"; // PVZ|POSTAMAT
  const q = (url.searchParams.get("q") || "").trim();
  const limit = Math.min(500, Math.max(1, Number(url.searchParams.get("limit") || 200)));

  if (!city && !cityCode) return NextResponse.json([]);

  const token = await getCdekToken(env);

  const qs: string[] = ["country_code=RU", `type=${encodeURIComponent(type)}`];
  if (cityCode) qs.push(`city_code=${encodeURIComponent(cityCode)}`);
  else qs.push(`city=${encodeURIComponent(city)}`);

  const r = await fetch(`${base}/deliverypoints?${qs.join("&")}`, {
    headers: { authorization: `Bearer ${token}` }
  });

  if (!r.ok) {
    const txt = await r.text();
    return NextResponse.json({ ok: false, status: r.status, error: txt }, { status: 200 });
  }

  const j = await r.json().catch(() => []);
  let out = Array.isArray(j) ? j.map(mapPoint).filter(p => p.lat && p.lon) : [];

  // фильтр по адресу/имени (на сервере)
  if (q) {
    const nq = norm(q);
    out = out.filter(p => norm(`${p.name} ${p.address}`).includes(nq));
  }

  return NextResponse.json(out.slice(0, limit), { status: 200 });
}
