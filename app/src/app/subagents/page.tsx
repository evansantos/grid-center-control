import { SubagentTree } from '@/components/subagent-tree';
import { PageHeader } from '@/components/ui/page-header';

export default function SubagentsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="🌳 Agent Hierarchy"
        description="View, steer, and manage the hierarchical tree of agents and their subagents"
      />
      <SubagentTree />
    </div>
  );
}
