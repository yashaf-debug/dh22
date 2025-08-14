// functions/api/images/upload.ts
// Cloudflare Pages Functions
export interface Env {
  DH22_IMAGES: R2Bucket; // binding есть в проекте
  NEXT_PUBLIC_R2_PUBLIC_BASE: string; // https://pub-....r2.dev
}

function randomKey(originalName?: string) {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const clean = (originalName || "file").replace(/[^a-z0-9._-]/gi, "_").toLowerCase();
  return `${ts}-${rand}-${clean}`;
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  try {
    const { request, env } = ctx;
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ ok: false, error: "No file" }), { status: 400 });
    }

    // ключ для хранения в R2
    const key = randomKey(file.name);

    // заливаем поток в R2
    await env.DH22_IMAGES.put(key, file.stream(), {
      httpMetadata: { contentType: file.type || "application/octet-stream" },
    });

    // путь, который храним в D1 (как вы договорились)
    const path = `/r2/${key}`;
    // полный публичный URL для превью
    const url = `${env.NEXT_PUBLIC_R2_PUBLIC_BASE.replace(/\/$/, "")}/${key}`;

    return new Response(JSON.stringify({ ok: true, key, path, url }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    console.error("R2 upload error:", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
};

