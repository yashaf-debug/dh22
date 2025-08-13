export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { run } from "@/app/lib/db";

function nanoid() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1] || "";
  if (token !== (process.env.ADMIN_TOKEN || "")) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ ok: false, error: "file_required" }, { status: 400 });

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "too_large" }, { status: 413 });
  }

  const buf = new Uint8Array(await file.arrayBuffer());
  const id = nanoid();
  await run("INSERT INTO uploads (id, mime, bytes) VALUES (?,?,?)", id, file.type || "application/octet-stream", buf);
  return NextResponse.json({ ok: true, id, url: `/i/${id}`, mime: file.type });
}

