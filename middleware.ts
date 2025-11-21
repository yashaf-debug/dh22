import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { SITE } from '@/lib/seo';

const canonicalHost = SITE.domain;

export function middleware(request: NextRequest) {
  const protocol = request.headers.get('x-forwarded-proto');
  const host = request.headers.get('host');

  if (protocol && protocol !== 'https') {
    const url = request.nextUrl;
    url.protocol = 'https';
    url.host = canonicalHost;
    return NextResponse.redirect(url, 301);
  }

  if (host && canonicalHost && host !== canonicalHost) {
    const url = request.nextUrl;
    url.host = canonicalHost;
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
