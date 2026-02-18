import { ErrorDashboard } from '@/components/error-dashboard';

export const metadata = {
  title: 'Error Dashboard - Grid System Monitor',
  description: 'Real-time error monitoring and analysis for the Grid Dashboard system. Track, analyze, and resolve issues across all AI agents and components.',
};

export default function ErrorsPage() {
  return (
    <div style={{ 
      backgroundColor: 'var(--grid-bg)', 
      minHeight: '100vh',
      fontFamily: 'monospace' 
    }}>
      {/* Page header with breadcrumb */}
      <div style={{
        borderBottom: '1px solid var(--grid-border)',
        backgroundColor: 'var(--grid-surface)',
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <a 
            href="/" 
            style={{ 
              color: 'var(--grid-text-secondary)', 
              textDecoration: 'none', 
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            🏠 Dashboard
          </a>
          <span style={{ color: 'var(--grid-text-secondary)', fontSize: 12 }}>→</span>
          <span style={{ color: 'var(--grid-text)', fontSize: 12, fontWeight: 'bold' }}>
            Error Monitoring
          </span>
        </div>
      </div>
      
      <ErrorDashboard />
    </div>
  );
}
