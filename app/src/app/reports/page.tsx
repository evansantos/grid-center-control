import { Metadata } from 'next';
import ReportsClient from './client';
import { PageHeader } from '@/components/ui/page-header';

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