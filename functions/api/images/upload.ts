export const onRequestPost: PagesFunction<{
  DH22_IMAGES: R2Bucket;
  NEXT_PUBLIC_R2_PUBLIC_BASE: string;
}> = async ({ request, env }) => {
  try {
    const form = await request.formData();
    const file = form.get('file') as File | null;
    if (!file) return new Response('file required', { status: 400 });

    const allowed = ['jpg','jpeg','png','webp','avif'];
    const name = file.name || 'upload';
    const ext = (name.split('.').pop() || '').toLowerCase();
    if (!allowed.includes(ext)) {
      return new Response('unsupported file type', { status: 415 });
    }

    const safeBase = name.replace(/\.[^.]+$/, '')
                         .toLowerCase()
                         .normalize('NFKD')
                         .replace(/[^\w]+/g, '-')
                         .replace(/-+/g, '-')
                         .replace(/^-|-$/g, '');
    const key = `${Date.now()}-${crypto.randomUUID().slice(0,8)}-${safeBase}.${ext}`;

    const buf = await file.arrayBuffer();
    await env.DH22_IMAGES.put(key, buf, {
      httpMetadata: { contentType: file.type || `image/${ext}` },
    });

    const base = (env.NEXT_PUBLIC_R2_PUBLIC_BASE || '').replace(/\/$/, '');
    const url = base ? `${base}/${key}` : `/${key}`;
    const body = JSON.stringify({ ok: true, key, path: `/r2/${key}`, url });
    return new Response(body, {
      headers: { 'content-type': 'application/json' }
    });
  } catch (e) {
    return new Response('upload failed', { status: 500 });
  }
};
