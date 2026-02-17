import { LogSearch } from '@/components/log-search';

export default function LogsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">🔍 Log Search</h1>
        <p className="text-sm text-zinc-500 mt-1">Search across all agent session logs</p>
      </div>
      <LogSearch />
    </div>
  );
}
