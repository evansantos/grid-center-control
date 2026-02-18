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
  arch: '🏛️', grid: '⚡', dev: '💻', bug: '🐛', vault: '🔐',
  atlas: '🗺️', scribe: '📝', pixel: '🎨', sentinel: '🛡️', riff: '🎵',
  sage: '🧙', spec: '📋', main: '🔴', mcp: '🔴', po: '📋',
};

const AGENT_NAMES: Record<string, string> = {
  arch: 'Arch', grid: 'Grid', dev: 'Dev', bug: 'Bug', vault: 'Vault',
  atlas: 'Atlas', scribe: 'Scribe', pixel: 'Pixel', sentinel: 'Sentinel', riff: 'Riff',
  sage: 'Sage', spec: 'Spec', main: 'MCP', mcp: 'MCP', po: 'PO',
};

const AGENT_COLORS: Record<string, string> = {
  arch: '#a78bfa', grid: '#f87171', dev: '#34d399', bug: '#fbbf24', vault: '#60a5fa',
  atlas: '#2dd4bf', scribe: '#fb923c', pixel: '#f472b6', sentinel: '#818cf8', riff: '#e879f9',
  sage: '#a3e635', spec: '#facc15', main: '#f87171', mcp: '#f87171', po: '#facc15',
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  P0: { label: 'P0', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  P1: { label: 'P1', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  P2: { label: 'P2', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  P3: { label: 'P3', color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' },
};

const PHASE_STEPS = ['brainstorm', 'design', 'plan', 'execute', 'review', 'done'] as const;
const PHASE_LABELS: Record<string, string> = {
  brainstorm: 'Brainstorm',
  design: 'Design',
  plan: 'Plan',
  execute: 'Execute',
  review: 'Review',
  done: 'Done',
};

const COLUMN_ORDER = ['pending', 'in_progress', 'review', 'done'] as const;
const COLUMN_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

const COLUMN_ICONS: Record<string, string> = {
  pending: '○',
  in_progress: '◑',
  review: '◉',
  done: '●',
};

function parseAgentFromTitle(title: string): string | null {
  const match = title.match(/\[agent:(\w+)\]/);
  return match ? match[1] : null;
}

function parseMetaFromDescription(desc: string | null): { agent: string | null; priority: string | null; cleanDesc: string | null } {
  if (!desc) return { agent: null, priority: null, cleanDesc: null };
  let agent: string | null = null;
  let priority: string | null = null;
  
  // Extract **Agent:** value
  const agentMatch = desc.match(/\*\*Agent:\*\*\s*(\w+)/);
  if (agentMatch) agent = agentMatch[1].toLowerCase();
  
  // Extract **Priority:** value
  const prioMatch = desc.match(/\*\*Priority:\*\*\s*(P\d)/);
  if (prioMatch) priority = prioMatch[1];
  
  // Clean description: remove metadata lines, keep actual content
  const lines = desc.split('\n')
    .filter(l => !l.match(/^\*\*Agent:\*\*/) && !l.match(/^\*\*Priority:\*\*/) && !l.match(/^\*\*Files:\*\*/))
    .map(l => l.replace(/^\*\*Agent:\*\*.*?\|?\s*/, '').replace(/\*\*Priority:\*\*.*?\|?\s*/, '').replace(/\*\*Files:\*\*.*$/, ''))
    .map(l => l.replace(/^[-*]\s*/, '').trim())
    .filter(l => l.length > 0);
  
  const cleanDesc = lines.length > 0 ? lines.join(' · ') : null;
  return { agent, priority, cleanDesc };
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
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function groupTasksByStatus(tasks: Task[]): Record<string, Task[]> {
  const grouped: Record<string, Task[]> = {};
  COLUMN_ORDER.forEach(status => { grouped[status] = []; });
  tasks.forEach(task => {
    const mapped = task.status === 'approved' ? 'done'
      : task.status === 'failed' ? 'in_progress'
      : task.status;
    if (grouped[mapped]) grouped[mapped].push(task);
    else grouped.pending.push(task);
  });
  return grouped;
}

/* ─── Phase Stepper ───────────────────────────────────────── */
function PhaseIndicator({ phase }: { phase: string }) {
  const currentIdx = PHASE_STEPS.indexOf(phase as typeof PHASE_STEPS[number]);

  return (
    <div className="flex items-center gap-0">
      {PHASE_STEPS.map((step, i) => {
        const isDone = i < currentIdx;
        const isActive = i === currentIdx;
        const isFuture = i > currentIdx;

        return (
          <div key={step} className="flex items-center">
            {/* Step */}
            <div className="flex flex-col items-center gap-1.5">
              {/* Circle */}
              <div
                className={`
                  flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all duration-300
                  ${isDone ? 'bg-[var(--grid-success)]/15 text-[var(--grid-success)] ring-1 ring-[var(--grid-success)]/30' : ''}
                  ${isActive ? 'bg-[var(--grid-accent)]/15 text-[var(--grid-accent)] ring-2 ring-[var(--grid-accent)]/40' : ''}
                  ${isFuture ? 'bg-[var(--grid-surface-hover)] text-[var(--grid-text-muted)] ring-1 ring-[var(--grid-border)]' : ''}
                `}
              >
                {isDone ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-[10px]">{i + 1}</span>
                )}
              </div>
              {/* Label */}
              <span
                className={`
                  text-[10px] tracking-wide font-medium transition-colors
                  ${isDone ? 'text-[var(--grid-success)]/70' : ''}
                  ${isActive ? 'text-[var(--grid-accent)]' : ''}
                  ${isFuture ? 'text-[var(--grid-text-muted)]' : ''}
                `}
              >
                {PHASE_LABELS[step]}
              </span>
            </div>

            {/* Connector line */}
            {i < PHASE_STEPS.length - 1 && (
              <div
                className={`
                  w-8 h-px mx-1 mt-[-18px] transition-colors duration-300
                  ${i < currentIdx ? 'bg-[var(--grid-success)]/40' : 'bg-[var(--grid-border)]'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Task Card ───────────────────────────────────────────── */
function TaskCard({ task, projectId }: { task: Task; projectId: string }) {
  const agentFromTitle = parseAgentFromTitle(task.title);
  const meta = parseMetaFromDescription(task.description);
  const agent = agentFromTitle || meta.agent;
  const agentEmoji = agent ? AGENT_EMOJIS[agent] : null;
  const agentName = agent ? AGENT_NAMES[agent] : null;
  const agentColor = agent ? AGENT_COLORS[agent] : undefined;
  const priority = meta.priority;
  const prioConfig = priority ? PRIORITY_CONFIG[priority] : null;
  const elapsed = timeAgo(task.started_at);
  const cleanTitle = task.title.replace(/\[agent:\w+\]\s*/, '');
  const cleanDesc = meta.cleanDesc
    ? meta.cleanDesc.length > 100
      ? meta.cleanDesc.slice(0, 100) + '…'
      : meta.cleanDesc
    : null;

  const hasReviews = task.spec_review || task.quality_review;
  const isActive = task.status === 'in_progress';

  return (
    <a
      href={`/project/${projectId}/task/${task.task_number}`}
      draggable={false}
      onClick={e => e.stopPropagation()}
      className="
        block rounded-lg transition-all duration-200 overflow-hidden
        bg-[var(--grid-surface)] border border-[var(--grid-border)]
        hover:border-[var(--grid-border-bright)] hover:bg-[var(--grid-surface-hover)]
        hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5
        group cursor-pointer relative
      "
    >
      {/* Left accent bar */}
      {agentColor && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
          style={{ backgroundColor: agentColor }}
        />
      )}

      <div className="p-3 pl-3.5">
        {/* Top row: number + priority + time */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-mono text-[var(--grid-text-muted)] opacity-60">
            #{task.task_number}
          </span>
          {prioConfig && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-wide"
              style={{ color: prioConfig.color, backgroundColor: prioConfig.bg }}
            >
              {prioConfig.label}
            </span>
          )}
          {isActive && (
            <span className="flex items-center gap-1 text-[9px] font-medium text-[var(--grid-accent)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--grid-accent)] animate-pulse" />
              Running
            </span>
          )}
          {elapsed && (
            <span className="ml-auto text-[10px] text-[var(--grid-text-muted)] tabular-nums opacity-60">
              {elapsed}
            </span>
          )}
        </div>

        {/* Title */}
        <p className="text-[13px] font-medium text-[var(--grid-text)] leading-snug mb-0 group-hover:text-white transition-colors">
          {cleanTitle}
        </p>

        {/* Clean description */}
        {cleanDesc && (
          <p className="text-[11px] text-[var(--grid-text-muted)] leading-relaxed mt-1.5 line-clamp-2">
            {cleanDesc}
          </p>
        )}

        {/* Footer: agent badge + review badges */}
        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
          {agentEmoji && agentName && (
            <span
              className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-sm"
              style={{
                color: agentColor || 'var(--grid-text-muted)',
                backgroundColor: agentColor ? `${agentColor}15` : 'var(--grid-surface-hover)',
              }}
            >
              <span className="text-[10px]">{agentEmoji}</span>
              {agentName}
            </span>
          )}
          
          {task.status === 'failed' && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-sm bg-[var(--grid-error)]/10 text-[var(--grid-error)]">
              FAILED
            </span>
          )}
          {task.spec_review && (
            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-sm ${
              task.spec_review.startsWith('PASS')
                ? 'bg-[var(--grid-success)]/10 text-[var(--grid-success)]'
                : 'bg-[var(--grid-error)]/10 text-[var(--grid-error)]'
            }`}>
              spec {task.spec_review.startsWith('PASS') ? '✓' : '✗'}
            </span>
          )}
          {task.quality_review && (
            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-sm ${
              task.quality_review.startsWith('PASS')
                ? 'bg-[var(--grid-success)]/10 text-[var(--grid-success)]'
                : 'bg-[var(--grid-error)]/10 text-[var(--grid-error)]'
            }`}>
              quality {task.quality_review.startsWith('PASS') ? '✓' : '✗'}
            </span>
          )}
        </div>
      </div>
    </a>
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
    es.onerror = () => setConnected(false);
    return () => { es.close(); eventSourceRef.current = null; };
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
      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, status: targetStatus as Task['status'] } : task
      ));
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
  const activeCount = tasks.filter((t) => ['in_progress', 'review'].includes(t.status)).length;
  const progressCount = doneCount + activeCount;
  const progressPct = tasks.length > 0 ? Math.round((progressCount / tasks.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-10">

      {/* ── Header: Connection + Phase ── */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 text-[11px] text-[var(--grid-text-muted)]">
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[var(--grid-success)]' : 'bg-[var(--grid-error)] animate-pulse'}`} />
          {connected ? 'Live' : 'Reconnecting…'}
        </div>
        <PhaseIndicator phase={phase} />
      </div>

      {/* ── Designs ── */}
      {designs.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-[var(--grid-text-muted)] uppercase tracking-widest">
            Designs
          </h2>
          <div className="flex flex-col gap-3">
            {designs.map((a) => (
              <ArtifactCard key={a.id} artifact={a} projectId={projectId} onAction={() => {}} />
            ))}
          </div>
        </section>
      )}

      {/* ── Plans ── */}
      {plans.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-[var(--grid-text-muted)] uppercase tracking-widest">
            Plans
          </h2>
          <div className="flex flex-col gap-3">
            {plans.map((a) => (
              <ArtifactCard key={a.id} artifact={a} projectId={projectId} onAction={() => {}} />
            ))}
          </div>
        </section>
      )}

      {/* ── Tasks ── */}
      {tasks.length > 0 && (
        <section className="flex flex-col gap-5">
          {/* Section header with progress */}
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-semibold text-[var(--grid-text)] uppercase tracking-widest m-0">
              Tasks
            </h2>
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 h-[3px] bg-[var(--grid-border)] rounded-full overflow-hidden flex">
                {doneCount > 0 && (
                  <div
                    className="h-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.round((doneCount / tasks.length) * 100)}%`,
                      backgroundColor: progressCount === tasks.length ? 'var(--grid-success)' : 'var(--grid-success)',
                    }}
                  />
                )}
                {activeCount > 0 && (
                  <div
                    className="h-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.round((activeCount / tasks.length) * 100)}%`,
                      backgroundColor: 'var(--grid-accent)',
                    }}
                  />
                )}
              </div>
              <span className="text-[10px] text-[var(--grid-text-muted)] tabular-nums whitespace-nowrap">
                {progressCount}/{tasks.length}
              </span>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="kanban-grid grid grid-cols-4 gap-4 min-h-[400px]">
            {COLUMN_ORDER.map(status => {
              const isOver = dragOver === status;
              const count = tasksByStatus[status].length;
              return (
                <div
                  key={status}
                  onDragOver={e => handleDragOver(e, status)}
                  onDragLeave={handleDragLeave}
                  onDrop={e => handleDrop(e, status)}
                  className={`
                    rounded-xl p-3 flex flex-col transition-all duration-150
                    ${isOver
                      ? 'bg-[var(--grid-surface-hover)] border border-[var(--grid-accent)]/30'
                      : 'bg-transparent border border-transparent'
                    }
                  `}
                >
                  {/* Column header */}
                  <div className="flex items-center gap-2 mb-3 pb-0">
                    <span className="text-[11px] text-[var(--grid-text-muted)]">
                      {COLUMN_ICONS[status]}
                    </span>
                    <span className="text-[11px] font-medium text-[var(--grid-text-dim)] tracking-wide">
                      {COLUMN_LABELS[status]}
                    </span>
                    {count > 0 && (
                      <span className="text-[10px] text-[var(--grid-text-muted)] tabular-nums ml-auto">
                        {count}
                      </span>
                    )}
                  </div>

                  {/* Cards */}
                  <div className="flex flex-col gap-2 flex-1">
                    {count === 0 ? (
                      <div className="flex-1 flex items-center justify-center min-h-[80px] rounded-lg border border-dashed border-[var(--grid-border)] opacity-40">
                        <span className="text-[10px] text-[var(--grid-text-muted)]">No tasks</span>
                      </div>
                    ) : (
                      tasksByStatus[status].map(task => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={e => handleDragStart(e, task)}
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <TaskCard task={task} projectId={projectId} />
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

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          .kanban-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .kanban-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
