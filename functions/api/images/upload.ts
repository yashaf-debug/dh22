// functions/api/images/upload.ts — Pages Functions
export interface Env {
  DH22_IMAGES: R2Bucket;                   // binding к бакету с картинками
  NEXT_PUBLIC_R2_PUBLIC_BASE: string;      // https://pub-....r2.dev (без завершающего /)
}

// Утилита генерации ключа
function r2Key(name?: string) {
  const ts = Date.now();
  const rnd = Math.random().toString(36).slice(2, 8);
  const clean = (name || "file").replace(/[^a-z0-9._-]/gi, "_").toLowerCase();
  return `${ts}-${rnd}-${clean}`;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ ok: false, error: "No file" }), { status: 400 });
    }

    const key = r2Key(file.name);
    await env.DH22_IMAGES.put(key, file.stream(), {
      httpMetadata: { contentType: file.type || "application/octet-stream" },
    });

    const base = env.NEXT_PUBLIC_R2_PUBLIC_BASE.replace(/\/$/, "");
    // path — что кладём в D1; url — абсолютный для превью
    return new Response(JSON.stringify({
      ok: true,
      key,
      path: `/r2/${key}`,
      url: `${base}/${key}`,
    }), { headers: { "content-type": "application/json" } });
  } catch (e: any) {
    console.error("R2 upload error:", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
  }
};
