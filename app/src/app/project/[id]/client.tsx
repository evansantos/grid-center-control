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

const AGENT_NAMES: Record<string, string> = {
  arch: 'Arch', grid: 'Grid', dev: 'Dev', bug: 'Bug', vault: 'Vault',
  atlas: 'Atlas', scribe: 'Scribe', pixel: 'Pixel', sentinel: 'Sentinel', riff: 'Riff',
  sage: 'Sage', main: 'Main', po: 'PO',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'var(--grid-text-muted)',
  in_progress: 'var(--grid-accent)',
  review: 'var(--grid-yellow)',
  done: 'var(--grid-success)',
  approved: 'var(--grid-success)',
  failed: 'var(--grid-error)',
};

const STATUS_ICONS: Record<string, string> = {
  pending: '◯',
  in_progress: '▶',
  review: '◎',
  done: '✓',
};

const PHASE_STEPS = ['design', 'planning', 'development', 'review', 'complete'];
const PHASE_LABELS: Record<string, string> = {
  design: 'DESIGN',
  planning: 'PLANNING',
  development: 'DEV',
  review: 'REVIEW',
  complete: 'COMPLETE',
};

const COLUMN_ORDER = ['pending', 'in_progress', 'review', 'done'] as const;
const COLUMN_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

function parseAgentFromTitle(title: string): string | null {
  const match = title.match(/\[agent:(\w+)\]/);
  return match ? match[1] : null;
}

