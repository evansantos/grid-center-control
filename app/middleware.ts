import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

const ALLOWED_HOSTS = ['localhost', '127.0.0.1', '::1', '::ffff:127.0.0.1'];

const MUTATING_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

export function middleware(req: NextRequest) {
  const { method, headers, nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Only apply to API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // --- SEC-04: Localhost auth ---
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (!ALLOWED_HOSTS.includes(firstIp)) {
      return NextResponse.json({ error: 'Forbidden: non-local request' }, { status: 403 });
    }
  }

  // --- SEC-06: CORS ---
  const origin = headers.get('origin');
  const response = NextResponse.next();

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  // Handle preflight
  if (method === 'OPTIONS') {
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
    return new NextResponse(null, { status: 403 });
  }

  // --- SEC-07: CSRF protection on mutating requests ---
  if (MUTATING_METHODS.includes(method)) {
    if (origin) {
      if (!ALLOWED_ORIGINS.includes(origin)) {
        return NextResponse.json({ error: 'Forbidden: invalid origin' }, { status: 403 });
      }
    }
    // If no Origin header, check Referer as fallback
    const referer = headers.get('referer');
    if (!origin && referer) {
      try {
        const refUrl = new URL(referer);
        const refOrigin = refUrl.origin;
        if (!ALLOWED_ORIGINS.includes(refOrigin)) {
          return NextResponse.json({ error: 'Forbidden: invalid referer' }, { status: 403 });
        }
      } catch {
        // Invalid referer URL — block
        return NextResponse.json({ error: 'Forbidden: invalid referer' }, { status: 403 });
      }
    }
    // Allow requests with no Origin and no Referer (server-to-server, curl, etc.)
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
