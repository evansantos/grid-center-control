import { SpawnForm } from '@/components/spawn-form';
import { PageHeader } from '@/components/ui/page-header';

export default function SpawnPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="🚀 Spawn Agent Session"
        description="Create a new agent session with a specific task"
      />
      <SpawnForm />
    </div>
  );
}
