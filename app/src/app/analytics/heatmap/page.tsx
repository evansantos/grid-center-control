import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const HeatmapClient = dynamic(
  () => import('./client'),
  { 
    loading: () => <div className="container mx-auto px-4 py-8 space-y-8">
      <Skeleton className="h-12 w-1/3" />
      <Skeleton className="h-96 w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  }
);

export const metadata: Metadata = {
  title: 'Tool Call Heatmap',
  description: 'Visualize tool usage patterns across time with an interactive heatmap',
};

export default function HeatmapPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[--grid-text] mb-2">
          Tool Call Heatmap
        </h1>
        <p className="text-[--grid-text-dim]">
          Analyze tool usage patterns across different hours of the day
        </p>
      </div>
      
      <HeatmapClient />
    </div>
  );
}