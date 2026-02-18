'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationCenter } from '@/components/notification-center';
import { useIsMobile } from '@/lib/useMediaQuery';

interface DropdownItem {
  label: string;
  href: string;
  icon?: string;
}

interface NavGroup {
  label: string;
  items: DropdownItem[];
}

const mainLinks: DropdownItem[] = [
  { label: 'Dashboard', href: '/', icon: '◉' },
  { label: 'Office', href: '/office', icon: '▦' },
  { label: 'Agents', href: '/agents', icon: '◈' },
];

const analyticsGroup: NavGroup = {
  label: 'Analytics',
  items: [
    { label: 'Performance', href: '/analytics/performance', icon: '⚡' },
    { label: 'Sessions', href: '/analytics/sessions', icon: '◎' },
    { label: 'Timeline', href: '/analytics/timeline', icon: '▸' },
  ],
};

const toolsGroup: NavGroup = {
  label: 'Tools',
  items: [
    { label: 'Spawn', href: '/spawn', icon: '✦' },
    { label: 'Logs', href: '/logs', icon: '▤' },
    { label: 'Tokens', href: '/tokens', icon: '⬡' },
    { label: 'Errors', href: '/errors', icon: '⚠' },
    { label: 'Health', href: '/health', icon: '♥' },
    { label: 'Files', href: '/files', icon: '📁' },
  ],
};

const settingsGroup: NavGroup = {
  label: 'Settings',
  items: [
    { label: 'Escalation', href: '/settings/escalation', icon: '⇧' },
  ],
};

function Dropdown({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isActive = group.items.some((item) => pathname.startsWith(item.href));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs tracking-wide px-2 py-1 rounded transition-colors"
        style={{
          color: isActive ? 'var(--grid-accent)' : 'var(--grid-text-dim)',
          background: open ? 'var(--grid-surface-hover)' : 'transparent',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--grid-text)')}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.color = 'var(--grid-text-dim)';
        }}
      >
        {group.label}
        <span className="text-[10px] opacity-50" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▾</span>
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 min-w-[160px] py-1 rounded-lg shadow-xl z-50"
          style={{
            background: 'var(--grid-surface)',
            border: '1px solid var(--grid-border-bright)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs transition-colors"
              style={{
                color: pathname === item.href ? 'var(--grid-accent)' : 'var(--grid-text-dim)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--grid-surface-hover)';
                e.currentTarget.style.color = 'var(--grid-text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = pathname === item.href ? 'var(--grid-accent)' : 'var(--grid-text-dim)';
              }}
            >
              {item.icon && <span className="opacity-50 w-4 text-center">{item.icon}</span>}
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchTrigger() {
  return (
    <button
      className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md transition-colors"
      style={{
        color: 'var(--grid-text-muted)',
        border: '1px solid var(--grid-border)',
        background: 'var(--grid-surface)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--grid-border-bright)';
        e.currentTarget.style.color = 'var(--grid-text-dim)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--grid-border)';
        e.currentTarget.style.color = 'var(--grid-text-muted)';
      }}
      onClick={() => {
        // Trigger Cmd+K search
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
      }}
    >
      <span>⌕</span>
      <span>Search</span>
      <kbd
        className="ml-2 px-1 py-0.5 rounded text-[10px]"
        style={{ background: 'var(--grid-border)', color: 'var(--grid-text-muted)' }}
      >
        ⌘K
      </kbd>
    </button>
  );
}

const allGroups = [
  { label: 'Main', items: mainLinks },
  analyticsGroup,
  toolsGroup,
  settingsGroup,
];

export function NavBar() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Accent glow bar at very top */}
      <div
        className="h-[2px] w-full"
        style={{
          background: `linear-gradient(90deg, transparent, var(--grid-accent), var(--grid-accent-glow), var(--grid-accent), transparent)`,
        }}
      />
      <nav
        className="relative border-b px-4 py-2 flex items-center gap-1 backdrop-blur-sm"
        style={{
          borderColor: 'var(--grid-border)',
          background: 'color-mix(in srgb, var(--grid-surface) 90%, transparent)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Bottom glow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, var(--grid-accent-glow), var(--grid-accent-dim), var(--grid-accent-glow), transparent)`,
          }}
        />

        {/* Logo */}
        <Link href="/" className="font-bold text-sm tracking-widest mr-4 flex items-center gap-2" style={{ color: 'var(--grid-accent)' }}>
          <span style={{
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: 'var(--grid-accent)',
            boxShadow: '0 0 8px var(--grid-accent)',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          <span>GRID</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:contents">
          {/* Separator */}
          <div className="w-px h-4 mx-1" style={{ background: 'var(--grid-border-bright)' }} />

          {/* Main links */}
          {mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs tracking-wide px-2 py-1 rounded transition-colors"
              style={{
                color: pathname === link.href ? 'var(--grid-accent)' : 'var(--grid-text-dim)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--grid-text)')}
              onMouseLeave={(e) => {
                if (pathname !== link.href) e.currentTarget.style.color = 'var(--grid-text-dim)';
              }}
            >
              {link.label}
            </Link>
          ))}

          {/* Separator */}
          <div className="w-px h-4 mx-1" style={{ background: 'var(--grid-border)' }} />

          {/* Dropdown groups */}
          <Dropdown group={analyticsGroup} />
          <Dropdown group={toolsGroup} />
          <Dropdown group={settingsGroup} />

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right side */}
          <SearchTrigger />
          <div className="ml-2 flex items-center gap-1">
            <ThemeToggle />
            <NotificationCenter />
          </div>
        </div>

        {/* Mobile: spacer + hamburger */}
        <div className="flex-1 md:hidden" />
        <button
          className="md:hidden p-2 text-xl"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ color: 'var(--grid-text)' }}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobile && mobileMenuOpen && (
        <div
          className="border-b md:hidden"
          style={{
            borderColor: 'var(--grid-border)',
            background: 'var(--grid-surface)',
            position: 'sticky',
            top: 42,
            zIndex: 99,
          }}
        >
          <div className="px-4 py-2 space-y-1">
            {allGroups.map((group) => (
              <div key={group.label}>
                <div className="text-xs uppercase tracking-wider py-1 mt-2" style={{ color: 'var(--grid-text-muted)', opacity: 0.6 }}>
                  {group.label}
                </div>
                {group.items.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-sm hover:opacity-80"
                    style={{ color: pathname === link.href ? 'var(--grid-accent)' : 'var(--grid-text-dim)' }}
                  >
                    {link.icon && <span className="opacity-50 w-4 text-center">{link.icon}</span>}
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="flex items-center gap-2 py-2 border-t" style={{ borderColor: 'var(--grid-border)' }}>
              <ThemeToggle />
              <NotificationCenter />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
