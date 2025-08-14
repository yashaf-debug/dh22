export const onRequestPost: PagesFunction<{
  DH22_IMAGES: R2Bucket;
  NEXT_PUBLIC_R2_PUBLIC_BASE: string;
}> = async ({ request, env }) => {
  try {
    const form = await request.formData();
    const file = form.get('file') as File | null;
    if (!file) {
      return json({ ok: false, error: 'file field is required' }, 400);
    }

    // Проверим тип/расширение
    const original = file.name || 'upload';
    const ext = (original.split('.').pop() || '').toLowerCase();
    const allowed = new Set(['jpg','jpeg','png','webp','avif']);
    if (!allowed.has(ext)) {
      return json({ ok: false, error: `unsupported file type .${ext}` }, 415);
    }

    // Безопасное имя
    const base = original.replace(/\.[^.]+$/, '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^\w]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const key = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${base}.${ext}`;

    const buf = await file.arrayBuffer(); // файлы у нас небольшие, этого хватает
    await env.DH22_IMAGES.put(key, buf, {
      httpMetadata: { contentType: file.type || `image/${ext}` },
    });

    const baseUrl = (env.NEXT_PUBLIC_R2_PUBLIC_BASE || '').replace(/\/$/, '');
   const url = baseUrl ? `${baseUrl}/${key}` : `/${key}`;
    return json({ ok: true, key, path: `/r2/${key}`, url }, 200);
  } catch (e: any) {
    console.error('R2 upload failed:', e?.stack || e);
    return json({ ok: false, error: String(e?.message || e) }, 500);
  }
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
