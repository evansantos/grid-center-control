'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

const PRIORITY_COLORS: Record<string, { variant: 'success' | 'warning' | 'error' | 'default' }> = {
  critical: { variant: 'error' },
  high: { variant: 'warning' },
  medium: { variant: 'warning' },
  low: { variant: 'default' },
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

// Task component with drag and drop functionality
function TaskCard({ task, isOverlay = false }: { task: Task; isOverlay?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const agentInfo = getAgentInfo(task.agent);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing ${isOverlay ? 'ring-2 ring-grid-accent' : ''}`}
      {...attributes}
      {...listeners}
      tabIndex={0}
      role="listitem"
      aria-label={`Task: ${task.title}, assigned to ${task.agent}, priority: ${task.priority}`}
      onKeyDown={(e) => {
        // Keyboard navigation support
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // You can add custom keyboard handling here
        }
      }}
    >
      <CardContent className="p-3">
        <div className="text-sm font-medium text-grid-text mb-2">
          {task.title}
        </div>
        <div className="flex items-center gap-2">
          {agentInfo && (
            <span
              title={agentInfo.name}
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs font-bold shrink-0 font-mono"
              style={{ background: agentInfo.color }}
            >
              {agentInfo.initial}
            </span>
          )}
          <span className="text-xs font-mono text-grid-text-muted">
            {task.agent}
          </span>
          <Badge 
            variant={PRIORITY_COLORS[task.priority]?.variant || 'default'}
            size="sm"
            className="ml-auto uppercase tracking-wider"
          >
            {task.priority}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// Column component 
function KanbanColumn({ 
  columnKey, 
  column, 
  tasks 
}: { 
  columnKey: keyof Columns; 
  column: { key: keyof Columns; label: string; accent: string }; 
  tasks: Task[] 
}) {
  const droppableRef = useRef<HTMLDivElement>(null);

  return (
    <Card 
      className="flex flex-col h-fit"
      ref={droppableRef}
      role="region"
      aria-label={`${column.label} column with ${tasks.length} tasks`}
    >
      <CardHeader className="pb-3">
        <div
          className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest"
          style={{ color: column.accent }}
        >
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: column.accent }}
          />
          {column.label}
          <Badge variant="outline" size="sm" className="ml-auto">
            {tasks.length}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 min-h-[200px]">
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          <div 
            className="flex flex-col gap-2"
            role="list"
            aria-label={`Tasks in ${column.label}`}
          >
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  );
}

export function KanbanBoard() {
  const [columns, setColumns] = useState<Columns>({ 
    pending: [], 
    in_progress: [], 
    review: [], 
    done: [] 
  });
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    fetch('/api/kanban')
      .then(r => r.json())
      .then(data => setColumns(data.columns ?? { pending: [], in_progress: [], review: [], done: [] }))
      .catch(err => console.error('[kanban] fetch error', err))
      .finally(() => setLoading(false));
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const task = active.data.current?.task;
    setActiveTask(task || null);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const task = active.data.current?.task as Task;
    const currentStatus = task.status;

    // Find target column
    let targetStatus = currentStatus;
    
    // Check if dropped over a column
    for (const col of COLUMN_META) {
      if (over.id === col.key) {
        targetStatus = col.key;
        break;
      }
    }

    // Check if dropped over another task (same column reorder)
    if (over.data.current?.task) {
      const overTask = over.data.current.task as Task;
      targetStatus = overTask.status;
    }

    if (currentStatus === targetStatus) {
      // Same column reordering
      setColumns(prev => {
        const items = prev[currentStatus as keyof Columns];
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newItems = arrayMove(items, oldIndex, newIndex);
          return {
            ...prev,
            [currentStatus]: newItems,
          };
        }
        return prev;
      });
    } else {
      // Move to different column
      setColumns(prev => {
        const next = { ...prev } as Record<string, Task[]>;
        const fromCol = [...(next[currentStatus] || [])];
        const idx = fromCol.findIndex(t => t.id === active.id);
        if (idx === -1) return prev;
        
        const [movedTask] = fromCol.splice(idx, 1);
        const updatedTask = { ...movedTask, status: targetStatus };
        next[currentStatus] = fromCol;
        next[targetStatus] = [...(next[targetStatus] || []), updatedTask];
        
        return next as unknown as Columns;
      });

      // API call to persist the change
      fetch('/api/kanban/move', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: active.id, status: targetStatus }),
      }).catch(err => console.error('[kanban] move error', err));
    }
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 text-grid-text-dim">
          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          Loading board…
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-mono text-xl font-bold text-grid-accent tracking-wider">
          ▥ KANBAN
        </h1>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => window.location.reload()}
          className="text-xs"
        >
          Refresh
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          role="application"
          aria-label="Kanban board"
        >
          {COLUMN_META.map(col => (
            <KanbanColumn
              key={col.key}
              columnKey={col.key}
              column={col}
              tasks={columns[col.key] || []}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isOverlay={true} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}