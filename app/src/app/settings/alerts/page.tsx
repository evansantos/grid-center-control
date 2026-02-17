import { Metadata } from 'next';
import AlertsClient from './client';

export const metadata: Metadata = {
  title: 'Alert Settings - Grid Dashboard',
  description: 'Configure trend alerts and anomaly detection',
};

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-[var(--grid-bg)] text-[var(--grid-text)]">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-[var(--grid-text)] mb-2">
            Trend Alerts & Anomaly Detection
          </h1>
          <p className="text-[var(--grid-text-dim)] font-mono">
            Configure alert thresholds and monitor system anomalies
          </p>
        </div>
        
        <AlertsClient />
      </div>
    </div>
  );
}