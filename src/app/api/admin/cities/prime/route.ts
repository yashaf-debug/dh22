export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";

const PREFIXES = ["а","б","в","г","д","е","ж","з","и","к","л","м","н","о","п","р","с","т","у","ф","х","ц","ч","ш","э","ю","я","мо","сан","нов","ек","ниж","каз","сам","рос","крас","вол","вла","тюм","ом","соч","тул"];

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1] || "";
  if (token !== (process.env.ADMIN_TOKEN || "")) return new Response("forbidden", { status: 403 });

  let added = 0;
  for (const p of PREFIXES) {
    try {
      await fetch(`${new URL(req.url).origin}/api/shipping/cdek/cities?q=${encodeURIComponent(p)}&limit=50`, { cache: "no-store" });
      added++;
    } catch {}
  }
  return NextResponse.json({ ok:true, done: added });
}
