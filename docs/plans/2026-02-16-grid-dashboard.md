# Grid Dashboard — Implementation Plan

> **For MCP:** Execute this plan task-by-task.

**Goal:** Build the Grid dashboard — a local Next.js app with dark TRON theme showing project state, artifacts, tasks, approvals, and logs.

**Architecture:** Next.js 15 App Router. Reads/writes same SQLite DB as engine. Server components for data fetching. Client components for interactivity (approve/reject). Polling for live updates.

**Tech Stack:** Next.js 15, React 19, TypeScript, better-sqlite3, Tailwind CSS v4

---

### Task 1: Next.js project scaffold

**Files:**
- Create: `app/package.json`
- Create: `app/next.config.js`
- Create: `app/tailwind.config.ts`
- Create: `app/src/app/layout.tsx`
- Create: `app/src/app/globals.css`
- Create: `app/src/lib/db.ts`

**Step 1: Initialize Next.js project**

```bash
cd ~/workspace/mcp-projects/grid
npx create-next-app@latest app --typescript --tailwind --eslint --app --src-dir --no-import-alias --skip-install
```

Then install deps:
```bash
cd app
npm install better-sqlite3 uuid
npm install -D @types/better-sqlite3 @types/uuid
npm install
```

**Step 2: Create shared DB client**

Create `app/src/lib/db.ts`:
```typescript
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.GRID_DB ?? path.join(process.env.HOME ?? '~', 'workspace/mcp-projects/grid/grid.db');

let db: Database.Database | null = null;

export function getDB(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH, { readonly: false });
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}
```

**Step 3: Create types file**

Create `app/src/lib/types.ts` — copy from `engine/src/types.ts` (same interfaces).

**Step 4: Set up TRON theme globals**

Update `app/src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --grid-bg: #0a0a0f;
  --grid-surface: #12121a;
  --grid-border: #1e1e2e;
  --grid-accent: #ff4444;
  --grid-accent-dim: #cc2222;
  --grid-text: #e0e0e0;
  --grid-text-dim: #888;
  --grid-success: #44ff88;
  --grid-warning: #ffaa44;
  --grid-info: #4488ff;
}

body {
  background: var(--grid-bg);
  color: var(--grid-text);
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
}
```

**Step 5: Set up root layout**

Update `app/src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Grid — Dev Workflow',
  description: 'MCP Development Orchestrator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <nav className="border-b border-[var(--grid-border)] px-6 py-3 flex items-center gap-4">
          <span className="text-[var(--grid-accent)] font-bold text-lg tracking-wider">🔴 GRID</span>
          <a href="/" className="text-sm text-[var(--grid-text-dim)] hover:text-[var(--grid-text)]">Projects</a>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
```

**Step 6: Verify it runs**

```bash
cd app && npm run dev
# Visit http://localhost:3000 — should see dark page with GRID nav
```

---

### Task 2: Home page — project list

**Files:**
- Create: `app/src/lib/queries.ts`
- Create: `app/src/app/page.tsx`
- Create: `app/src/components/phase-badge.tsx`

**Step 1: Create query helpers**

