import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { NotificationProvider } from '@/components/notification-provider';
import { GlobalSearch } from '@/components/global-search';
import { NavBar } from '@/components/nav-bar';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Grid — Dev Workflow',
  description: 'MCP Development Orchestrator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={jetbrainsMono.variable}>
      <body className="min-h-screen antialiased" style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}>
        <ThemeProvider>
          <NotificationProvider>
            {/* Top accent glow */}
            <div
              className="fixed top-0 left-0 right-0 h-[2px] z-50"
              style={{
                background: `linear-gradient(90deg, transparent 0%, var(--grid-accent) 50%, transparent 100%)`,
                opacity: 0.6,
              }}
            />
            <div
              className="fixed top-0 left-0 right-0 h-16 z-40 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at 50% 0%, var(--grid-accent-glow) 0%, transparent 70%)`,
              }}
            />

            <NavBar />

            <main className="max-w-7xl mx-auto px-6 py-8">
              {children}
            </main>

            <GlobalSearch />
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
