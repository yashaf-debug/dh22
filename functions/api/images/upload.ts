import type { R2Bucket } from '@cloudflare/workers-types';

export const onRequestPost: PagesFunction<{ DH22_IMAGES: R2Bucket }> = async (ctx) => {
  const form = await ctx.request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ error: 'no file' }), { status: 400 });
  }

  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  const key = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  await ctx.env.DH22_IMAGES.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  return Response.json({ path: `/r2/${key}` });
};