Create `app/src/lib/queries.ts`:
```typescript
import { getDB } from './db';
import type { Project, Artifact, Task, Worktree, Event } from './types';

export function listProjects(): Project[] {
  const rows = getDB().prepare('SELECT * FROM projects ORDER BY updated_at DESC').all() as any[];
  return rows.map((r) => ({
    ...r,
    model_config: r.model_config ? JSON.parse(r.model_config) : null,
  }));
}

export function getProject(id: string): Project | null {
  const row = getDB().prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
  if (!row) return null;
  return { ...row, model_config: row.model_config ? JSON.parse(row.model_config) : null };
}

export function listArtifacts(projectId: string, type?: string): Artifact[] {
  if (type) {
    return getDB().prepare('SELECT * FROM artifacts WHERE project_id = ? AND type = ? ORDER BY created_at').all(projectId, type) as Artifact[];
  }
  return getDB().prepare('SELECT * FROM artifacts WHERE project_id = ? ORDER BY created_at').all(projectId) as Artifact[];
}

export function getArtifact(id: string): Artifact | null {
  return getDB().prepare('SELECT * FROM artifacts WHERE id = ?').get(id) as Artifact ?? null;
}

export function listTasks(projectId: string): Task[] {
  return getDB().prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY task_number').all(projectId) as Task[];
}

export function getTask(id: string): Task | null {
  return getDB().prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task ?? null;
}

export function listWorktrees(projectId: string): Worktree[] {
  return getDB().prepare('SELECT * FROM worktrees WHERE project_id = ? ORDER BY created_at').all(projectId) as Worktree[];
}

export function listEvents(projectId: string, limit = 50): Event[] {
  return getDB().prepare('SELECT * FROM events WHERE project_id = ? ORDER BY id DESC LIMIT ?').all(projectId, limit) as Event[];
}

export function updateArtifactStatus(id: string, status: string, feedback?: string): void {
  const now = new Date().toISOString();
  getDB().prepare('UPDATE artifacts SET status = ?, feedback = ?, updated_at = ? WHERE id = ?')
    .run(status, feedback ?? null, now, id);
}

export function createEvent(projectId: string, eventType: string, details?: string): void {
  const now = new Date().toISOString();
  getDB().prepare('INSERT INTO events (project_id, event_type, details, created_at) VALUES (?, ?, ?, ?)')
    .run(projectId, eventType, details ?? null, now);
}

export function updateProjectPhase(id: string, phase: string): void {
  const now = new Date().toISOString();
  getDB().prepare('UPDATE projects SET phase = ?, updated_at = ? WHERE id = ?').run(phase, now, id);
}

export function taskStats(projectId: string): { total: number; approved: number; in_progress: number; failed: number } {
  const tasks = listTasks(projectId);
  return {
    total: tasks.length,
    approved: tasks.filter((t) => t.status === 'approved').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    failed: tasks.filter((t) => t.status === 'failed').length,
  };
}
```

**Step 2: Create phase badge component**

Create `app/src/components/phase-badge.tsx`:
```tsx
const PHASE_COLORS: Record<string, string> = {
  brainstorm: 'bg-purple-900/50 text-purple-300 border-purple-700',
  design: 'bg-blue-900/50 text-blue-300 border-blue-700',
  plan: 'bg-cyan-900/50 text-cyan-300 border-cyan-700',
  execute: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  review: 'bg-orange-900/50 text-orange-300 border-orange-700',
  done: 'bg-green-900/50 text-green-300 border-green-700',
};

export function PhaseBadge({ phase }: { phase: string }) {
  const colors = PHASE_COLORS[phase] ?? 'bg-gray-900/50 text-gray-300 border-gray-700';
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-mono uppercase rounded border ${colors}`}>
      {phase}
    </span>
  );
}
```

**Step 3: Create home page**

Update `app/src/app/page.tsx`:
```tsx
import Link from 'next/link';
import { listProjects, taskStats } from '@/lib/queries';
import { PhaseBadge } from '@/components/phase-badge';

export const dynamic = 'force-dynamic';

export default function Home() {
  const projects = listProjects();

  if (projects.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--grid-text-dim)] text-lg">No projects yet.</p>
        <p className="text-[var(--grid-text-dim)] text-sm mt-2">Create one with: <code className="text-[var(--grid-accent)]">grid project create --name "..." --repo "..."</code></p>
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
              className="block border border-[var(--grid-border)] rounded-lg p-5 hover:border-[var(--grid-accent)] transition-colors bg-[var(--grid-surface)]"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">{p.name}</h2>
                <PhaseBadge phase={p.phase} />
              </div>
              <div className="flex gap-4 text-sm text-[var(--grid-text-dim)]">
                <span>📁 {p.repo_path}</span>
                {stats.total > 0 && (
                  <span>✅ {stats.approved}/{stats.total} tasks</span>
                )}
              </div>
              <p className="text-xs text-[var(--grid-text-dim)] mt-2">
                Updated {new Date(p.updated_at).toLocaleString()}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 4: Verify** — visit localhost:3000, should see empty state or project list.

---

### Task 3: Project detail page — phase progress + artifacts

**Files:**
- Create: `app/src/app/project/[id]/page.tsx`
- Create: `app/src/components/phase-progress.tsx`
- Create: `app/src/components/artifact-card.tsx`

**Step 1: Phase progress bar**

