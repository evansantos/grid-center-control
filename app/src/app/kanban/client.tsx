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

  if (loading) return <div style={{ padding: '2rem', color: 'var(--grid-text-dim)' }}>Loading board…</div>;

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      <h1
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--grid-accent)',
          marginBottom: '1.25rem',
          letterSpacing: '0.05em',
        }}
      >
        ▥ KANBAN
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', minHeight: 400 }}>
        {COLUMN_META.map(col => (
          <div
            key={col.key}
            onDragOver={e => handleDragOver(e, col.key)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, col.key)}
            style={{
              background: dragOver === col.key ? 'var(--grid-surface-hover)' : 'var(--grid-bg)',
              border: `1px solid ${dragOver === col.key ? col.accent : 'var(--grid-border)'}`,
              borderRadius: 10,
              padding: '0.75rem',
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: '0.75rem',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: col.accent,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: col.accent,
                  display: 'inline-block',
                }}
              />
              {col.label}
              <span style={{ marginLeft: 'auto', opacity: 0.5 }}>{columns[col.key].length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: 60 }}>
              {columns[col.key].map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={e => handleDragStart(e, task)}
                  style={{
                    background: 'var(--grid-surface)',
                    border: '1px solid var(--grid-border)',
                    borderRadius: 8,
                    padding: '0.625rem 0.75rem',
                    cursor: 'grab',
                    transition: 'box-shadow 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 0 1px ${col.accent}`)}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--grid-text)',
                      marginBottom: 4,
                    }}
                  >
                    {task.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {(() => {
                      const info = getAgentInfo(task.agent);
                      return info ? (
                        <span
                          title={info.name}
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: info.color,
                            color: '#fff',
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            fontFamily: 'var(--font-mono, monospace)',
                          }}
                        >
                          {info.initial}
                        </span>
                      ) : null;
                    })()}
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-mono, monospace)',
                        color: 'var(--grid-text-muted)',
                      }}
                    >
                      {task.agent}
                    </span>
                    <span
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.low,
                        color: '#fff',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
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
