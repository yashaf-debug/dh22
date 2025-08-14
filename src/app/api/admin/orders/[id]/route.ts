// src/app/api/admin/orders/[id]/route.ts
export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/app/lib/db';

const getToken = (req: NextRequest) => req.headers.get('authorization')?.split(' ')[1] || '';
const ok = (x: any = {}) => NextResponse.json({ ok: true, ...x }, { status: 200 });
const fail = (error: string, detail?: any) => NextResponse.json({ ok: false, error, detail }, { status: 200 });

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (getToken(req) !== process.env.ADMIN_TOKEN) return fail('unauthorized');
    await run('DELETE FROM orders WHERE id=?', params.id);
    return ok();
  } catch (e:any) {
    return fail('delete_order_failed', String(e));
  }
}

