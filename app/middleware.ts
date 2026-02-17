import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws: wss:",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }
  return response;
}

const LOCALHOST_IPS = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1', 'localhost']);
const MUTATION_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

/**
 * Validate that a request genuinely originates from localhost.
 * We require the real IP (request.ip or x-real-ip) to be localhost.
 * x-forwarded-for is NOT trusted alone as it can be spoofed.
 */
function isLocalhostRequest(request: NextRequest): boolean {
  // Primary: use x-real-ip header (set by reverse proxy / Next.js runtime)
  const realIp = request.headers.get('x-real-ip');

  // x-forwarded-for is only trusted as supplementary — both must agree
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

  // If we have a real IP, it must be localhost
  if (realIp) {
    const realIsLocal = LOCALHOST_IPS.has(realIp);
    // If x-forwarded-for is also present, it must also be localhost
    if (forwarded) {
      return realIsLocal && LOCALHOST_IPS.has(forwarded);
    }
    return realIsLocal;
  }

  // If no real IP is available (dev mode), check forwarded but with caution
  // In production, having no real IP is suspicious — deny by default
  if (forwarded) {
    return LOCALHOST_IPS.has(forwarded);
  }

  // No IP info at all — only allow in development
  return process.env.NODE_ENV === 'development';
}

/**
 * CSRF protection: mutation requests must include an Origin header
 * matching the expected localhost origin.
 */
function validateCsrf(request: NextRequest): boolean {
  if (!MUTATION_METHODS.has(request.method)) {
    return true; // Only check mutations
  }

  const origin = request.headers.get('origin');
  if (!origin) {
    return false; // Mutations MUST have an Origin header
  }

  try {
    const originUrl = new URL(origin);
    const requestUrl = request.nextUrl;

    // Origin hostname must be localhost
    if (!LOCALHOST_IPS.has(originUrl.hostname)) {
      return false;
    }

    // Origin must match request host/port
    if (originUrl.host !== requestUrl.host) {
      return false;
    }

    return true;
  } catch {
    return false; // Malformed origin
  }
}

export function middleware(request: NextRequest) {
  // --- Localhost auth check for API routes ---
  if (request.nextUrl.pathname.startsWith('/api')) {
    if (!isLocalhostRequest(request)) {
      return applySecurityHeaders(
        new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }

    // CSRF protection for mutation methods
    if (!validateCsrf(request)) {
      return applySecurityHeaders(
        new NextResponse(JSON.stringify({ error: 'CSRF validation failed' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }

    // Rate limiting
    const ip = request.headers.get('x-real-ip') ?? '127.0.0.1';
    const result = rateLimit(ip);

    if (!result.success) {
      const response = new NextResponse(JSON.stringify({ error: 'Too Many Requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
      response.headers.set('Retry-After', String(result.reset - Math.floor(Date.now() / 1000)));
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', String(result.reset));
      return applySecurityHeaders(response);
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    response.headers.set('X-RateLimit-Reset', String(result.reset));
    return applySecurityHeaders(response);
  }

  // Security headers for all other routes
  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
