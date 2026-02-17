import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout-providers';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GRID — Mission Control',
  description: 'MCP Development Orchestrator — Mission Control Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jetbrainsMono.variable} suppressHydrationWarning>
      <body className="min-h-screen antialiased" style={{ fontFamily: 'var(--font-mono), ui-monospace, monospace' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
