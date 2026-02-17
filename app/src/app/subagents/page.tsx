import { SubagentTree } from '@/components/subagent-tree';

export default function SubagentsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-100 mb-1">🌳 Sub-Agent Tree</h1>
      <p className="text-sm text-zinc-500 mb-6">View, steer, and manage active sub-agents</p>
      <SubagentTree />
    </div>
  );
}
