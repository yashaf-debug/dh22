export const runtime = 'edge';

export async function GET() {
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    'Sitemap: https://dh22.ru/sitemap.xml',
    ''
  ].join('\n');

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
}
