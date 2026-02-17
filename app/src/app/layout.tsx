import type { Metadata } from 'next';
import './globals.css';
import { NavBar } from '@/components/nav-bar';
import { CommandPalette } from '@/components/command-palette';
import { ToastProvider } from '@/components/toast-provider';
import { KeyboardNavProvider } from '@/components/keyboard-nav-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { NotificationProvider } from '@/components/notification-provider';
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
            <ToastProvider>
              <KeyboardNavProvider>
                <NavBar />
                <CommandPalette />
                <GlobalSearch />
                <main className="max-w-6xl mx-auto px-6 py-8">
                  {children}
                </main>
              </KeyboardNavProvider>
            </ToastProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