Create `app/src/components/phase-progress.tsx`:
```tsx
const PHASES = ['brainstorm', 'design', 'plan', 'execute', 'review', 'done'];

export function PhaseProgress({ current }: { current: string }) {
  const currentIndex = PHASES.indexOf(current);

  return (
    <div className="flex items-center gap-1 mb-8">
      {PHASES.map((phase, i) => {
        const isComplete = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={phase} className="flex items-center gap-1 flex-1">
            <div className={`
              flex-1 h-2 rounded-full transition-colors
              ${isComplete ? 'bg-[var(--grid-success)]' : ''}
              ${isCurrent ? 'bg-[var(--grid-accent)] animate-pulse' : ''}
              ${!isComplete && !isCurrent ? 'bg-[var(--grid-border)]' : ''}
            `} />
            <span className={`text-[10px] font-mono uppercase ${isCurrent ? 'text-[var(--grid-accent)]' : 'text-[var(--grid-text-dim)]'}`}>
              {phase}
            </span>
          </div>
        );
      })}
    </div>
  );
}
```

**Step 2: Artifact card**

Create `app/src/components/artifact-card.tsx`:
```tsx
'use client';

import { useState } from 'react';

interface ArtifactCardProps {
  artifact: {
    id: string;
    type: string;
    content: string;
    status: string;
    feedback: string | null;
    created_at: string;
  };
  projectId: string;
  onAction?: () => void;
}

export function ArtifactCard({ artifact, projectId, onAction }: ArtifactCardProps) {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const statusColors: Record<string, string> = {
    draft: 'text-gray-400',
    pending_approval: 'text-yellow-400',
    approved: 'text-green-400',
    rejected: 'text-red-400',
  };

  async function handleAction(action: 'approve' | 'reject') {
    setLoading(true);
    await fetch(`/api/artifacts/${artifact.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, projectId, feedback: action === 'reject' ? feedback : undefined }),
    });
    setLoading(false);
    onAction?.();
  }

  return (
    <div className="border border-[var(--grid-border)] rounded-lg p-4 bg-[var(--grid-surface)]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-mono uppercase text-[var(--grid-text-dim)]">{artifact.type}</span>
        <span className={`text-sm font-mono ${statusColors[artifact.status] ?? ''}`}>
          {artifact.status}
        </span>
      </div>

      <div className="prose prose-invert prose-sm max-w-none mb-4 whitespace-pre-wrap font-mono text-sm leading-relaxed">
        {artifact.content.slice(0, 2000)}
        {artifact.content.length > 2000 && <span className="text-[var(--grid-text-dim)]">... (truncated)</span>}
      </div>

      {artifact.feedback && (
        <div className="bg-red-900/20 border border-red-900 rounded p-3 mb-3 text-sm">
          <strong>Feedback:</strong> {artifact.feedback}
        </div>
      )}

      {(artifact.status === 'draft' || artifact.status === 'pending_approval' || artifact.status === 'rejected') && (
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => handleAction('approve')}
            disabled={loading}
            className="px-3 py-1.5 bg-green-800 hover:bg-green-700 text-green-100 rounded text-sm font-mono disabled:opacity-50"
          >
            ✅ Approve
          </button>
          <input
            type="text"
            placeholder="Feedback (optional)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-[var(--grid-bg)] border border-[var(--grid-border)] rounded text-sm font-mono"
          />
          <button
            onClick={() => handleAction('reject')}
            disabled={loading}
            className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-red-100 rounded text-sm font-mono disabled:opacity-50"
          >
            ❌ Reject
          </button>
        </div>
      )}
    </div>
  );
}
```

**Step 3: Project detail page**

Create `app/src/app/project/[id]/page.tsx`:
```tsx
import { notFound } from 'next/navigation';
import { getProject, listArtifacts, listTasks, listWorktrees } from '@/lib/queries';
import { PhaseProgress } from '@/components/phase-progress';
import { PhaseBadge } from '@/components/phase-badge';
import { ProjectClient } from './client';

export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const artifacts = listArtifacts(id);
  const tasks = listTasks(id);
  const worktrees = listWorktrees(id);

  return (
    <div>
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <PhaseBadge phase={project.phase} />
      </div>
      <p className="text-sm text-[var(--grid-text-dim)] mb-6">📁 {project.repo_path}</p>

      <PhaseProgress current={project.phase} />

      <ProjectClient
        projectId={id}
        initialArtifacts={artifacts}
        initialTasks={tasks}
        initialWorktrees={worktrees}
        phase={project.phase}
      />
    </div>
  );
}
```

**Step 4: Create client component for polling + interactivity**

Create `app/src/app/project/[id]/client.tsx`:
```tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
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
  in_progress: '🔄',
  review: '🔍',
  approved: '✅',
  failed: '❌',
};

