'use client';

import { lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch } from 'lucide-react';

// Lazy load the heavy SubagentTree component
const SubagentTreeLazy = lazy(() => import('./subagent-tree').then(({ SubagentTree }) => ({ default: SubagentTree })));

// Loading skeleton component
function SubagentTreeSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <GitBranch className="h-5 w-5" />
          <span>Sub-agent Tree</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tree structure skeleton */}
        <div className="space-y-3">
          {/* Root node */}
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>

          {/* Child nodes */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="ml-6 flex items-center space-x-2 p-3 border rounded-lg">
              <div className="h-px w-4 bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ))}

          {/* Nested children */}
          {[...Array(2)].map((_, i) => (
            <div key={i} className="ml-12 flex items-center space-x-2 p-3 border rounded-lg">
              <div className="h-px w-4 bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-1"></div>
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Wrapper component with suspense boundary
export default function SubagentTreeWrapper() {
  return (
    <Suspense fallback={<SubagentTreeSkeleton />}>
      <SubagentTreeLazy />
    </Suspense>
  );
}

// Export for dynamic imports
export { SubagentTreeLazy };