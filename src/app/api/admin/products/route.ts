import { NextResponse } from "next/server";
import { createDraftProduct } from "@/lib/adminMutations";

function getToken(req: Request) {
  const u = new URL(req.url);
  return u.searchParams.get("t") || req.headers.get("x-admin-token") || "";
}

export async function POST(req: Request) {
  const t = getToken(req);
  if (!t) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const id = await createDraftProduct();
  return NextResponse.json({ ok: true, id });
}

