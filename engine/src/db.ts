import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { v4 as uuid } from 'uuid';
import type {
  Project, Artifact, ArtifactType, ArtifactStatus,
  Worktree, Task, TaskStatus, ReviewType, Event, Phase,
} from './types.js';
import { DEFAULT_MODEL_CONFIG } from './types.js';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  repo_path TEXT NOT NULL,
  phase TEXT NOT NULL DEFAULT 'brainstorm',
  model_config TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS artifacts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  file_path TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  feedback TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS worktrees (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  branch TEXT NOT NULL,
  path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  artifact_id TEXT REFERENCES artifacts(id),
  worktree_id TEXT REFERENCES worktrees(id),
  task_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  agent_session TEXT,
  spec_review TEXT,
  quality_review TEXT,
  started_at TEXT,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL REFERENCES projects(id),
  event_type TEXT NOT NULL,
  details TEXT,
  created_at TEXT NOT NULL
);
`;

export class GridDB {
  private db: DatabaseType;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.db.exec(SCHEMA);
  }

  raw(): DatabaseType {
    return this.db;
  }

  close(): void {
    this.db.close();
  }

  // --- Projects ---

  createProject(input: { name: string; repo_path: string }): Project {
    const id = uuid();
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO projects (id, name, repo_path, phase, created_at, updated_at)
      VALUES (?, ?, ?, 'brainstorm', ?, ?)
    `).run(id, input.name, input.repo_path, now, now);
    return this.getProject(id)!;
  }

  listProjects(): Project[] {
    const rows = this.db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all() as any[];
    return rows.map(this.parseProject);
  }

  getProject(id: string): Project | null {
    const row = this.db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
    if (!row) return null;
    return this.parseProject(row);
  }

  setModelConfig(projectId: string, config: Record<string, string>): void {
    const now = new Date().toISOString();
    this.db.prepare('UPDATE projects SET model_config = ?, updated_at = ? WHERE id = ?')
      .run(JSON.stringify(config), now, projectId);
  }

  updateProjectPhase(id: string, phase: Phase): void {
    const now = new Date().toISOString();
    this.db.prepare('UPDATE projects SET phase = ?, updated_at = ? WHERE id = ?')
      .run(phase, now, id);
  }

  private parseProject(row: any): Project {
    return {
      ...row,
      model_config: row.model_config ? JSON.parse(row.model_config) : null,
    };
  }

  // --- Artifacts ---

  createArtifact(input: {
    project_id: string;
    type: ArtifactType;
    content: string;
    file_path?: string;
  }): Artifact {
    const id = uuid();
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO artifacts (id, project_id, type, content, file_path, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'draft', ?, ?)
    `).run(id, input.project_id, input.type, input.content, input.file_path ?? null, now, now);
    return this.getArtifact(id)!;
  }

  getArtifact(id: string): Artifact | null {
    const row = this.db.prepare('SELECT * FROM artifacts WHERE id = ?').get(id) as any;
    return row ?? null;
  }

  listArtifacts(projectId: string, type?: ArtifactType): Artifact[] {
    if (type) {
      return this.db.prepare(
        'SELECT * FROM artifacts WHERE project_id = ? AND type = ? ORDER BY created_at'
      ).all(projectId, type) as Artifact[];
    }
    return this.db.prepare(
      'SELECT * FROM artifacts WHERE project_id = ? ORDER BY created_at'
    ).all(projectId) as Artifact[];
  }

  updateArtifactStatus(id: string, status: ArtifactStatus, feedback?: string): void {
    const now = new Date().toISOString();
    this.db.prepare('UPDATE artifacts SET status = ?, feedback = ?, updated_at = ? WHERE id = ?')
      .run(status, feedback ?? null, now, id);
  }

  // --- Worktrees ---

  createWorktree(input: { project_id: string; branch: string; path: string }): Worktree {
    const id = uuid();
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO worktrees (id, project_id, branch, path, status, created_at)
      VALUES (?, ?, ?, ?, 'active', ?)
    `).run(id, input.project_id, input.branch, input.path, now);
    return this.db.prepare('SELECT * FROM worktrees WHERE id = ?').get(id) as Worktree;
  }

  listWorktrees(projectId: string): Worktree[] {
    return this.db.prepare(
      'SELECT * FROM worktrees WHERE project_id = ? ORDER BY created_at'
    ).all(projectId) as Worktree[];
  }

  // --- Tasks ---

  createTask(input: {
    project_id: string;
    task_number: number;
    title: string;
    description: string;
    artifact_id?: string;
    worktree_id?: string;
  }): Task {
    const id = uuid();
    this.db.prepare(`
      INSERT INTO tasks (id, project_id, artifact_id, worktree_id, task_number, title, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(id, input.project_id, input.artifact_id ?? null, input.worktree_id ?? null,
      input.task_number, input.title, input.description);
    return this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task;
  }

  getTask(id: string): Task | null {
    return this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task ?? null;
  }

  listTasks(projectId: string): Task[] {
    return this.db.prepare(
      'SELECT * FROM tasks WHERE project_id = ? ORDER BY task_number'
    ).all(projectId) as Task[];
  }

  startTask(id: string): void {
    const now = new Date().toISOString();
    this.db.prepare('UPDATE tasks SET status = ?, started_at = ? WHERE id = ?')
      .run('in_progress', now, id);
  }

  updateTaskStatus(id: string, status: TaskStatus): void {
    this.db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, id);
  }

  setTaskReview(id: string, type: ReviewType, result: string): void {
    const col = type === 'spec' ? 'spec_review' : 'quality_review';
    this.db.prepare(`UPDATE tasks SET ${col} = ? WHERE id = ?`).run(result, id);
  }

  approveTask(id: string): void {
    const now = new Date().toISOString();
    this.db.prepare('UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?')
      .run('approved', now, id);
  }

  setTaskAgent(id: string, sessionKey: string): void {
    this.db.prepare('UPDATE tasks SET agent_session = ? WHERE id = ?')
      .run(sessionKey, id);
  }

  createTaskBatch(projectId: string, tasks: { task_number: number; title: string; description: string; artifact_id?: string; worktree_id?: string }[]): Task[] {
    const insert = this.db.prepare(`
      INSERT INTO tasks (id, project_id, artifact_id, worktree_id, task_number, title, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `);
    const ids: string[] = [];
    const txn = this.db.transaction(() => {
      for (const t of tasks) {
        const id = uuid();
        insert.run(id, projectId, t.artifact_id ?? null, t.worktree_id ?? null, t.task_number, t.title, t.description);
        ids.push(id);
      }
    });
    txn();
    return ids.map(id => this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task);
  }

  getTaskBatch(projectId: string, from: number, to: number): Task[] {
    return this.db.prepare(
      'SELECT * FROM tasks WHERE project_id = ? AND task_number >= ? AND task_number <= ? ORDER BY task_number'
    ).all(projectId, from, to) as Task[];
  }

  getModelForPhase(projectId: string, phase: string): string {
    const project = this.getProject(projectId);
    if (project?.model_config && project.model_config[phase]) {
      return project.model_config[phase];
    }
    return DEFAULT_MODEL_CONFIG[phase as Phase];
  }

  // --- Events ---

  createEvent(input: { project_id: string; event_type: string; details?: string }): void {
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO events (project_id, event_type, details, created_at)
      VALUES (?, ?, ?, ?)
    `).run(input.project_id, input.event_type, input.details ?? null, now);
  }

  listEvents(projectId: string, limit?: number): Event[] {
    const sql = limit
      ? 'SELECT * FROM events WHERE project_id = ? ORDER BY id DESC LIMIT ?'
      : 'SELECT * FROM events WHERE project_id = ? ORDER BY id DESC';
    return limit
      ? this.db.prepare(sql).all(projectId, limit) as Event[]
      : this.db.prepare(sql).all(projectId) as Event[];
  }
}
