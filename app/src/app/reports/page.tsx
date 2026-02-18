import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';

const ReportsClient = dynamic(
  () => import('./client'),
  { 
    loading: () => <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  }
);

export const metadata: Metadata = {
  title: 'Reports',
  description: 'Generate and export activity reports with charts and analytics',
};

export default function ReportsPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <PageHeader
        title="📊 Reports & Analytics"
        description="Generate comprehensive activity reports with visualizations and export options"
      />
      
      <ReportsClient />
    </div>
  );
}