'use client';

import { useEffect, useState, useRef } from 'react';
import { ArtifactCard } from '@/components/artifact-card';
import type { Artifact, Task, Worktree } from '@/lib/types';

interface Props {
  projectId: string;
  initialArtifacts: Artifact[];
  initialTasks: Task[];
  initialWorktrees: Worktree[];
  phase: string;
}

const TASK_STATUS_ICONS: Record<string, string> = {
  pending: '⏳',
  'in-progress': '🔄',
  in_progress: '🔄',
  done: '✅',
  review: '🔍',
  approved: '✅',
  failed: '❌',
};

export function ProjectClient({ projectId, initialArtifacts, initialTasks, initialWorktrees, phase }: Props) {
  const [artifacts, setArtifacts] = useState(initialArtifacts);
  const [tasks, setTasks] = useState(initialTasks);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Use SSE for real-time updates
    const es = new EventSource(`/api/events?projectId=${projectId}`);
    eventSourceRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'init' || data.type === 'update') {
          if (data.artifacts) setArtifacts(data.artifacts);
          if (data.tasks) setTasks(data.tasks);
        }
      } catch {}
    };

    es.onerror = () => {
      setConnected(false);
      // EventSource auto-reconnects
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [projectId]);

  const designs = artifacts.filter((a) => a.type === 'design');
  const plans = artifacts.filter((a) => a.type === 'plan');

  return (
    <div className="space-y-8">
      {/* Connection status */}
      <div className="flex items-center gap-2 text-xs text-zinc-600">
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
        {connected ? 'Live' : 'Reconnecting...'}
      </div>

      {designs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-blue-400">📐 Designs</h2>
          <div className="space-y-3">
            {designs.map((a) => (
              <ArtifactCard key={a.id} artifact={a} projectId={projectId} onAction={() => {}} />
            ))}
          </div>
        </section>
      )}

      {plans.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-blue-400">📋 Plans</h2>
          <div className="space-y-3">
            {plans.map((a) => (
              <ArtifactCard key={a.id} artifact={a} projectId={projectId} onAction={() => {}} />
            ))}
          </div>
        </section>
      )}

      {tasks.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-blue-400">⚡ Tasks</h2>
          <div className="space-y-2">
            {tasks.map((t) => (
              <a
                key={t.id}
                href={`/project/${projectId}/task/${t.task_number}`}
                className="flex items-center gap-3 p-3 border border-zinc-800 rounded-lg bg-zinc-900/50 hover:border-red-500 transition-colors"
              >
                <span className="text-lg">{TASK_STATUS_ICONS[t.status] ?? '❓'}</span>
                <span className="font-mono text-sm text-zinc-500">#{t.task_number}</span>
                <span className="flex-1 font-semibold">{t.title}</span>
                <span className="text-xs font-mono text-zinc-500">{t.status}</span>
                {t.spec_review && (
                  <span className={`text-xs ${t.spec_review.startsWith('PASS') ? 'text-green-400' : 'text-red-400'}`}>
                    spec:{t.spec_review.startsWith('PASS') ? '✓' : '✗'}
                  </span>
                )}
                {t.quality_review && (
                  <span className={`text-xs ${t.quality_review.startsWith('PASS') ? 'text-green-400' : 'text-red-400'}`}>
                    quality:{t.quality_review.startsWith('PASS') ? '✓' : '✗'}
                  </span>
                )}
              </a>
            ))}
          </div>
          <div className="mt-2 text-sm text-zinc-500">
            {tasks.filter((t) => ['approved', 'done'].includes(t.status)).length}/{tasks.length} complete
          </div>
        </section>
      )}
    </div>
  );
}
