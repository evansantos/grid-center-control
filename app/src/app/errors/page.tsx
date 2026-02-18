import { ErrorDashboard } from '@/components/error-dashboard';
import Link from 'next/link';

export const metadata = {
  title: 'Error Dashboard - Grid System Monitor',
  description: 'Real-time error monitoring and analysis for the Grid Dashboard system. Track, analyze, and resolve issues across all AI agents and components.',
};

export default function ErrorsPage() {
  return (
    <div className="bg-grid-bg min-h-screen font-mono">
      {/* Page header with breadcrumb */}
      <div className="sticky top-0 z-10 border-b border-grid-border bg-grid-surface px-5 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link 
            href="/" 
            className="text-grid-text-muted hover:text-grid-text text-xs flex items-center gap-1 transition-colors"
          >
            🏠 Dashboard
          </Link>
          <span className="text-grid-text-muted text-xs">→</span>
          <span className="text-grid-text text-xs font-bold">
            Error Monitoring
          </span>
        </div>
      </div>
      
      <ErrorDashboard />
    </div>
  );
}
