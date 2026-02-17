'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Format a path segment into a human-readable label.
 * - Pure numeric IDs become "#42"
 * - UUIDs/hex hashes get truncated
 * - Known prefixes like "sessions" cause the next ID to show as "Session #id"
 * - Everything else is capitalized
 */
function formatSegment(segment: string, prevSegment?: string): string {
  // Numeric ID — prefix with # or contextual label
  if (/^\d+$/.test(segment)) {
    const ctx = prevSegment
      ? prevSegment.charAt(0).toUpperCase() + prevSegment.slice(1).replace(/s$/, '')
      : '';
    return ctx ? `${ctx} #${segment}` : `#${segment}`;
  }

  // UUID or long hex hash — truncate
  if (/^[0-9a-f]{8,}/i.test(segment) && segment.length > 12) {
    return segment.slice(0, 8) + '…';
  }

  // Regular word — capitalize, replace dashes with spaces
  return segment
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function BreadcrumbNav() {
  const pathname = usePathname();

  // Don't render on home page
  if (!pathname || pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);

  const crumbs = segments.map((seg, i) => ({
    label: formatSegment(seg, i > 0 ? segments[i - 1] : undefined),
    href: '/' + segments.slice(0, i + 1).join('/'),
  }));

  return (
    <nav
      aria-label="Breadcrumb"
      className="px-4 md:px-6 py-1.5 text-xs flex items-center gap-1 overflow-hidden"
      style={{
        borderBottom: '1px solid var(--grid-border)',
        background: 'var(--grid-surface)',
        color: 'var(--grid-text-muted)',
      }}
    >
      {/* Home */}
      <Link
        href="/"
        className="shrink-0 hover:underline transition-colors"
        style={{ color: 'var(--grid-text-dim)' }}
      >
        Home
      </Link>

      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        const isMiddle = !isLast && i > 0 && crumbs.length > 3;
        // On mobile, collapse middle segments when there are many
        const hiddenOnMobile = isMiddle && i < crumbs.length - 2;

        return (
          <span key={crumb.href} className={`flex items-center gap-1 min-w-0 ${hiddenOnMobile ? 'hidden md:flex' : 'flex'}`}>
            {/* Separator */}
            <span className="shrink-0 opacity-40 mx-0.5" style={{ color: 'var(--grid-text-muted)' }}>
              ›
            </span>

            {isLast ? (
              <span
                className="truncate font-medium"
                style={{ color: 'var(--grid-text)' }}
                aria-current="page"
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="truncate hover:underline transition-colors"
                style={{ color: 'var(--grid-text-dim)' }}
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}

      {/* Mobile ellipsis indicator when segments are hidden */}
      {crumbs.length > 3 && (
        <span className="flex md:hidden items-center order-first ml-0" style={{ display: 'none' }}>
          {/* Rendered via CSS trick: we use a simpler approach — the hidden segments above handle it */}
        </span>
      )}
    </nav>
  );
}
