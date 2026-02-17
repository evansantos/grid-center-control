import { Metadata } from 'next';
import CronClient from './client';

export const metadata: Metadata = {
  title: 'Cron Job Manager - Grid Dashboard',
  description: 'Manage scheduled cron jobs',
};

export default function CronPage() {
  return (
    <div className="min-h-screen bg-[var(--grid-bg)] text-[var(--grid-text)]">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-[var(--grid-text)] mb-2">
            Cron Job Manager
          </h1>
          <p className="text-[var(--grid-text-dim)] font-mono">
            Schedule and manage automated tasks
          </p>
        </div>
        
        <CronClient />
      </div>
    </div>
  );
}