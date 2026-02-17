import { Metadata } from 'next';
import BudgetsClient from './client';

export const metadata: Metadata = {
  title: 'Cost Budgets & Alerts - Grid Dashboard',
  description: 'Set daily/weekly budgets per agent or global with alerts and auto-pause',
};

export default function BudgetsPage() {
  return (
    <div className="min-h-screen bg-[var(--grid-bg)] text-[var(--grid-text)]">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-[var(--grid-text)] mb-2">
            Cost Budgets & Alerts
          </h1>
          <p className="text-[var(--grid-text-dim)] font-mono">
            Set spending limits, receive alerts, and auto-pause agents when budgets are exceeded
          </p>
        </div>

        <BudgetsClient />
      </div>
    </div>
  );
}
