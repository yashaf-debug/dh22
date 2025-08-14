export const onRequestGet: PagesFunction<{ DH22_IMAGES: R2Bucket }> =
  async ({ env }) => {
    try {
      const key = `test-${Date.now()}.txt`;
      await env.DH22_IMAGES.put(key, new TextEncoder().encode('ok'));
      const obj = await env.DH22_IMAGES.get(key);
      return new Response(obj ? 'R2 OK' : 'R2 put/get failed', { status: obj ? 200 : 500 });
    } catch (e: any) {
      console.error('R2 ping error:', e?.stack || e);
      return new Response('R2 ping error: ' + String(e?.message || e), { status: 500 });
    }
  };
