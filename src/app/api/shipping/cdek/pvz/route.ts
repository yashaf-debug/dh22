export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { findCityCodeByName, getPvzByCityCode } from "@/app/lib/cdek/api";

export async function GET(req: NextRequest) {
  const city = new URL(req.url).searchParams.get("city") || "";
  const code = await findCityCodeByName(city);
  if (!code) return NextResponse.json([]);
  const list = await getPvzByCityCode(code);
  return NextResponse.json(list.slice(0, 200));
}
