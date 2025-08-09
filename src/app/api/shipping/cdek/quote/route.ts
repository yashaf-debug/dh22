export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { findCityCodeByName, getTariffQuote } from "@/app/lib/cdek/api";
import { getRequestContext } from "@cloudflare/next-on-pages";

export async function POST(req: NextRequest) {
  const b = await req.json().catch(()=>({}));
  const method = b.method as "same_day_msk"|"cdek_courier"|"cdek_pvz";
  const city = String(b.city || "").trim();
  const weight_g = Math.max(100, Math.round(b.weight_g || 500));
  const { env } = getRequestContext();

  if (method === "same_day_msk") {
    if (!city.toLowerCase().includes("моск")) {
      return NextResponse.json({ ok:false, error:"ONLY_MOSCOW" });
    }
    const price_kop = Number(env.SAME_DAY_MSK_PRICE || 79000);
    return NextResponse.json({ ok:true, method, price_kop, eta: "в день заказа" });
  }

  const to_code = await findCityCodeByName(city);
  if (!to_code) return NextResponse.json({ ok:false, error:"CITY_NOT_FOUND" });

  const mode = method === "cdek_courier" ? "courier" : "pvz";
  const q = await getTariffQuote({ to_code, weight_g, mode });
  if (!q) return NextResponse.json({ ok:false, error:"NO_TARIFF" });

  return NextResponse.json({ ok:true, method, city_code: to_code, ...q });
}
