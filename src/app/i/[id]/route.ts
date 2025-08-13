export const runtime = "edge";

import { NextRequest } from "next/server";
import { first } from "@/app/lib/db";

// base64 -> Uint8Array (в Edge есть atob)
function b64ToUint8(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = (params.id || "").trim();
    if (!id) return new Response("Not found", { status: 404 });

    const row: any = await first("SELECT mime, bytes FROM uploads WHERE id=?", id);
    if (!row) return new Response("Not found", { status: 404 });

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

    const mime = row.mime || "application/octet-stream";
    return new Response(body, {
      headers: {
        "content-type": mime,
        "cache-control": "public, max-age=31536000, immutable"
      }
    });
  } catch (e) {
    // чтобы не ронять весь рендер — отдаём 404
    return new Response("Not found", { status: 404 });
  }
}
