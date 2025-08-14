export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { first } from "@/app/lib/db";

// base64 -> Uint8Array (в Edge есть atob)
function b64ToUint8(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function GET(_req: NextRequest, { params }: { params: { key: string } }) {
  try {
    const key = (params.key || "").trim();
    if (!key) return new NextResponse("Not found", { status: 404 });

    const row: any = await first("SELECT mime, bytes FROM uploads WHERE id=?", key);
    if (!row) return new NextResponse("Not found", { status: 404 });

    let body: any = row.bytes;

    // D1 может вернуть blob в разных видах — нормализуем:
    // 1) Uint8Array
    // 2) { type:'Buffer', data:[...] }
    // 3) base64-строка (редко)
    // 4) Array<number>
    if (body instanceof Uint8Array) {
      // ok
    } else if (body?.type === "Buffer" && Array.isArray(body?.data)) {
      body = new Uint8Array(body.data);
    } else if (typeof body === "string") {
      // пробуем как base64
      try { body = b64ToUint8(body); } catch { body = new Uint8Array([]); }
    } else if (Array.isArray(body)) {
      body = new Uint8Array(body);
    } else if (body?.buffer && body?.byteLength != null) {
      // ArrayBufferView / DataView
      body = new Uint8Array(body.buffer);
    } else {
      body = new Uint8Array([]);
    }

    const headers = new Headers({
      "content-type": row.mime || "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
    });
    return new NextResponse(body, { headers });
  } catch (e) {
    // чтобы не ронять весь рендер — отдаём 404
    return new NextResponse("Not found", { status: 404 });
  }
}
