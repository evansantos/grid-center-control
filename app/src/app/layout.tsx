'use client';
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { OfficeThemeProvider } from '@/components/office-theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationProvider } from '@/components/notification-provider';
import { NotificationCenter } from '@/components/notification-center';
import { GlobalSearch } from '@/components/global-search';
import { useIsMobile } from '@/lib/useMediaQuery';
import { useState } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Grid — Dev Workflow</title>
        <meta name="description" content="MCP Development Orchestrator" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <OfficeThemeProvider>
          <NotificationProvider>
            <nav className="border-b px-4 md:px-6 py-3 flex items-center gap-4" style={{ borderColor: 'var(--grid-border)' }}>
              <a href="/" className="font-bold text-lg tracking-wider" style={{ color: 'var(--grid-accent)' }}>🔴 GRID</a>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-4 flex-1">
                <a href="/" className="text-sm hover:opacity-80" style={{ color: 'var(--grid-text-dim)' }}>Projects</a>
                <a href="/office" className="text-sm hover:opacity-80" style={{ color: 'var(--grid-text-dim)' }}>Office</a>
                <a href="/agents" className="text-sm hover:opacity-80" style={{ color: 'var(--grid-text-dim)' }}>Agents</a>
                <a href="/reports" className="text-sm hover:opacity-80" style={{ color: 'var(--grid-text-dim)' }}>Reports</a>
                <a href="/analytics" className="text-sm hover:opacity-80" style={{ color: 'var(--grid-text-dim)' }}>Analytics</a>
                <a href="/settings" className="text-sm hover:opacity-80" style={{ color: 'var(--grid-text-dim)' }}>Settings</a>
              </div>

              {/* Mobile Navigation */}
              <div className="flex-1 md:hidden" />
              <button
                className="md:hidden p-2 text-xl"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{ color: 'var(--grid-text)' }}
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>

              {/* Desktop Controls */}
              <div className="hidden md:flex items-center gap-2">
                <ThemeToggle />
                <NotificationCenter />
              </div>
            </nav>

            {/* Mobile Menu Dropdown */}
            {isMobile && mobileMenuOpen && (
              <div className="border-b bg-opacity-95" style={{ 
                borderColor: 'var(--grid-border)', 
                background: 'var(--grid-surface)' 
              }}>
                <div className="px-4 py-2 space-y-2">
                  <a href="/" className="block py-2 text-sm hover:opacity-80" style={{ color: 'var(--grid-text-dim)' }}>Projects</a>
                  <a href="/office" className="block py-2 text-sm hover:opacity-80" style={{ color: 'var(--grid-text-dim)' }}>Office</a>
                  <a href="/agents" className="block py-2 text-sm hover:opacity-80" style={{ color: 'var(--grid-text-dim)' }}>Agents</a>
                  <a href="/reports" className="block py-2 text-sm hover:opacity-80" style={{ color: 'var(--grid-text-dim)' }}>Reports</a>
                  <a href="/analytics" className="block py-2 text-sm hover:opacity-80" style={{ color: 'var(--grid-text-dim)' }}>Analytics</a>
                  <a href="/settings" className="block py-2 text-sm hover:opacity-80" style={{ color: 'var(--grid-text-dim)' }}>Settings</a>
                  <div className="flex items-center gap-2 py-2">
                    <ThemeToggle />
                    <NotificationCenter />
                  </div>
                </div>
              </div>
            )}

            <main className={`max-w-6xl mx-auto ${isMobile ? 'px-4 py-4' : 'px-6 py-8'}`}>
              {children}
            </main>
            <GlobalSearch />
          </NotificationProvider>
          </OfficeThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}