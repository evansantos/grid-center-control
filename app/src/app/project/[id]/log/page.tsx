import { notFound } from 'next/navigation';
export const dynamic = 'force-dynamic';
import { getProject, listEvents } from '@/lib/queries';
import Link from 'next/link';


const EVENT_ICONS: Record<string, string> = {
  phase_change: '🔄',
  approval: '✅',
  task_update: '⚡',
  review: '🔍',
};

export default async function LogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const events = listEvents(id, 100);

  return (
    <div>
      <Link href={`/project/${id}`} className="text-sm text-red-400 hover:underline mb-4 inline-block">
        ← Back to {project.name}
      </Link>

      <h1 className="text-2xl font-bold mb-6">📜 Event Log</h1>

      <div className="space-y-2">
        {events.map((e) => {
          let details: Record<string, unknown> = {};
          try { details = JSON.parse(e.details ?? '{}'); } catch {}

          return (
            <div key={e.id} className="flex items-start gap-3 p-3 border border-zinc-800 rounded bg-zinc-900/50">
              <span className="text-lg">{EVENT_ICONS[e.event_type] ?? '📌'}</span>
              <div className="flex-1">
                <span className="font-mono text-sm">{e.event_type}</span>
                <pre className="text-xs text-zinc-500 mt-1 overflow-x-auto">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
              <span className="text-xs text-zinc-600 whitespace-nowrap">
                {new Date(e.created_at).toLocaleTimeString()}
              </span>
            </div>
          );
        })}

        {events.length === 0 && (
          <p className="text-zinc-500 text-center py-10">No events yet.</p>
        )}
      </div>
    </div>
  );
}
