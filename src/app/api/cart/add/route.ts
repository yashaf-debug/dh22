import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
export const runtime = 'edge';

type CartItem = { key: string; id: number; qty: number; size?: string | null; color?: string | null };

export async function POST(req: Request) {
  const form = await req.formData();
  const id = Number(form.get('product_id') || 0);
  const qty = Math.max(1, parseInt(String(form.get('qty') || '1'), 10));
  const size = (form.get('size') as string) || null;
  const color = (form.get('color') as string) || null;

  if (!id) {
    // нет id — просто вернёмся в корзину без изменений
    return NextResponse.redirect(new URL('/cart', req.url));
  }

  const key = `${id}:${size || ''}:${color || ''}`;

  const store = cookies();
  const raw = store.get('cart')?.value || '[]';
  let cart: CartItem[] = [];
  try { cart = JSON.parse(raw); } catch { cart = []; }

  const found = cart.find(i => i.key === key);
  if (found) found.qty += qty;
  else cart.push({ key, id, qty, size, color });

  const res = NextResponse.redirect(new URL('/cart', req.url));
  res.cookies.set('cart', JSON.stringify(cart), {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
