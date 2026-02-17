'use client';

import { useState } from 'react';
import { useSprintData } from '@/hooks/use-sprint-data';

export function SprintBoard({ x, y }: { x: number; y: number }) {
  const { data, loading, error } = useSprintData();
  const [hoveredTask, setHoveredTask] = useState<{ id: string; task_number: number; title: string; description: string; status: string } | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  if (loading || error || !data) {
    return (
      <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
        <div style={{
          width: 90, height: 65, backgroundColor: '#e5e7eb',
          borderRadius: 2, border: '2px solid #cbd5e1',
          padding: 4, display: 'flex', flexWrap: 'wrap', gap: 2,
        }}>
          {['#fef08a','#fbcfe8','#a5f3fc','#bbf7d0','#fecaca','#fde68a'].map((c, i) => (
            <div key={i} style={{ width: 8, height: 8, backgroundColor: c, borderRadius: 1 }} />
          ))}
        </div>
        <div style={{ fontSize: 6, fontFamily: 'monospace', color: '#94a3b8', textAlign: 'center', marginTop: 1 }}>
          Sprint Board{loading ? ' (loading...)' : error ? ' (error)' : ''}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return '#22c55e';
      case 'in-progress': return '#fbbf24';
      default: return '#9ca3af';
    }
  };

  const handleTaskHover = (task: { id: string; task_number: number; title: string; description: string; status: string }, event: React.MouseEvent) => {
    setHoveredTask(task);
    setHoverPosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <>
      <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'auto' }}>
        <div style={{
          width: 90, height: 4, backgroundColor: '#e5e7eb',
          borderRadius: 2, marginBottom: 2, overflow: 'hidden',
        }}>
          <div style={{
            width: `${(data.summary.done / data.summary.total) * 100}%`,
            height: '100%', backgroundColor: '#22c55e',
            transition: 'width 0.3s ease',
          }} />
        </div>
        
        <div style={{ fontSize: 6, fontFamily: 'monospace', color: '#374151', textAlign: 'center', marginBottom: 2 }}>
          {data.summary.done}/{data.summary.total} done
        </div>
        
        <div style={{
          width: 90, height: 65, backgroundColor: '#e5e7eb',
          borderRadius: 2, border: '2px solid #cbd5e1',
          padding: 4, display: 'flex', flexWrap: 'wrap', gap: 2,
          position: 'relative',
        }}>
          {data.tasks.slice(0, 12).map((task) => (
            <div
              key={task.id}
              style={{
                width: 12, height: 8, borderRadius: 1,
                backgroundColor: getStatusColor(task.status),
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 6, fontWeight: 'bold', color: '#fff',
                transition: 'background-color 0.2s ease, transform 0.1s ease',
                transform: hoveredTask?.id === task.id ? 'scale(1.1)' : 'scale(1)',
              }}
              onMouseEnter={(e) => handleTaskHover(task, e)}
              onMouseLeave={() => setHoveredTask(null)}
            >
              {task.status === 'done' && '✓'}
            </div>
          ))}
        </div>
        
        <div style={{ fontSize: 6, fontFamily: 'monospace', color: '#94a3b8', textAlign: 'center', marginTop: 1 }}>
          Sprint Board
        </div>
      </div>

      {hoveredTask && (
        <div style={{
          position: 'fixed',
          left: hoverPosition.x + 10,
          top: hoverPosition.y - 10,
          backgroundColor: '#1f2937',
          color: '#fff',
          padding: '6px 8px',
          borderRadius: 4,
          fontSize: 8,
          fontFamily: 'monospace',
          maxWidth: 200,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          pointerEvents: 'none',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: 2 }}>
            #{hoveredTask.task_number}: {hoveredTask.title}
          </div>
          <div style={{ color: '#d1d5db', fontSize: 7, marginBottom: 2 }}>
            Status: {hoveredTask.status}
          </div>
          <div style={{ color: '#d1d5db', fontSize: 7 }}>
            {hoveredTask.description}
          </div>
        </div>
      )}
    </>
  );
}
