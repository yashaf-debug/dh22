export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const track = (url.searchParams.get("track") || "").trim();
  if (!track) return new NextResponse("track required", { status: 400 });
  // Если понадобится поменять формат — меняем тут один раз
  const target = `https://www.cdek.ru/ru/tracking?order_id=${encodeURIComponent(track)}`;
  return NextResponse.redirect(target, 302);
}
