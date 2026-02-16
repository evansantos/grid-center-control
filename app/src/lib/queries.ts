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

export function taskStats(projectId: string): { total: number; approved: number; in_progress: number; failed: number } {
  const tasks = listTasks(projectId);
  return {
    total: tasks.length,
    approved: tasks.filter((t) => ['approved', 'done'].includes(t.status)).length,
    in_progress: tasks.filter((t) => ['in_progress', 'in-progress'].includes(t.status)).length,
    failed: tasks.filter((t) => t.status === 'failed').length,
  };
}
