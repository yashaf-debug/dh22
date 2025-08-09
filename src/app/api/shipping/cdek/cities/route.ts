export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

async function getToken(base: string, id: string, secret: string) {
  const r = await fetch(
    `${base}/oauth/token?grant_type=client_credentials&client_id=${encodeURIComponent(id)}&client_secret=${encodeURIComponent(secret)}`,
    { method: "POST" }
  );
  if (!r.ok) return null;
  const t = await r.json().catch(()=>null);
  return t?.access_token || null;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const size = Math.min(20, Math.max(5, Number(url.searchParams.get("limit") || 10)));
  if (!q) return NextResponse.json([]);

  const { env } = getRequestContext();
  const base = env.CDEK_API_BASE || "https://api.cdek.ru/v2";
  const token = await getToken(base, env.CDEK_API_CLIENT_ID || "", env.CDEK_API_CLIENT_SECRET || "");
  if (!token) return NextResponse.json([]);

  const r = await fetch(`${base}/location/cities?country_codes=RU&city=${encodeURIComponent(q)}&size=${size}`, {
    headers: { authorization: `Bearer ${token}` }
  });
  const j = await r.json().catch(()=>[]);
  const out = Array.isArray(j) ? j.map((c: any) => ({
    code: c.code,
    name: c.city,
    region: c.region,
    country_code: c.country_code,
    full: [c.city, c.region].filter(Boolean).join(", ")
  })) : [];
  return NextResponse.json(out);
}