export function ProjectClient({ projectId, initialArtifacts, initialTasks, initialWorktrees, phase }: Props) {
  const [artifacts, setArtifacts] = useState(initialArtifacts);
  const [tasks, setTasks] = useState(initialTasks);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}`);
    if (res.ok) {
      const data = await res.json();
      setArtifacts(data.artifacts);
      setTasks(data.tasks);
    }
  }, [projectId]);

  // Poll every 3s
  useEffect(() => {
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  const designs = artifacts.filter((a) => a.type === 'design');
  const plans = artifacts.filter((a) => a.type === 'plan');

  return (
    <div className="space-y-8">
      {/* Designs */}
      {designs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-[var(--grid-info)]">📐 Designs</h2>
          <div className="space-y-3">
            {designs.map((a) => (
              <ArtifactCard key={a.id} artifact={a} projectId={projectId} onAction={refresh} />
            ))}
          </div>
        </section>
      )}

      {/* Plans */}
      {plans.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-[var(--grid-info)]">📋 Plans</h2>
          <div className="space-y-3">
            {plans.map((a) => (
              <ArtifactCard key={a.id} artifact={a} projectId={projectId} onAction={refresh} />
            ))}
          </div>
        </section>
      )}

      {/* Tasks */}
      {tasks.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-[var(--grid-info)]">⚡ Tasks</h2>
          <div className="space-y-2">
            {tasks.map((t) => (
              <a
                key={t.id}
                href={`/project/${projectId}/task/${t.task_number}`}
                className="flex items-center gap-3 p-3 border border-[var(--grid-border)] rounded-lg bg-[var(--grid-surface)] hover:border-[var(--grid-accent)] transition-colors"
              >
                <span className="text-lg">{TASK_STATUS_ICONS[t.status] ?? '❓'}</span>
                <span className="font-mono text-sm text-[var(--grid-text-dim)]">#{t.task_number}</span>
                <span className="flex-1 font-semibold">{t.title}</span>
                <span className="text-xs font-mono text-[var(--grid-text-dim)]">{t.status}</span>
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
          <div className="mt-2 text-sm text-[var(--grid-text-dim)]">
            {tasks.filter((t) => t.status === 'approved').length}/{tasks.length} complete
          </div>
        </section>
      )}
    </div>
  );
}
```

---

### Task 4: API routes

**Files:**
- Create: `app/src/app/api/projects/[id]/route.ts`
- Create: `app/src/app/api/artifacts/[id]/route.ts`

**Step 1: Project data API (for polling)**

Create `app/src/app/api/projects/[id]/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { getProject, listArtifacts, listTasks, listWorktrees, listEvents } from '@/lib/queries';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    project,
    artifacts: listArtifacts(id),
    tasks: listTasks(id),
    worktrees: listWorktrees(id),
    events: listEvents(id, 20),
  });
}
```

**Step 2: Artifact action API (approve/reject)**

Create `app/src/app/api/artifacts/[id]/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { updateArtifactStatus, createEvent, getArtifact } from '@/lib/queries';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { action, projectId, feedback } = body;

  if (action === 'approve') {
    updateArtifactStatus(id, 'approved');
    createEvent(projectId, 'approval', JSON.stringify({ artifact_id: id, status: 'approved', source: 'dashboard' }));
  } else if (action === 'reject') {
    updateArtifactStatus(id, 'rejected', feedback);
    createEvent(projectId, 'approval', JSON.stringify({ artifact_id: id, status: 'rejected', feedback, source: 'dashboard' }));
  }

  return NextResponse.json(getArtifact(id));
}
```

---

### Task 5: Task detail page

**Files:**
- Create: `app/src/app/project/[id]/task/[num]/page.tsx`

**Step 1: Create task detail page**

