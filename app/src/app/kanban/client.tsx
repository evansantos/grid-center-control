'use client';

import { useEffect, useState, useCallback, DragEvent } from 'react';

interface Task {
  id: string;
  title: string;
  agent: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: string;
}

interface Columns {
  pending: Task[];
  in_progress: Task[];
  review: Task[];
  done: Task[];
}

const COLUMN_META: { key: keyof Columns; label: string; accent: string }[] = [
  { key: 'pending', label: 'Pending', accent: 'var(--grid-text-muted)' },
  { key: 'in_progress', label: 'In Progress', accent: 'var(--grid-accent)' },
  { key: 'review', label: 'Review', accent: '#e5a00d' },
  { key: 'done', label: 'Done', accent: '#22c55e' },
];

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#6b7280',
};

const AGENT_COLORS: Record<string, string> = {
  GRID: '#3b82f6',
  ATLAS: '#8b5cf6',
  DEV: '#10b981',
  PIXEL: '#f59e0b',
  BUG: '#ef4444',
  SENTINEL: '#6366f1',
};

function getAgentInfo(agent: string): { name: string; color: string; initial: string } | null {
  if (!agent) return null;
  const upper = agent.toUpperCase();
  for (const [key, color] of Object.entries(AGENT_COLORS)) {
    if (upper.includes(key)) return { name: key, color, initial: key[0] };
  }
  return { name: agent, color: 'var(--grid-text-muted)', initial: agent[0]?.toUpperCase() ?? '?' };
}

export function KanbanBoard() {
  const [columns, setColumns] = useState<Columns>({ pending: [], in_progress: [], review: [], done: [] });
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/kanban')
      .then(r => r.json())
      .then(data => setColumns(data.columns ?? { pending: [], in_progress: [], review: [], done: [] }))
      .catch(err => console.error('[kanban] fetch error', err))
      .finally(() => setLoading(false));
  }, []);

  const handleDragStart = useCallback((e: DragEvent, task: Task) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ taskId: task.id, from: task.status }));
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: DragEvent, colKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(colKey);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(null), []);

  const handleDrop = useCallback((e: DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDragOver(null);
    try {
      const { taskId, from } = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (from === targetStatus) return;

      // Optimistic update
      setColumns(prev => {
        const next = { ...prev } as Record<string, Task[]>;
        const fromCol = [...(next[from] || [])];
        const idx = fromCol.findIndex(t => t.id === taskId);
        if (idx === -1) return prev;
        const [task] = fromCol.splice(idx, 1);
        const moved = { ...task, status: targetStatus };
        next[from] = fromCol;
        next[targetStatus] = [...(next[targetStatus] || []), moved];
        return next as unknown as Columns;
      });

      fetch('/api/kanban/move', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: targetStatus }),
      }).catch(err => console.error('[kanban] move error', err));
    } catch (err) {
      console.error('[kanban] drop parse error', err);
    }
  }, []);

  if (loading) return <div className="p-8 text-[color:var(--grid-text-dim)]">Loading board…</div>;

  return (
    <div className="px-8 py-6">
      <h1 className="font-mono text-xl font-bold text-[color:var(--grid-accent)] mb-5 tracking-wider">
        ▥ KANBAN
      </h1>
      <div className="grid grid-cols-4 gap-4 min-h-[400px]">
        {COLUMN_META.map(col => (
          <div
            key={col.key}
            onDragOver={e => handleDragOver(e, col.key)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, col.key)}
            className="rounded-[10px] p-3 transition-[border-color,background] duration-150"
            style={{
              background: dragOver === col.key ? 'var(--grid-surface-hover)' : 'var(--grid-bg)',
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: dragOver === col.key ? col.accent : 'var(--grid-border)',
            }}
          >
            <div
              className="flex items-center gap-2 mb-3 font-mono text-xs font-semibold uppercase tracking-widest"
              style={{ color: col.accent }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: col.accent }}
              />
              {col.label}
              <span className="ml-auto opacity-50">{columns[col.key].length}</span>
            </div>
            <div className="flex flex-col gap-2 min-h-[60px]">
              {columns[col.key].map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={e => handleDragStart(e, task)}
                  className="bg-[var(--grid-surface)] border border-[var(--grid-border)] rounded-lg px-3 py-2.5 cursor-grab transition-shadow duration-150"
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 0 1px ${col.accent}`)}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div className="text-[0.8rem] font-semibold text-[color:var(--grid-text)] mb-1">
                    {task.title}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const info = getAgentInfo(task.agent);
                      return info ? (
                        <span
                          title={info.name}
                          className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-white text-[0.6rem] font-bold shrink-0 font-mono"
                          style={{ background: info.color }}
                        >
                          {info.initial}
                        </span>
                      ) : null;
                    })()}
                    <span className="text-[0.65rem] font-mono text-[color:var(--grid-text-muted)]">
                      {task.agent}
                    </span>
                    <span
                      className="text-[0.6rem] font-bold px-1.5 py-px rounded text-white uppercase tracking-wider"
                      style={{ background: PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.low }}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
