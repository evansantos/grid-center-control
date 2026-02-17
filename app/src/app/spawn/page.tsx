import { SpawnForm } from '@/components/spawn-form';

export default function SpawnPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-100 mb-1">🚀 Spawn Agent Session</h1>
      <p className="text-sm text-zinc-500 mb-6">Create a new agent session with a specific task</p>
      <SpawnForm />
    </div>
  );
}
