import { ErrorDashboard } from '@/components/error-dashboard';

export default function ErrorsPage() {
  return (
    <div style={{
      backgroundColor: '#0f172a',
      minHeight: '100vh',
    }}>
      <ErrorDashboard />
    </div>
  );
}