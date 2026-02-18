'use client';

import { lazy, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// Lazy load the heavy PixelHQ component
const PixelHQLazy = lazy(() => import('./pixel-hq').then(({ PixelHQ }) => ({ default: PixelHQ })));

// Loading skeleton component
function PixelHQSkeleton() {
  return (
    <Card className="w-full h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <CardContent className="p-6 h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading office visualization...</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Wrapper component with suspense boundary
export default function PixelHQWrapper() {
  return (
    <Suspense fallback={<PixelHQSkeleton />}>
      <PixelHQLazy />
    </Suspense>
  );
}

// Export for dynamic imports
export { PixelHQLazy };