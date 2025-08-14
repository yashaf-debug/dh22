import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 });

  const account = process.env.CF_ACCOUNT_ID!;
  const token = process.env.CF_IMAGES_TOKEN!; // с правами Images:Edit

  const fd = new FormData();
  fd.append('file', file, (file as any).name ?? 'upload.jpg');

  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/images/v1`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const j = await r.json();
  if (!j.success) return NextResponse.json(j, { status: 500 });
  const id: string = j.result.id;
  return NextResponse.json({ id, url: `/i/${id}` });
}
