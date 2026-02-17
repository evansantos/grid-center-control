import { Metadata } from 'next';
import ReportsClient from './client';

export const metadata: Metadata = {
  title: 'Reports',
  description: 'Generate and export activity reports with charts and analytics',
};

export default function ReportsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[--grid-text] mb-2">
          Reports
        </h1>
        <p className="text-[--grid-text-dim]">
          Generate comprehensive activity reports with visualizations and export options
        </p>
      </div>
      
      <ReportsClient />
    </div>
  );
}