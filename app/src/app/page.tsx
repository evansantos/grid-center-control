import Link from 'next/link';
import { listProjects, taskStats } from '@/lib/queries';
import { PhaseBadge } from '@/components/phase-badge';

export const dynamic = 'force-dynamic';

export default function Home() {
  const projects = listProjects();

  if (projects.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500 text-lg">No projects yet.</p>
        <p className="text-zinc-600 text-sm mt-2">
          Create one with: <code className="text-red-400">grid project create --name &quot;...&quot; --repo &quot;...&quot;</code>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 tracking-wide">Projects</h1>
      <div className="grid gap-4">
        {projects.map((p) => {
          const stats = taskStats(p.id);
          return (
            <Link
              key={p.id}
              href={`/project/${p.id}`}
              className="block border border-zinc-800 rounded-lg p-5 hover:border-red-500 transition-colors bg-zinc-900/50"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">{p.name}</h2>
                <PhaseBadge phase={p.phase} />
              </div>
              <div className="flex gap-4 text-sm text-zinc-500">
                <span>📁 {p.repo_path}</span>
                {stats.total > 0 && (
                  <span>✅ {stats.approved}/{stats.total} tasks</span>
                )}
              </div>
              <p className="text-xs text-zinc-600 mt-2">
                Updated {new Date(p.updated_at).toLocaleString()}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
