'use client';

import { useEffect, useState, useRef, useCallback, DragEvent } from 'react';
import { ArtifactCard } from '@/components/artifact-card';
import { QuickActions } from '@/components/quick-actions';
import type { Artifact, Task, Worktree } from '@/lib/types';

interface Props {
  projectId: string;
  initialArtifacts: Artifact[];
  initialTasks: Task[];
  initialWorktrees: Worktree[];
  phase: string;
}

const AGENT_EMOJIS: Record<string, string> = {
  arch: '🏛️', grid: '🔴', dev: '💻', bug: '🐛', vault: '🔐',
  atlas: '🗺️', scribe: '📝', pixel: '🎨', sentinel: '🛡️', riff: '🎵',
  sage: '🧙', main: '👤', po: '📋',
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#6b7280',
  in_progress: 'var(--grid-accent, #ef4444)',
  review: '#eab308',
  done: '#22c55e',
  approved: '#4ade80',
  failed: '#ef4444',
};

const COLUMN_ORDER = ['pending', 'in_progress', 'review', 'done', 'approved', 'failed'] as const;
const COLUMN_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
  approved: 'Approved',
  failed: 'Failed',
};

function parseAgentFromTitle(title: string): string | null {
  const match = title.match(/\[agent:(\w+)\]/);
  return match ? match[1] : null;
}

function groupTasksByStatus(tasks: Task[]): Record<string, Task[]> {
  const grouped: Record<string, Task[]> = {};
  COLUMN_ORDER.forEach(status => {
    grouped[status] = [];
  });
  
  tasks.forEach(task => {
    if (grouped[task.status]) {
      grouped[task.status].push(task);
    } else {
      // Fallback for unknown status
      grouped.pending.push(task);
    }
  });
  
  return grouped;
}

export function ProjectClient({ projectId, initialArtifacts, initialTasks, initialWorktrees, phase }: Props) {
  const [artifacts, setArtifacts] = useState(initialArtifacts);
  const [tasks, setTasks] = useState(initialTasks);
  const [connected, setConnected] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);
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

  const handleDragStart = useCallback((e: DragEvent, task: Task) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ taskId: task.id, from: task.status }));
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: DragEvent, targetStatus: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(targetStatus);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(null), []);

  const handleDrop = useCallback((e: DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDragOver(null);
    try {
      const { taskId, from } = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (from === targetStatus) return;

      // Optimistic update
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, status: targetStatus as any } : task
        )
      );

      fetch('/api/kanban/move', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: targetStatus }),
      }).catch(err => console.error('[kanban] move error', err));
    } catch (err) {
      console.error('[kanban] drop parse error', err);
    }
  }, []);

  const designs = artifacts.filter((a) => a.type === 'design');
  const plans = artifacts.filter((a) => a.type === 'plan');
  const tasksByStatus = groupTasksByStatus(tasks);

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
          <h2 className="text-lg font-semibold mb-4 text-blue-400">⚡ Tasks</h2>
          <div className="grid grid-cols-6 gap-4 min-h-[400px]">
            {COLUMN_ORDER.map(status => (
              <div
                key={status}
                onDragOver={e => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, status)}
                className="rounded-lg p-3 transition-all duration-150"
                style={{
                  backgroundColor: dragOver === status ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: dragOver === status ? STATUS_COLORS[status] : 'rgba(255,255,255,0.1)',
                }}
              >
                <div
                  className="flex items-center gap-2 mb-3 font-mono text-xs font-semibold uppercase tracking-wider"
                  style={{ color: STATUS_COLORS[status] }}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[status] }}
                  />
                  {COLUMN_LABELS[status]}
                  <span className="ml-auto opacity-50">{tasksByStatus[status].length}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {tasksByStatus[status].map(task => {
                    const agent = parseAgentFromTitle(task.title);
                    const agentEmoji = agent ? AGENT_EMOJIS[agent] : null;
                    
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={e => handleDragStart(e, task)}
                        className="bg-zinc-900/80 border border-zinc-700 rounded-lg px-3 py-2.5 cursor-grab transition-all duration-150 hover:border-zinc-600"
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = STATUS_COLORS[status];
                          e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'rgb(63 63 70)';
                          e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.8)';
                        }}
                      >
                        <a
                          href={`/project/${projectId}/task/${task.task_number}`}
                          className="block text-decoration-none"
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {agentEmoji && (
                              <span className="text-sm">{agentEmoji}</span>
                            )}
                            <span className="font-mono text-xs text-zinc-500">#{task.task_number}</span>
                          </div>
                          <div className="text-sm font-semibold text-white mb-2 line-clamp-2">
                            {task.title}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {task.spec_review && (
                              <span className={`text-xs px-1 py-0.5 rounded ${task.spec_review.startsWith('PASS') ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                                spec:{task.spec_review.startsWith('PASS') ? '✓' : '✗'}
                              </span>
                            )}
                            {task.quality_review && (
                              <span className={`text-xs px-1 py-0.5 rounded ${task.quality_review.startsWith('PASS') ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                                quality:{task.quality_review.startsWith('PASS') ? '✓' : '✗'}
                              </span>
                            )}
                          </div>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-zinc-500">
            {tasks.filter((t) => ['approved', 'done'].includes(t.status)).length}/{tasks.length} complete
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <QuickActions />
      </section>
    </div>
  );
}