function timeAgo(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  if (diffMs < 0) return null;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function groupTasksByStatus(tasks: Task[]): Record<string, Task[]> {
  const grouped: Record<string, Task[]> = {};
  COLUMN_ORDER.forEach(status => {
    grouped[status] = [];
  });
  
  tasks.forEach(task => {
    const mappedStatus = task.status === 'approved' ? 'done' 
      : task.status === 'failed' ? 'in_progress' 
      : task.status;
    if (grouped[mappedStatus]) {
      grouped[mappedStatus].push(task);
    } else {
      grouped.pending.push(task);
    }
  });
  
  return grouped;
}

/* ─── Phase Indicator ─────────────────────────────────────── */
function PhaseIndicator({ phase }: { phase: string }) {
  const currentIdx = PHASE_STEPS.indexOf(phase);
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      padding: '12px 16px',
      background: 'var(--grid-surface)',
      border: '1px solid var(--grid-border)',
      borderRadius: 'var(--grid-radius-lg)',
    }}>
      <span style={{ color: 'var(--grid-text-muted)', fontSize: 11, fontFamily: 'inherit', marginRight: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Phase
      </span>
      {PHASE_STEPS.map((step, i) => {
        const isActive = i === currentIdx;
        const isDone = i < currentIdx;
        const color = isActive ? 'var(--grid-accent)' : isDone ? 'var(--grid-success)' : 'var(--grid-text-muted)';
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              padding: '4px 10px',
              borderRadius: 'var(--grid-radius)',
              fontSize: 10,
              fontWeight: isActive ? 700 : 500,
              fontFamily: 'inherit',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: color,
              background: isActive ? 'var(--grid-accent-dim)' : 'transparent',
              border: isActive ? '1px solid var(--grid-accent)' : '1px solid transparent',
              boxShadow: isActive ? '0 0 12px var(--grid-accent-dim)' : 'none',
              transition: 'all 0.2s ease',
            }}>
              {isDone ? '✓ ' : ''}{PHASE_LABELS[step] || step}
            </div>
            {i < PHASE_STEPS.length - 1 && (
              <div style={{
                width: 20,
                height: 1,
                background: isDone ? 'var(--grid-success)' : 'var(--grid-border)',
                margin: '0 2px',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Empty Column State ──────────────────────────────────── */
function EmptyColumn({ status }: { status: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      borderRadius: 'var(--grid-radius)',
      border: '1px dashed var(--grid-border)',
      background: 'var(--grid-surface)',
      opacity: 0.5,
    }}>
      <span style={{ fontSize: 20, marginBottom: 8, opacity: 0.4 }}>{STATUS_ICONS[status]}</span>
      <span style={{ fontSize: 10, color: 'var(--grid-text-muted)', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        No tasks
      </span>
    </div>
  );
}

/* ─── Task Card ───────────────────────────────────────────── */
function TaskCard({ task, status, projectId }: { task: Task; status: string; projectId: string }) {
  const agent = parseAgentFromTitle(task.title);
  const agentEmoji = agent ? AGENT_EMOJIS[agent] : null;
  const agentName = agent ? AGENT_NAMES[agent] : null;
  const elapsed = timeAgo(task.started_at);
  const cleanTitle = task.title.replace(/\[agent:\w+\]\s*/, '');
  const shortDesc = task.description
    ? task.description.length > 100
      ? task.description.slice(0, 100) + '…'
      : task.description
    : null;

  return (
    <div
      draggable
      className="kanban-card"
      style={{
        background: 'var(--grid-surface)',
        border: '1px solid var(--grid-border)',
        borderRadius: 'var(--grid-radius-lg)',
        padding: '12px 14px',
        cursor: 'grab',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--grid-border-bright)';
        e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px var(--grid-accent-dim)`;
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--grid-border)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        background: STATUS_COLORS[task.status] || STATUS_COLORS[status],
        borderRadius: '3px 0 0 3px',
      }} />

      <a
        href={`/project/${projectId}/task/${task.task_number}`}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header: agent + number + time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {agentEmoji && (
            <span style={{
              fontSize: 14,
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--grid-radius)',
              background: 'var(--grid-surface-hover)',
              border: '1px solid var(--grid-border)',
              flexShrink: 0,
            }}>
              {agentEmoji}
            </span>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontFamily: 'inherit', fontSize: 10, color: 'var(--grid-text-muted)', letterSpacing: '0.05em' }}>
              #{task.task_number}
              {agentName && <span style={{ marginLeft: 6, color: 'var(--grid-text-dim)' }}>· {agentName}</span>}
            </span>
          </div>
          {elapsed && (
            <span style={{
              marginLeft: 'auto',
              fontSize: 9,
              color: 'var(--grid-text-muted)',
              fontFamily: 'inherit',
              background: 'var(--grid-surface-hover)',
              padding: '2px 6px',
              borderRadius: 'var(--grid-radius)',
              flexShrink: 0,
            }}>
              ⏱ {elapsed}
            </span>
          )}
        </div>

        {/* Title */}
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--grid-text)',
          marginBottom: shortDesc ? 6 : 0,
          lineHeight: 1.4,
        }}>
          {cleanTitle}
        </div>

        {/* Description */}
        {shortDesc && (
          <div style={{
            fontSize: 11,
            color: 'var(--grid-text-dim)',
            lineHeight: 1.4,
            marginBottom: 8,
          }}>
            {shortDesc}
          </div>
        )}

        {/* Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          {task.status === 'failed' && (
            <span style={{
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 'var(--grid-radius)',
              background: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--grid-error)',
              fontWeight: 700,
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}>FAILED</span>
          )}
          {task.spec_review && (
            <span style={{
              fontSize: 10,
              padding: '2px 6px',
              borderRadius: 'var(--grid-radius)',
              background: task.spec_review.startsWith('PASS') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              color: task.spec_review.startsWith('PASS') ? 'var(--grid-success)' : 'var(--grid-error)',
              border: `1px solid ${task.spec_review.startsWith('PASS') ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              spec {task.spec_review.startsWith('PASS') ? '✓' : '✗'}
            </span>
          )}
          {task.quality_review && (
            <span style={{
              fontSize: 10,
              padding: '2px 6px',
              borderRadius: 'var(--grid-radius)',
              background: task.quality_review.startsWith('PASS') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              color: task.quality_review.startsWith('PASS') ? 'var(--grid-success)' : 'var(--grid-error)',
              border: `1px solid ${task.quality_review.startsWith('PASS') ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              quality {task.quality_review.startsWith('PASS') ? '✓' : '✗'}
            </span>
          )}
        </div>
      </a>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────── */
export function ProjectClient({ projectId, initialArtifacts, initialTasks, initialWorktrees, phase }: Props) {
  const [artifacts, setArtifacts] = useState(initialArtifacts);
  const [tasks, setTasks] = useState(initialTasks);
  const [connected, setConnected] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
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
  const doneCount = tasks.filter((t) => ['approved', 'done'].includes(t.status)).length;
  const progressPct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Connection status + Phase */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--grid-text-muted)' }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: connected ? 'var(--grid-success)' : 'var(--grid-error)',
            boxShadow: connected ? '0 0 6px var(--grid-success)' : '0 0 6px var(--grid-error)',
            animation: connected ? 'none' : 'pulse 2s ease-in-out infinite',
            display: 'inline-block',
          }} />
          {connected ? 'LIVE' : 'RECONNECTING…'}
        </div>

        <PhaseIndicator phase={phase} />
      </div>

      {designs.length > 0 && (
        <section>
          <h2 style={{
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 12,
            color: 'var(--grid-info)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: 'inherit',
          }}>
            📐 Designs
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {designs.map((a) => (
              <ArtifactCard key={a.id} artifact={a} projectId={projectId} onAction={() => {}} />
            ))}
          </div>
        </section>
      )}

      {plans.length > 0 && (
        <section>
          <h2 style={{
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 12,
            color: 'var(--grid-info)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: 'inherit',
          }}>
            📋 Plans
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {plans.map((a) => (
              <ArtifactCard key={a.id} artifact={a} projectId={projectId} onAction={() => {}} />
            ))}
          </div>
        </section>
      )}

      {tasks.length > 0 && (
        <section>
          {/* Section header with progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <h2 style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--grid-accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontFamily: 'inherit',
              margin: 0,
            }}>
              ⚡ Tasks
            </h2>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                flex: 1,
                height: 3,
                background: 'var(--grid-border)',
                borderRadius: 2,
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${progressPct}%`,
                  height: '100%',
                  background: progressPct === 100 ? 'var(--grid-success)' : 'var(--grid-accent)',
                  borderRadius: 2,
                  transition: 'width 0.5s ease',
                  boxShadow: `0 0 8px ${progressPct === 100 ? 'var(--grid-success)' : 'var(--grid-accent-glow)'}`,
                }} />
              </div>
              <span style={{
                fontSize: 10,
                color: 'var(--grid-text-dim)',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}>
                {doneCount}/{tasks.length} · {progressPct}%
              </span>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="kanban-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            minHeight: 400,
          }}>
            {COLUMN_ORDER.map(status => {
              const isOver = dragOver === status;
              const count = tasksByStatus[status].length;
              return (
                <div
                  key={status}
                  onDragOver={e => handleDragOver(e, status)}
                  onDragLeave={handleDragLeave}
                  onDrop={e => handleDrop(e, status)}
                  style={{
                    borderRadius: 'var(--grid-radius-lg)',
                    padding: 12,
                    background: isOver ? 'var(--grid-surface-hover)' : 'var(--grid-surface)',
                    border: `1px solid ${isOver ? (STATUS_COLORS[status] || 'var(--grid-border-bright)') : 'var(--grid-border)'}`,
                    transition: 'all 0.2s ease',
                    boxShadow: isOver ? `0 0 20px var(--grid-accent-dim), inset 0 0 20px var(--grid-accent-dim)` : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Column header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 12,
                    paddingBottom: 10,
                    borderBottom: '1px solid var(--grid-border)',
                  }}>
                    <span style={{
                      fontSize: 12,
                      color: STATUS_COLORS[status],
                      opacity: 0.8,
                    }}>{STATUS_ICONS[status]}</span>
                    <span style={{
                      fontFamily: 'inherit',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: STATUS_COLORS[status],
                    }}>
                      {COLUMN_LABELS[status]}
                    </span>
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: 10,
                      fontFamily: 'inherit',
                      color: 'var(--grid-text-muted)',
                      background: count > 0 ? 'var(--grid-surface-hover)' : 'transparent',
                      padding: count > 0 ? '2px 8px' : '2px',
                      borderRadius: 'var(--grid-radius)',
                      border: count > 0 ? '1px solid var(--grid-border)' : 'none',
                    }}>
                      {count}
                    </span>
                  </div>

                  {/* Cards or empty state */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    {count === 0 ? (
                      <EmptyColumn status={status} />
                    ) : (
                      tasksByStatus[status].map(task => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={e => handleDragStart(e, task)}
                        >
                          <TaskCard task={task} status={status} projectId={projectId} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <QuickActions />
      </section>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .kanban-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .kanban-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        .kanban-card:active {
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
}
