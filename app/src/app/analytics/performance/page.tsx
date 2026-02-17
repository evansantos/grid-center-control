import { AgentScorecards } from '@/components/agent-scorecards';

export default function PerformancePage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-100 mb-1">📊 Agent Performance</h1>
      <p className="text-sm text-zinc-500 mb-6">Scorecards for all agents with health indicators</p>
      <AgentScorecards />
    </div>
  );
}
