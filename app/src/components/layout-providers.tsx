'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { NotificationProvider } from '@/components/notification-provider';
import { NavBar } from '@/components/nav-bar';
import { GlobalSearch } from '@/components/global-search';
import { useIsMobile } from '@/lib/useMediaQuery';

export function Providers({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <ThemeProvider>
      <NotificationProvider>
        <NavBar />
        <main className={`max-w-6xl mx-auto ${isMobile ? 'px-4 py-4' : 'px-6 py-8'}`}>
          {children}
        </main>
        <GlobalSearch />
      </NotificationProvider>
    </ThemeProvider>
  );
}
