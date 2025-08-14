import * as Sentry from '@sentry/nextjs';

export async function GET() {
  try {
    throw new Error('Sentry test error');
  } catch (err) {
    Sentry.captureException(err);
    return new Response('Sent to Sentry', { status: 500 });
  }
}
