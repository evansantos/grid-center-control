import { SessionHeatmap } from '@/components/session-heatmap';

export default function SessionAnalyticsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-100 mb-1">📅 Session Analytics</h1>
      <p className="text-sm text-zinc-500 mb-6">Activity heatmap and session statistics</p>
      <SessionHeatmap />
    </div>
  );
}
