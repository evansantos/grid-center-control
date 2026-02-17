import { Metadata } from 'next';
import SnapshotsClient from './client';

export const metadata: Metadata = {
  title: 'Dashboard Snapshots',
  description: 'Scheduled dashboard snapshots with history and evolution tracking',
};

export default function SnapshotsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[--grid-text] mb-2">
          Dashboard Snapshots
        </h1>
        <p className="text-[--grid-text-dim]">
          Schedule automatic snapshots, view history, and track metric evolution over time
        </p>
      </div>

      <SnapshotsClient />
    </div>
  );
}
