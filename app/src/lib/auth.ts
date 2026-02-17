import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = ['localhost', '127.0.0.1', '::1', '::ffff:127.0.0.1'];

/**
 * Validates that a request originates from localhost.
 * Returns a NextResponse error if not authorized, or null if OK.
 */
export function requireLocalhost(req: NextRequest): NextResponse | null {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (!ALLOWED_HOSTS.includes(firstIp)) {
      return NextResponse.json({ error: 'Forbidden: non-local request' }, { status: 403 });
    }
  }

  const host = req.headers.get('host')?.split(':')[0];
  if (host && !ALLOWED_HOSTS.includes(host)) {
    return NextResponse.json({ error: 'Forbidden: non-local host' }, { status: 403 });
  }

  return null;
}
