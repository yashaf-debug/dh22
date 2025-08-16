// src/app/api/cart/add/route.ts
export const runtime = 'edge';
import { NextResponse } from 'next/server';

type CartItem = {
  slug: string;
  price: number;
  qty: number;
  color?: string | null;
  size?: string | null;
  variantId?: number;
  name?: string | null;
  image?: string | null;
};

function readCart(cookieHeader?: string): CartItem[] {
  const m = (cookieHeader || '').match(/(?:^|;\s*)cart=([^;]+)/);
  if (!m) return [];
  try { return JSON.parse(decodeURIComponent(m[1])); } catch { return []; }
}

export async function POST(req: Request) {
  const body = await req.json() as CartItem;
  const cart = readCart(req.headers.get('cookie') || '');

  const qty = Math.max(1, Number(body.qty||1));
  const idx = cart.findIndex(i => i.variantId === body.variantId);
  if (idx >= 0) cart[idx].qty += qty;
  else cart.push({
    slug: body.slug,
    price: body.price,
    qty,
    color: body.color || null,
    size: body.size || null,
    variantId: body.variantId,
    name: body.name || null,
    image: body.image || null,
  });

  const res = NextResponse.json({ ok: true, cart });
  res.headers.set('Set-Cookie', `cart=${encodeURIComponent(JSON.stringify(cart))}; Path=/; Max-Age=2592000; SameSite=Lax`);
  return res;
}

