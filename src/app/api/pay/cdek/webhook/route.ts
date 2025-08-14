import * as Sentry from '@sentry/nextjs';
import { logEvent } from '@/lib/logs';
import { NextRequest } from 'next/server';
export const runtime = 'edge';
const SIGNATURE_HEADERS = ['x-signature','x-content-signature','signature'];

async function hmac(body: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,'0')).join('');
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.CDEKPAY_WEBHOOK_SECRET;
    if (!secret) return new Response('No secret', { status: 500 });

    const raw = await req.text(); // важно получить СЫРОЕ тело
    const headerSig =
      SIGNATURE_HEADERS.map(h => req.headers.get(h)).find(Boolean) || '';

    const calc = await hmac(raw, secret);

    if (!headerSig || headerSig.toLowerCase() !== calc) {
      await logEvent('warn','cdek:webhook','bad-signature',{ headerSig, calc });
      return new Response('Bad signature', { status: 401 });
    }

    const payload = JSON.parse(raw);

    // TODO: обработай статусы платежей (paid/canceled/refunded etc.)
    await logEvent('info','cdek:webhook','ok', { order_id: payload?.order_id, status: payload?.status });

    return new Response('ok', { status: 200 });
  } catch (err) {
    Sentry.captureException(err);
    await logEvent('error','cdek:webhook','exception',{ error: String(err) });
    return new Response('error', { status: 500 });
  }
}
