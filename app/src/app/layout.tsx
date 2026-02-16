import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Grid — Dev Workflow',
  description: 'MCP Development Orchestrator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <nav className="border-b border-zinc-800 px-6 py-3 flex items-center gap-4">
          <a href="/" className="text-red-500 font-bold text-lg tracking-wider">🔴 GRID</a>
          <a href="/" className="text-sm text-zinc-500 hover:text-zinc-300">Projects</a>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
