import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Performance Analytics',
  description: 'Monitor agent performance metrics and system health',
};

const PerformanceClient = dynamic(
  () => import('./client'),
  { 
    loading: () => <div className="container mx-auto px-4 py-8 space-y-8">
      <Skeleton className="h-12 w-1/2" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  }
);

export default function PerformancePage() {
  return <PerformanceClient />;
}