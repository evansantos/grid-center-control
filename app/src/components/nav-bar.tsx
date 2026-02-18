'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationCenter } from '@/components/notification-center';
import { useIsMobile } from '@/lib/useMediaQuery';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

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

function NavDropdown({ group }: { group: NavGroup }) {
  const pathname = usePathname();
  const isActive = group.items.some((item) => pathname.startsWith(item.href));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "text-[length:var(--font-size-xs)] tracking-wide gap-1",
            isActive && "text-grid-accent"
          )}
        >
          {group.label}
          <span className="text-[10px] opacity-50">▾</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[160px]">
        {group.items.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link 
              href={item.href}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                pathname === item.href ? "text-grid-accent" : "text-grid-text-dim"
              )}
            >
              {item.icon && <span className="opacity-50 w-4 text-center">{item.icon}</span>}
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SearchTrigger() {
  return (
    <Button 
      variant="secondary" 
      size="sm" 
      className="text-grid-text-muted hover:text-grid-text-dim gap-2"
      onClick={() => {
        // Trigger Cmd+K search
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
      }}
    >
      <span>⌕</span>
      <span>Search</span>
      <kbd className="ml-2 px-1 py-0.5 rounded text-[10px] bg-grid-border text-grid-text-muted">
        ⌘K
      </kbd>
    </Button>
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
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-grid-accent to-transparent" />
      
      <nav className="sticky top-0 z-[100] border-b border-grid-border bg-grid-surface/90 backdrop-blur-sm px-4 py-2 flex items-center gap-1">
        {/* Bottom glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-grid-accent/50 to-transparent" />

        {/* Logo */}
        <Link 
          href="/" 
          className="font-bold text-sm tracking-widest mr-4 flex items-center gap-2 text-grid-accent"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-grid-accent shadow-[0_0_8px_var(--grid-accent)] animate-pulse" />
          <span>GRID</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:contents">
          {/* Separator */}
          <Separator orientation="vertical" className="h-4 mx-1 bg-grid-border-bright" />

          {/* Main links */}
          {mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[length:var(--font-size-xs)] tracking-wide px-2 py-1 rounded transition-colors hover:text-grid-text",
                pathname === link.href ? "text-grid-accent" : "text-grid-text-dim"
              )}
            >
              {link.label}
            </Link>
          ))}

          {/* Separator */}
          <Separator orientation="vertical" className="h-4 mx-1" />

          {/* Dropdown groups */}
          <NavDropdown group={analyticsGroup} />
          <NavDropdown group={toolsGroup} />
          <NavDropdown group={settingsGroup} />

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
          className="md:hidden p-2 text-xl text-grid-text"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobile && mobileMenuOpen && (
        <div className="sticky top-[42px] z-[99] border-b border-grid-border bg-grid-surface md:hidden">
          <div className="px-4 py-2 space-y-1">
            {allGroups.map((group) => (
              <div key={group.label}>
                <div className="text-[length:var(--font-size-xs)] uppercase tracking-wider py-1 mt-2 text-grid-text-muted opacity-60">
                  {group.label}
                </div>
                {group.items.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 py-2 text-sm hover:opacity-80",
                      pathname === link.href ? "text-grid-accent" : "text-grid-text-dim"
                    )}
                  >
                    {link.icon && <span className="opacity-50 w-4 text-center">{link.icon}</span>}
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="flex items-center gap-2 py-2 border-t border-grid-border">
              <ThemeToggle />
              <NotificationCenter />
            </div>
          </div>
        </div>
      )}
    </>
  );
}