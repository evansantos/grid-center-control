import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationProvider } from '@/components/notification-provider';
import { NotificationCenter } from '@/components/notification-center';
import { GlobalSearch } from '@/components/global-search';

export const metadata: Metadata = {
  title: 'Grid — Dev Workflow',
  description: 'MCP Development Orchestrator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <NotificationProvider>
            <nav className="border-b px-6 py-3 flex items-center gap-4" style={{ borderColor: 'var(--grid-border)' }}>
              <a href="/" className="font-bold text-lg tracking-wider" style={{ color: 'var(--grid-accent)' }}>🔴 GRID</a>
              <a href="/" className="text-sm hover:opacity-80" style={{ color: 'var(--grid-text-dim)' }}>Projects</a>
              <a href="/office" className="text-sm hover:opacity-80" style={{ color: 'var(--grid-text-dim)' }}>Office</a>
              <a href="/settings/escalation" className="text-sm hover:opacity-80" style={{ color: 'var(--grid-text-dim)' }}>Settings</a>
              <div className="flex-1" />
              <ThemeToggle />
              <NotificationCenter />
            </nav>
            <main className="max-w-6xl mx-auto px-6 py-8">
              {children}
            </main>
            <GlobalSearch />
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
