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
        {/* Skip Navigation Link for Accessibility */}
        <a 
          href="#main" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-grid-accent focus:text-white focus:text-sm focus:font-medium focus:border-b-2 focus:border-grid-accent-dark"
        >
          Skip to main content
        </a>
        <Providers>
          <main id="main" className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
