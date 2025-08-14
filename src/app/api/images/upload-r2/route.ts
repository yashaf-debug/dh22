// src/app/api/images/upload-r2/route.ts
export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import type { R2Bucket } from '@cloudflare/workers-types';

function slug(s: string){ return s.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');}

export async function POST(req: Request) {
  try {
    const env = getRequestContext().env as unknown as { DH22_IMAGES: R2Bucket };
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error:'file required' }, { status:400 });

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const key = `${Date.now()}-${slug(file.name || 'upload')}.${ext}`;

    await env.DH22_IMAGES.put(key, file.stream() as any, {
      httpMetadata: { contentType: file.type || 'image/jpeg' },
    });

    // В БД сохраняем строку вида /r/<key>
    return NextResponse.json({ key, stored: `/r/${key}` });
  } catch (e:any) {
    return NextResponse.json({ error: String(e?.message||e) }, { status:500 });
  }
}