Create `app/src/app/project/[id]/task/[num]/page.tsx`:
```tsx
import { notFound } from 'next/navigation';
import { getProject, listTasks } from '@/lib/queries';
import { PhaseBadge } from '@/components/phase-badge';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TaskPage({ params }: { params: Promise<{ id: string; num: string }> }) {
  const { id, num } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const tasks = listTasks(id);
  const task = tasks.find((t) => t.task_number === parseInt(num));
  if (!task) notFound();

  return (
    <div>
      <Link href={`/project/${id}`} className="text-sm text-[var(--grid-accent)] hover:underline mb-4 inline-block">
        ← Back to {project.name}
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Task #{task.task_number}: {task.title}</h1>
        <PhaseBadge phase={task.status} />
      </div>

      {/* Timing */}
      <div className="flex gap-6 text-sm text-[var(--grid-text-dim)] mb-6">
        {task.started_at && <span>Started: {new Date(task.started_at).toLocaleString()}</span>}
        {task.completed_at && <span>Completed: {new Date(task.completed_at).toLocaleString()}</span>}
        {task.agent_session && <span>Agent: <code>{task.agent_session}</code></span>}
      </div>

      {/* Description */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2 text-[var(--grid-info)]">📝 Description</h2>
        <div className="border border-[var(--grid-border)] rounded-lg p-4 bg-[var(--grid-surface)] whitespace-pre-wrap font-mono text-sm leading-relaxed">
          {task.description}
        </div>
      </section>

      {/* Reviews */}
      <div className="grid grid-cols-2 gap-4">
        <section>
          <h2 className="text-lg font-semibold mb-2">🔍 Spec Review</h2>
          <div className={`border rounded-lg p-4 bg-[var(--grid-surface)] font-mono text-sm ${
            task.spec_review?.startsWith('PASS') ? 'border-green-800' : task.spec_review?.startsWith('FAIL') ? 'border-red-800' : 'border-[var(--grid-border)]'
          }`}>
            {task.spec_review ?? <span className="text-[var(--grid-text-dim)]">Pending</span>}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">✨ Quality Review</h2>
          <div className={`border rounded-lg p-4 bg-[var(--grid-surface)] font-mono text-sm ${
            task.quality_review?.startsWith('PASS') ? 'border-green-800' : task.quality_review?.startsWith('FAIL') ? 'border-red-800' : 'border-[var(--grid-border)]'
          }`}>
            {task.quality_review ?? <span className="text-[var(--grid-text-dim)]">Pending</span>}
          </div>
        </section>
      </div>
    </div>
  );
}
```

---

### Task 6: Event log page

**Files:**
- Create: `app/src/app/project/[id]/log/page.tsx`

**Step 1: Create log page**

Create `app/src/app/project/[id]/log/page.tsx`:
```tsx
import { notFound } from 'next/navigation';
import { getProject, listEvents } from '@/lib/queries';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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
      <Link href={`/project/${id}`} className="text-sm text-[var(--grid-accent)] hover:underline mb-4 inline-block">
        ← Back to {project.name}
      </Link>

      <h1 className="text-2xl font-bold mb-6">📜 Event Log</h1>

      <div className="space-y-2">
        {events.map((e) => {
          let details: any = {};
          try { details = JSON.parse(e.details ?? '{}'); } catch {}

          return (
            <div key={e.id} className="flex items-start gap-3 p-3 border border-[var(--grid-border)] rounded bg-[var(--grid-surface)]">
              <span className="text-lg">{EVENT_ICONS[e.event_type] ?? '📌'}</span>
              <div className="flex-1">
                <span className="font-mono text-sm">{e.event_type}</span>
                <pre className="text-xs text-[var(--grid-text-dim)] mt-1 overflow-x-auto">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
              <span className="text-xs text-[var(--grid-text-dim)] whitespace-nowrap">
                {new Date(e.created_at).toLocaleTimeString()}
              </span>
            </div>
          );
        })}

        {events.length === 0 && (
          <p className="text-[var(--grid-text-dim)] text-center py-10">No events yet.</p>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Add log link to project page nav**

In `app/src/app/project/[id]/page.tsx`, add after the phase progress:
```tsx
<div className="flex gap-4 mb-6">
  <a href={`/project/${id}/log`} className="text-sm text-[var(--grid-accent)] hover:underline">📜 Event Log</a>
</div>
```

---

## Summary

| Task | What | Key Files |
|------|------|-----------|
| 1 | Next.js scaffold + theme | layout, globals.css, db.ts |
| 2 | Home page — project list | page.tsx, queries.ts |
| 3 | Project detail — artifacts + tasks | project/[id]/page.tsx |
| 4 | API routes — polling + approve/reject | api/ routes |
| 5 | Task detail page | task/[num]/page.tsx |
| 6 | Event log page | log/page.tsx |

**Estimated time:** ~30-40 min
