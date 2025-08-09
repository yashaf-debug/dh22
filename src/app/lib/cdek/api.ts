import { getRequestContext } from "@cloudflare/next-on-pages";

const json = (r: Response) => r.text().then(t => { try { return JSON.parse(t) } catch { return null } });

async function getToken() {
  const { env } = getRequestContext();
  const base = env.CDEK_API_BASE || "https://api.cdek.ru/v2";
  const id = env.CDEK_API_CLIENT_ID, secret = env.CDEK_API_CLIENT_SECRET;
  if (!id || !secret) return null;

  // OAuth2 client_credentials
  const r = await fetch(`${base}/oauth/token?grant_type=client_credentials&client_id=${encodeURIComponent(id)}&client_secret=${encodeURIComponent(secret)}`, { method: "POST" });
  if (!r.ok) return null;
  const j = await json(r);
  return j?.access_token || null;
}

export async function findCityCodeByName(name: string) {
  const { env } = getRequestContext();
  const base = env.CDEK_API_BASE || "https://api.cdek.ru/v2";
  const t = await getToken(); if (!t) return null;
  const r = await fetch(`${base}/location/cities?country_codes=RU&city=${encodeURIComponent(name)}`, {
    headers: { authorization: `Bearer ${t}` }
  });
  const j = await json(r); const hit = Array.isArray(j) ? j[0] : null;
  return hit?.code || null;
}

export async function getTariffQuote(opts: { to_code: number; weight_g: number; mode: "courier" | "pvz"; }) {
  const { env } = getRequestContext();
  const base = env.CDEK_API_BASE || "https://api.cdek.ru/v2";
  const t = await getToken(); if (!t) return null;

  const body = {
    from_location: { code: Number(env.CDEK_SENDER_CITY_CODE) || 44 },
    to_location:   { code: opts.to_code },
    packages: [{ weight: Math.max(100, Math.round(opts.weight_g || 500)) }]
  };

  const r = await fetch(`${base}/calculator/tarifflist`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${t}` },
    body: JSON.stringify(body)
  });
  const j = await json(r);
  const list = j?.tariff_codes || [];
  // delivery_mode: 1 — дверь→дверь (courier), 3 — дверь→ПВЗ (pvz). Берём самый дешёвый подходящий.
  const target = opts.mode === "courier" ? [1] : [3];
  const candidates = list.filter((x: any) => target.includes(Number(x.delivery_mode)));
  if (!candidates.length) return null;
  const best = candidates.sort((a: any, b: any) => a.delivery_sum - b.delivery_sum)[0];

  const price_kop = Math.round(best.delivery_sum * 100);
  const eta = best?.delivery_date_range?.min && best?.delivery_date_range?.max
    ? `${best.delivery_date_range.min} — ${best.delivery_date_range.max}`
    : (best.period_min && best.period_max ? `${best.period_min}-${best.period_max} дн.` : "");

  return { price_kop, eta, tariff_code: best.tariff_code };
}

export async function getPvzByCityCode(code: number) {
  const { env } = getRequestContext();
  const base = env.CDEK_API_BASE || "https://api.cdek.ru/v2";
  const t = await getToken(); if (!t) return [];
  const r = await fetch(`${base}/deliverypoints?city_code=${code}&type=PVZ`, {
    headers: { authorization: `Bearer ${t}` }
  });
  const j = await json(r);
  const arr = Array.isArray(j) ? j : [];
  return arr.map((p: any) => ({
    code: p.code,
    name: `${p.name}${p.location?.address ? " — " + p.location.address : ""}`,
    address: p.location?.address || "",
    lat: p.location?.latitude,
    lng: p.location?.longitude
  }));
}
