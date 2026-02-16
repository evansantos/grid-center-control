# Grid Engine — Implementation Plan

> **For MCP:** Execute this plan task-by-task using subagent-driven development.

**Goal:** Build the Grid engine CLI — project management, state machine, SQLite persistence, git worktree management.

**Architecture:** TypeScript monorepo package. CLI entry point parses commands, delegates to domain modules. SQLite via `better-sqlite3`. Git operations via `simple-git`.

**Tech Stack:** TypeScript, Node.js, better-sqlite3, simple-git, commander (CLI), vitest (tests)

---

### Task 1: Project scaffold + DB initialization

**Files:**
- Create: `engine/package.json`
- Create: `engine/tsconfig.json`
- Create: `engine/src/db.ts`
- Create: `engine/src/types.ts`
- Test: `engine/src/__tests__/db.test.ts`

**Step 1: Initialize project**

```bash
cd ~/workspace/mcp-projects/grid
mkdir -p engine/src/__tests__
cd engine
```

Create `package.json`:
```json
{
  "name": "@grid/engine",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "grid": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "dev": "tsx src/cli.ts"
  },
  "dependencies": {
    "better-sqlite3": "^11.0.0",
    "commander": "^12.0.0",
    "simple-git": "^3.22.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.0",
    "@types/node": "^22.0.0",
    "@types/uuid": "^9.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.4.0",
    "vitest": "^2.0.0"
  }
}
```

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["src/__tests__"]
}
```

```bash
npm install
```

**Step 2: Write types**

Create `engine/src/types.ts`:
```typescript
export type Phase = 'brainstorm' | 'design' | 'plan' | 'execute' | 'review' | 'done';
export type ArtifactType = 'design' | 'plan';
export type ArtifactStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';
export type WorktreeStatus = 'active' | 'merged' | 'discarded';
export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'approved' | 'failed';
export type ReviewType = 'spec' | 'quality';
export type EventType = 'phase_change' | 'approval' | 'task_update' | 'review';

export interface Project {
  id: string;
  name: string;
  repo_path: string;
  phase: Phase;
  model_config: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export interface Artifact {
  id: string;
  project_id: string;
  type: ArtifactType;
  content: string;
  file_path: string | null;
  status: ArtifactStatus;
  feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface Worktree {
  id: string;
  project_id: string;
  branch: string;
  path: string;
  status: WorktreeStatus;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  artifact_id: string | null;
  worktree_id: string | null;
  task_number: number;
  title: string;
  description: string;
  status: TaskStatus;
  agent_session: string | null;
  spec_review: string | null;
  quality_review: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface Event {
  id: number;
  project_id: string;
  event_type: EventType;
  details: string | null;
  created_at: string;
}

export const DEFAULT_MODEL_CONFIG: Record<Phase, string> = {
  brainstorm: 'opus',
  design: 'opus',
  plan: 'opus',
  execute: 'sonnet',
  review: 'opus',
  done: 'opus',
};
```

**Step 3: Write failing test for DB initialization**

Create `engine/src/__tests__/db.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GridDB } from '../db.js';
import fs from 'fs';
import path from 'path';

const TEST_DB = path.join(import.meta.dirname, '../../test.db');

describe('GridDB', () => {
  afterEach(() => {
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  });

  it('creates database with all tables', () => {
    const db = new GridDB(TEST_DB);
    const tables = db.raw()
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[];
    const names = tables.map((t) => t.name);

    expect(names).toContain('projects');
    expect(names).toContain('artifacts');
    expect(names).toContain('worktrees');
    expect(names).toContain('tasks');
    expect(names).toContain('events');
    db.close();
  });
});
```

**Step 4: Run test, verify FAIL**

```bash
npx vitest run
```
Expected: FAIL — `GridDB` doesn't exist yet.

**Step 5: Implement DB initialization**

Create `engine/src/db.ts`:
```typescript
import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';

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
}
```

**Step 6: Run test, verify PASS**

```bash
npx vitest run
```
Expected: PASS

---

### Task 2: Project CRUD operations

**Files:**
- Modify: `engine/src/db.ts`
- Test: `engine/src/__tests__/projects.test.ts`

**Step 1: Write failing tests**

Create `engine/src/__tests__/projects.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GridDB } from '../db.js';
import fs from 'fs';
import path from 'path';

const TEST_DB = path.join(import.meta.dirname, '../../test-projects.db');

describe('Projects', () => {
  let db: GridDB;

  beforeEach(() => {
    db = new GridDB(TEST_DB);
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  });

  it('creates a project with default phase brainstorm', () => {
    const project = db.createProject({ name: 'Test', repo_path: '/tmp/repo' });
    expect(project.name).toBe('Test');
    expect(project.repo_path).toBe('/tmp/repo');
    expect(project.phase).toBe('brainstorm');
    expect(project.id).toBeTruthy();
  });

  it('lists all projects', () => {
    db.createProject({ name: 'A', repo_path: '/tmp/a' });
    db.createProject({ name: 'B', repo_path: '/tmp/b' });
    const projects = db.listProjects();
    expect(projects).toHaveLength(2);
  });

  it('gets a project by id', () => {
    const created = db.createProject({ name: 'Test', repo_path: '/tmp/repo' });
    const found = db.getProject(created.id);
    expect(found).toBeTruthy();
    expect(found!.name).toBe('Test');
  });

  it('returns null for unknown project', () => {
    const found = db.getProject('nonexistent');
    expect(found).toBeNull();
  });

  it('sets model config', () => {
    const project = db.createProject({ name: 'Test', repo_path: '/tmp/repo' });
    db.setModelConfig(project.id, { execute: 'sonnet' });
    const updated = db.getProject(project.id);
    expect(updated!.model_config).toEqual({ execute: 'sonnet' });
  });
});
```

**Step 2: Run test, verify FAIL**

```bash
npx vitest run
```
Expected: FAIL — methods don't exist.

**Step 3: Implement project CRUD in `db.ts`**

Add to `GridDB` class:
```typescript
import { v4 as uuid } from 'uuid';
import type { Project } from './types.js';

// Add these methods to GridDB class:

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
    this.db.prepare(`
      UPDATE projects SET model_config = ?, updated_at = ? WHERE id = ?
    `).run(JSON.stringify(config), now, projectId);
  }

  private parseProject(row: any): Project {
    return {
      ...row,
      model_config: row.model_config ? JSON.parse(row.model_config) : null,
    };
  }
```

**Step 4: Run test, verify PASS**

```bash
npx vitest run
```

---

### Task 3: Artifact CRUD operations

**Files:**
- Modify: `engine/src/db.ts`
- Test: `engine/src/__tests__/artifacts.test.ts`

**Step 1: Write failing tests**

Create `engine/src/__tests__/artifacts.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GridDB } from '../db.js';
import fs from 'fs';
import path from 'path';

const TEST_DB = path.join(import.meta.dirname, '../../test-artifacts.db');

describe('Artifacts', () => {
  let db: GridDB;
  let projectId: string;

  beforeEach(() => {
    db = new GridDB(TEST_DB);
    projectId = db.createProject({ name: 'Test', repo_path: '/tmp' }).id;
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  });

  it('creates an artifact with draft status', () => {
    const artifact = db.createArtifact({
      project_id: projectId,
      type: 'design',
      content: '# Design\nSome content',
    });
    expect(artifact.status).toBe('draft');
    expect(artifact.type).toBe('design');
    expect(artifact.content).toContain('Design');
  });

  it('lists artifacts by project and type', () => {
    db.createArtifact({ project_id: projectId, type: 'design', content: 'a' });
    db.createArtifact({ project_id: projectId, type: 'plan', content: 'b' });
    const designs = db.listArtifacts(projectId, 'design');
    expect(designs).toHaveLength(1);
    expect(designs[0].type).toBe('design');
  });

  it('approves an artifact', () => {
    const a = db.createArtifact({ project_id: projectId, type: 'design', content: 'x' });
    db.updateArtifactStatus(a.id, 'approved');
    const updated = db.getArtifact(a.id);
    expect(updated!.status).toBe('approved');
  });

  it('rejects an artifact with feedback', () => {
    const a = db.createArtifact({ project_id: projectId, type: 'design', content: 'x' });
    db.updateArtifactStatus(a.id, 'rejected', 'Needs more detail');
    const updated = db.getArtifact(a.id);
    expect(updated!.status).toBe('rejected');
    expect(updated!.feedback).toBe('Needs more detail');
  });
});
```

**Step 2: Run test, verify FAIL**

**Step 3: Implement artifact CRUD in `db.ts`**

Add to `GridDB`:
```typescript
import type { Artifact, ArtifactType, ArtifactStatus } from './types.js';

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
    this.db.prepare(`
      UPDATE artifacts SET status = ?, feedback = ?, updated_at = ? WHERE id = ?
    `).run(status, feedback ?? null, now, id);
  }
```

**Step 4: Run test, verify PASS**

---

### Task 4: State machine + phase transitions

**Files:**
- Create: `engine/src/state.ts`
- Test: `engine/src/__tests__/state.test.ts`

**Step 1: Write failing tests**

Create `engine/src/__tests__/state.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GridDB } from '../db.js';
import { StateMachine } from '../state.js';
import fs from 'fs';
import path from 'path';

const TEST_DB = path.join(import.meta.dirname, '../../test-state.db');

describe('StateMachine', () => {
  let db: GridDB;
  let sm: StateMachine;
  let projectId: string;

  beforeEach(() => {
    db = new GridDB(TEST_DB);
    sm = new StateMachine(db);
    projectId = db.createProject({ name: 'Test', repo_path: '/tmp' }).id;
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  });

  it('rejects advance from brainstorm without approved design', () => {
    const result = sm.advance(projectId);
    expect(result.success).toBe(false);
    expect(result.reason).toContain('design');
  });

  it('advances from brainstorm to design with approved design', () => {
    const a = db.createArtifact({ project_id: projectId, type: 'design', content: 'x' });
    db.updateArtifactStatus(a.id, 'approved');
    const result = sm.advance(projectId);
    expect(result.success).toBe(true);
    const project = db.getProject(projectId);
    expect(project!.phase).toBe('design');
  });

  it('rejects advance from design to plan if design not all approved', () => {
    // get to design phase first
    const a1 = db.createArtifact({ project_id: projectId, type: 'design', content: 'x' });
    db.updateArtifactStatus(a1.id, 'approved');
    sm.advance(projectId); // → design

    // add another design artifact that's still draft
    db.createArtifact({ project_id: projectId, type: 'design', content: 'y' });
    const result = sm.advance(projectId);
    expect(result.success).toBe(false);
  });

  it('advances from plan to execute with approved plan + worktree', () => {
    // brainstorm → design
    const d = db.createArtifact({ project_id: projectId, type: 'design', content: 'x' });
    db.updateArtifactStatus(d.id, 'approved');
    sm.advance(projectId);

    // design → plan
    sm.advance(projectId);

    // create plan + worktree
    const p = db.createArtifact({ project_id: projectId, type: 'plan', content: 'plan' });
    db.updateArtifactStatus(p.id, 'approved');
    db.createWorktree({ project_id: projectId, branch: 'feat/x', path: '/tmp/wt' });

    const result = sm.advance(projectId);
    expect(result.success).toBe(true);
    expect(db.getProject(projectId)!.phase).toBe('execute');
  });

  it('rejects advance from execute if tasks not all approved', () => {
    // fast-forward to execute
    const d = db.createArtifact({ project_id: projectId, type: 'design', content: 'x' });
    db.updateArtifactStatus(d.id, 'approved');
    sm.advance(projectId); // → design
    sm.advance(projectId); // → plan
    const p = db.createArtifact({ project_id: projectId, type: 'plan', content: 'plan' });
    db.updateArtifactStatus(p.id, 'approved');
    db.createWorktree({ project_id: projectId, branch: 'feat/x', path: '/tmp/wt' });
    sm.advance(projectId); // → execute

    // add task that's still pending
    db.createTask({ project_id: projectId, task_number: 1, title: 'Task 1', description: 'Do stuff' });
    const result = sm.advance(projectId);
    expect(result.success).toBe(false);
    expect(result.reason).toContain('task');
  });

  it('cannot advance past done', () => {
    // We'll manually set phase to done for this test
    db.raw().prepare("UPDATE projects SET phase = 'done' WHERE id = ?").run(projectId);
    const result = sm.advance(projectId);
    expect(result.success).toBe(false);
    expect(result.reason).toContain('done');
  });
});
```

**Step 2: Run test, verify FAIL**

**Step 3: Implement state machine**

Create `engine/src/state.ts`:
```typescript
import type { GridDB } from './db.js';
import type { Phase } from './types.js';

const PHASE_ORDER: Phase[] = ['brainstorm', 'design', 'plan', 'execute', 'review', 'done'];

export interface AdvanceResult {
  success: boolean;
  from?: Phase;
  to?: Phase;
  reason?: string;
}

export class StateMachine {
  constructor(private db: GridDB) {}

  advance(projectId: string): AdvanceResult {
    const project = this.db.getProject(projectId);
    if (!project) return { success: false, reason: 'Project not found' };

    const currentIndex = PHASE_ORDER.indexOf(project.phase);
    if (currentIndex === PHASE_ORDER.length - 1) {
      return { success: false, reason: 'Project is already done' };
    }

    const gateCheck = this.checkGate(projectId, project.phase);
    if (!gateCheck.passed) {
      return { success: false, from: project.phase, reason: gateCheck.reason };
    }

    const nextPhase = PHASE_ORDER[currentIndex + 1];
    this.db.updateProjectPhase(projectId, nextPhase);
    this.db.createEvent({
      project_id: projectId,
      event_type: 'phase_change',
      details: JSON.stringify({ from: project.phase, to: nextPhase }),
    });

    return { success: true, from: project.phase, to: nextPhase };
  }

  private checkGate(projectId: string, phase: Phase): { passed: boolean; reason?: string } {
    switch (phase) {
      case 'brainstorm': {
        const designs = this.db.listArtifacts(projectId, 'design');
        const approved = designs.filter((a) => a.status === 'approved');
        if (approved.length === 0) {
          return { passed: false, reason: 'Need at least one approved design artifact' };
        }
        return { passed: true };
      }
      case 'design': {
        const designs = this.db.listArtifacts(projectId, 'design');
        const allApproved = designs.length > 0 && designs.every((a) => a.status === 'approved');
        if (!allApproved) {
          return { passed: false, reason: 'All design artifacts must be approved' };
        }
        return { passed: true };
      }
      case 'plan': {
        const plans = this.db.listArtifacts(projectId, 'plan');
        const approvedPlans = plans.filter((a) => a.status === 'approved');
        if (approvedPlans.length === 0) {
          return { passed: false, reason: 'Need an approved plan artifact' };
        }
        const worktrees = this.db.listWorktrees(projectId);
        const active = worktrees.filter((w) => w.status === 'active');
        if (active.length === 0) {
          return { passed: false, reason: 'Need an active worktree' };
        }
        return { passed: true };
      }
      case 'execute': {
        const tasks = this.db.listTasks(projectId);
        if (tasks.length === 0) {
          return { passed: false, reason: 'No tasks found' };
        }
        const allApproved = tasks.every((t) => t.status === 'approved');
        if (!allApproved) {
          return { passed: false, reason: 'All tasks must be approved (spec + quality reviews passed)' };
        }
        return { passed: true };
      }
      case 'review': {
        // Final review gate — checked by Evan manually
        return { passed: true };
      }
      default:
        return { passed: false, reason: `Unknown phase: ${phase}` };
    }
  }
}
```

Also add missing methods to `db.ts`:
```typescript
  updateProjectPhase(id: string, phase: Phase): void {
    const now = new Date().toISOString();
    this.db.prepare('UPDATE projects SET phase = ?, updated_at = ? WHERE id = ?')
      .run(phase, now, id);
  }

  createEvent(input: { project_id: string; event_type: string; details?: string }): void {
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO events (project_id, event_type, details, created_at)
      VALUES (?, ?, ?, ?)
    `).run(input.project_id, input.event_type, input.details ?? null, now);
  }

  listWorktrees(projectId: string): Worktree[] {
    return this.db.prepare(
      'SELECT * FROM worktrees WHERE project_id = ? ORDER BY created_at'
    ).all(projectId) as Worktree[];
  }

  createWorktree(input: { project_id: string; branch: string; path: string }): Worktree {
    const id = uuid();
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO worktrees (id, project_id, branch, path, status, created_at)
      VALUES (?, ?, ?, ?, 'active', ?)
    `).run(id, input.project_id, input.branch, input.path, now);
    return this.db.prepare('SELECT * FROM worktrees WHERE id = ?').get(id) as Worktree;
  }

  listTasks(projectId: string): Task[] {
    return this.db.prepare(
      'SELECT * FROM tasks WHERE project_id = ? ORDER BY task_number'
    ).all(projectId) as Task[];
  }

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
```

**Step 4: Run test, verify PASS**

---

### Task 5: Task management + review operations

**Files:**
- Modify: `engine/src/db.ts`
- Test: `engine/src/__tests__/tasks.test.ts`

**Step 1: Write failing tests**

Create `engine/src/__tests__/tasks.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GridDB } from '../db.js';
import fs from 'fs';
import path from 'path';

const TEST_DB = path.join(import.meta.dirname, '../../test-tasks.db');

describe('Tasks', () => {
  let db: GridDB;
  let projectId: string;

  beforeEach(() => {
    db = new GridDB(TEST_DB);
    projectId = db.createProject({ name: 'Test', repo_path: '/tmp' }).id;
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  });

  it('creates a task with pending status', () => {
    const task = db.createTask({
      project_id: projectId,
      task_number: 1,
      title: 'Setup',
      description: 'Initialize the project',
    });
    expect(task.status).toBe('pending');
    expect(task.task_number).toBe(1);
  });

  it('starts a task (sets in_progress + started_at)', () => {
    const task = db.createTask({
      project_id: projectId, task_number: 1, title: 'T', description: 'D',
    });
    db.startTask(task.id);
    const updated = db.getTask(task.id);
    expect(updated!.status).toBe('in_progress');
    expect(updated!.started_at).toBeTruthy();
  });

  it('updates task status', () => {
    const task = db.createTask({
      project_id: projectId, task_number: 1, title: 'T', description: 'D',
    });
    db.updateTaskStatus(task.id, 'review');
    expect(db.getTask(task.id)!.status).toBe('review');
  });

  it('records spec review', () => {
    const task = db.createTask({
      project_id: projectId, task_number: 1, title: 'T', description: 'D',
    });
    db.setTaskReview(task.id, 'spec', 'PASS: All requirements met');
    const updated = db.getTask(task.id);
    expect(updated!.spec_review).toContain('PASS');
  });

  it('records quality review', () => {
    const task = db.createTask({
      project_id: projectId, task_number: 1, title: 'T', description: 'D',
    });
    db.setTaskReview(task.id, 'quality', 'FAIL: Magic numbers');
    const updated = db.getTask(task.id);
    expect(updated!.quality_review).toContain('FAIL');
  });

  it('approves task and sets completed_at', () => {
    const task = db.createTask({
      project_id: projectId, task_number: 1, title: 'T', description: 'D',
    });
    db.startTask(task.id);
    db.approveTask(task.id);
    const updated = db.getTask(task.id);
    expect(updated!.status).toBe('approved');
    expect(updated!.completed_at).toBeTruthy();
  });

  it('sets agent session on task', () => {
    const task = db.createTask({
      project_id: projectId, task_number: 1, title: 'T', description: 'D',
    });
    db.setTaskAgent(task.id, 'session-abc-123');
    expect(db.getTask(task.id)!.agent_session).toBe('session-abc-123');
  });
});
```

**Step 2: Run test, verify FAIL**

**Step 3: Implement task operations in `db.ts`**

Add to `GridDB`:
```typescript
  getTask(id: string): Task | null {
    return this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task ?? null;
  }

  startTask(id: string): void {
    const now = new Date().toISOString();
    this.db.prepare(
      'UPDATE tasks SET status = ?, started_at = ? WHERE id = ?'
    ).run('in_progress', now, id);
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
    this.db.prepare(
      'UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?'
    ).run('approved', now, id);
  }

  setTaskAgent(id: string, sessionKey: string): void {
    this.db.prepare(
      'UPDATE tasks SET agent_session = ? WHERE id = ?'
    ).run(sessionKey, id);
  }
```

**Step 4: Run test, verify PASS**

---

### Task 6: Git worktree management

**Files:**
- Create: `engine/src/worktree.ts`
- Test: `engine/src/__tests__/worktree.test.ts`

**Step 1: Write failing tests**

Create `engine/src/__tests__/worktree.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorktreeManager } from '../worktree.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('WorktreeManager', () => {
  let repoDir: string;
  let wm: WorktreeManager;

  beforeEach(() => {
    // Create a temp git repo
    repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'grid-test-'));
    execSync('git init', { cwd: repoDir });
    execSync('git config user.email "test@test.com"', { cwd: repoDir });
    execSync('git config user.name "Test"', { cwd: repoDir });
    fs.writeFileSync(path.join(repoDir, 'README.md'), '# Test');
    execSync('git add . && git commit -m "init"', { cwd: repoDir });
    wm = new WorktreeManager(repoDir);
  });

  afterEach(() => {
    // Clean up worktrees before removing repo
    try {
      execSync('git worktree prune', { cwd: repoDir });
    } catch {}
    fs.rmSync(repoDir, { recursive: true, force: true });
  });

  it('creates a worktree on a new branch', () => {
    const wtPath = wm.create('feat/test');
    expect(fs.existsSync(wtPath)).toBe(true);
    expect(fs.existsSync(path.join(wtPath, 'README.md'))).toBe(true);
  });

  it('lists worktrees', () => {
    wm.create('feat/a');
    wm.create('feat/b');
    const list = wm.list();
    // main + 2 worktrees
    expect(list.length).toBeGreaterThanOrEqual(3);
  });

  it('removes a worktree', () => {
    const wtPath = wm.create('feat/remove-me');
    expect(fs.existsSync(wtPath)).toBe(true);
    wm.remove(wtPath);
    expect(fs.existsSync(wtPath)).toBe(false);
  });
});
```

**Step 2: Run test, verify FAIL**

**Step 3: Implement worktree manager**

Create `engine/src/worktree.ts`:
```typescript
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

export class WorktreeManager {
  constructor(private repoPath: string) {}

  create(branch: string): string {
    const safeBranch = branch.replace(/\//g, '-');
    const wtPath = path.join(path.dirname(this.repoPath), `.worktrees`, safeBranch);

    // Create parent dir if needed
    fs.mkdirSync(path.dirname(wtPath), { recursive: true });

    // Create branch and worktree
    execSync(`git worktree add -b "${branch}" "${wtPath}"`, {
      cwd: this.repoPath,
      stdio: 'pipe',
    });

    return wtPath;
  }

  list(): { path: string; branch: string; head: string }[] {
    const output = execSync('git worktree list --porcelain', {
      cwd: this.repoPath,
      encoding: 'utf-8',
    });

    const worktrees: { path: string; branch: string; head: string }[] = [];
    let current: any = {};

    for (const line of output.split('\n')) {
      if (line.startsWith('worktree ')) {
        if (current.path) worktrees.push(current);
        current = { path: line.slice(9) };
      } else if (line.startsWith('HEAD ')) {
        current.head = line.slice(5);
      } else if (line.startsWith('branch ')) {
        current.branch = line.slice(7).replace('refs/heads/', '');
      } else if (line === '') {
        if (current.path) worktrees.push(current);
        current = {};
      }
    }
    if (current.path) worktrees.push(current);

    return worktrees;
  }

  remove(wtPath: string): void {
    execSync(`git worktree remove "${wtPath}" --force`, {
      cwd: this.repoPath,
      stdio: 'pipe',
    });
  }
}
```

**Step 4: Run test, verify PASS**

---

### Task 7: Events / audit log

**Files:**
- Modify: `engine/src/db.ts`
- Test: `engine/src/__tests__/events.test.ts`

**Step 1: Write failing tests**

Create `engine/src/__tests__/events.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GridDB } from '../db.js';
import fs from 'fs';
import path from 'path';

const TEST_DB = path.join(import.meta.dirname, '../../test-events.db');

describe('Events', () => {
  let db: GridDB;
  let projectId: string;

  beforeEach(() => {
    db = new GridDB(TEST_DB);
    projectId = db.createProject({ name: 'Test', repo_path: '/tmp' }).id;
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  });

  it('creates and lists events', () => {
    db.createEvent({ project_id: projectId, event_type: 'phase_change', details: '{"from":"brainstorm","to":"design"}' });
    db.createEvent({ project_id: projectId, event_type: 'approval', details: '{"artifact":"abc"}' });

    const events = db.listEvents(projectId);
    expect(events).toHaveLength(2);
    expect(events[0].event_type).toBe('phase_change');
  });

  it('limits event results', () => {
    for (let i = 0; i < 10; i++) {
      db.createEvent({ project_id: projectId, event_type: 'task_update', details: `${i}` });
    }
    const events = db.listEvents(projectId, 5);
    expect(events).toHaveLength(5);
  });

  it('returns events in reverse chronological order', () => {
    db.createEvent({ project_id: projectId, event_type: 'phase_change', details: 'first' });
    db.createEvent({ project_id: projectId, event_type: 'approval', details: 'second' });

    const events = db.listEvents(projectId);
    expect(events[0].details).toBe('second');
    expect(events[1].details).toBe('first');
  });
});
```

**Step 2: Run test, verify FAIL**

**Step 3: Implement `listEvents` in `db.ts`**

```typescript
  listEvents(projectId: string, limit?: number): Event[] {
    const sql = limit
      ? 'SELECT * FROM events WHERE project_id = ? ORDER BY created_at DESC LIMIT ?'
      : 'SELECT * FROM events WHERE project_id = ? ORDER BY created_at DESC';
    return limit
      ? this.db.prepare(sql).all(projectId, limit) as Event[]
      : this.db.prepare(sql).all(projectId) as Event[];
  }
```

**Step 4: Run test, verify PASS**

---

### Task 8: CLI entry point

**Files:**
- Create: `engine/src/cli.ts`
- Test: `engine/src/__tests__/cli.test.ts`

**Step 1: Write failing tests**

Create `engine/src/__tests__/cli.test.ts`:
```typescript
import { describe, it, expect, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CLI = path.join(import.meta.dirname, '../cli.ts');
const TEST_DB = path.join(import.meta.dirname, '../../test-cli.db');

function grid(args: string): any {
  const result = execSync(`npx tsx ${CLI} ${args}`, {
    encoding: 'utf-8',
    env: { ...process.env, GRID_DB: TEST_DB },
  });
  return JSON.parse(result.trim());
}

describe('CLI', () => {
  afterEach(() => {
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  });

  it('creates a project', () => {
    const result = grid('project create --name "Test" --repo /tmp/repo');
    expect(result.name).toBe('Test');
    expect(result.phase).toBe('brainstorm');
  });

  it('lists projects', () => {
    grid('project create --name "A" --repo /tmp/a');
    grid('project create --name "B" --repo /tmp/b');
    const result = grid('project list');
    expect(result).toHaveLength(2);
  });

  it('shows project phase', () => {
    const p = grid('project create --name "Test" --repo /tmp/repo');
    const result = grid(`project phase ${p.id}`);
    expect(result.phase).toBe('brainstorm');
  });

  it('creates artifact and approves it', () => {
    const p = grid('project create --name "Test" --repo /tmp/repo');
    const a = grid(`artifact create ${p.id} --type design --content "# Design"`);
    expect(a.status).toBe('draft');

    const approved = grid(`artifact approve ${p.id} ${a.id}`);
    expect(approved.status).toBe('approved');
  });

  it('advances phase when gate is met', () => {
    const p = grid('project create --name "Test" --repo /tmp/repo');
    const a = grid(`artifact create ${p.id} --type design --content "# Design"`);
    grid(`artifact approve ${p.id} ${a.id}`);

    const result = grid(`advance ${p.id}`);
    expect(result.success).toBe(true);
    expect(result.to).toBe('design');
  });

  it('blocks advance when gate not met', () => {
    const p = grid('project create --name "Test" --repo /tmp/repo');
    const result = grid(`advance ${p.id}`);
    expect(result.success).toBe(false);
  });

  it('shows event log', () => {
    const p = grid('project create --name "Test" --repo /tmp/repo');
    const a = grid(`artifact create ${p.id} --type design --content "x"`);
    grid(`artifact approve ${p.id} ${a.id}`);
    grid(`advance ${p.id}`);

    const log = grid(`log ${p.id}`);
    expect(log.length).toBeGreaterThan(0);
    expect(log[0].event_type).toBe('phase_change');
  });
});
```

**Step 2: Run test, verify FAIL**

**Step 3: Implement CLI**

Create `engine/src/cli.ts`:
```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { GridDB } from './db.js';
import { StateMachine } from './state.js';
import { WorktreeManager } from './worktree.js';
import path from 'path';

const DEFAULT_DB = path.join(process.env.HOME ?? '~', 'workspace/mcp-projects/grid/grid.db');
const dbPath = process.env.GRID_DB ?? DEFAULT_DB;

const db = new GridDB(dbPath);
const sm = new StateMachine(db);

const program = new Command();
program.name('grid').version('0.1.0');

function output(data: any) {
  console.log(JSON.stringify(data, null, 2));
}

// --- Project commands ---
const project = program.command('project');

project.command('create')
  .requiredOption('--name <name>', 'Project name')
  .requiredOption('--repo <path>', 'Repository path')
  .action((opts) => {
    const p = db.createProject({ name: opts.name, repo_path: opts.repo });
    db.createEvent({ project_id: p.id, event_type: 'phase_change', details: JSON.stringify({ to: 'brainstorm' }) });
    output(p);
  });

project.command('list').action(() => {
  output(db.listProjects());
});

project.command('phase <id>').action((id) => {
  const p = db.getProject(id);
  if (!p) { output({ error: 'Project not found' }); process.exit(2); }
  output({ id: p.id, name: p.name, phase: p.phase });
});

project.command('set-model <id>')
  .requiredOption('--phase <phase>', 'Phase to configure')
  .requiredOption('--model <model>', 'Model alias')
  .action((id, opts) => {
    const p = db.getProject(id);
    if (!p) { output({ error: 'Project not found' }); process.exit(2); }
    const config = p.model_config ?? {};
    config[opts.phase] = opts.model;
    db.setModelConfig(id, config);
    output({ id, model_config: config });
  });

// --- Artifact commands ---
const artifact = program.command('artifact');

artifact.command('create <projectId>')
  .requiredOption('--type <type>', 'design or plan')
  .option('--content <content>', 'Markdown content')
  .option('--file <path>', 'Read content from file')
  .action((projectId, opts) => {
    const content = opts.file
      ? require('fs').readFileSync(opts.file, 'utf-8')
      : opts.content ?? '';
    const a = db.createArtifact({ project_id: projectId, type: opts.type, content, file_path: opts.file });
    output(a);
  });

artifact.command('approve <projectId> <artifactId>').action((projectId, artifactId) => {
  db.updateArtifactStatus(artifactId, 'approved');
  db.createEvent({ project_id: projectId, event_type: 'approval', details: JSON.stringify({ artifact_id: artifactId, status: 'approved' }) });
  output(db.getArtifact(artifactId));
});

artifact.command('reject <projectId> <artifactId>')
  .option('--feedback <text>', 'Rejection reason')
  .action((projectId, artifactId, opts) => {
    db.updateArtifactStatus(artifactId, 'rejected', opts.feedback);
    db.createEvent({ project_id: projectId, event_type: 'approval', details: JSON.stringify({ artifact_id: artifactId, status: 'rejected', feedback: opts.feedback }) });
    output(db.getArtifact(artifactId));
  });

artifact.command('status <projectId>')
  .option('--type <type>', 'Filter by type')
  .action((projectId, opts) => {
    output(db.listArtifacts(projectId, opts.type));
  });

// --- Worktree commands ---
const worktree = program.command('worktree');

worktree.command('create <projectId>')
  .requiredOption('--branch <branch>', 'Branch name')
  .action((projectId, opts) => {
    const p = db.getProject(projectId);
    if (!p) { output({ error: 'Project not found' }); process.exit(2); }
    const wm = new WorktreeManager(p.repo_path);
    const wtPath = wm.create(opts.branch);
    const wt = db.createWorktree({ project_id: projectId, branch: opts.branch, path: wtPath });
    output(wt);
  });

worktree.command('list <projectId>').action((projectId) => {
  output(db.listWorktrees(projectId));
});

worktree.command('cleanup <projectId>').action((projectId) => {
  const worktrees = db.listWorktrees(projectId);
  const p = db.getProject(projectId);
  if (!p) { output({ error: 'Project not found' }); process.exit(2); }
  const wm = new WorktreeManager(p.repo_path);
  const removed: string[] = [];
  for (const wt of worktrees) {
    if (wt.status === 'merged' || wt.status === 'discarded') {
      try { wm.remove(wt.path); } catch {}
      removed.push(wt.id);
    }
  }
  output({ removed });
});

// --- Task commands ---
const task = program.command('task');

task.command('list <projectId>').action((projectId) => {
  output(db.listTasks(projectId));
});

task.command('start <projectId> <taskNumber>').action((projectId, taskNumber) => {
  const tasks = db.listTasks(projectId);
  const t = tasks.find((t) => t.task_number === parseInt(taskNumber));
  if (!t) { output({ error: 'Task not found' }); process.exit(2); }
  db.startTask(t.id);
  db.createEvent({ project_id: projectId, event_type: 'task_update', details: JSON.stringify({ task: taskNumber, status: 'in_progress' }) });
  output(db.getTask(t.id));
});

task.command('update <projectId> <taskNumber>')
  .requiredOption('--status <status>', 'New status')
  .action((projectId, taskNumber, opts) => {
    const tasks = db.listTasks(projectId);
    const t = tasks.find((t) => t.task_number === parseInt(taskNumber));
    if (!t) { output({ error: 'Task not found' }); process.exit(2); }
    db.updateTaskStatus(t.id, opts.status);
    db.createEvent({ project_id: projectId, event_type: 'task_update', details: JSON.stringify({ task: taskNumber, status: opts.status }) });
    output(db.getTask(t.id));
  });

task.command('review <projectId> <taskNumber>')
  .requiredOption('--type <type>', 'spec or quality')
  .requiredOption('--result <result>', 'pass or fail')
  .option('--feedback <text>', 'Review feedback')
  .action((projectId, taskNumber, opts) => {
    const tasks = db.listTasks(projectId);
    const t = tasks.find((t) => t.task_number === parseInt(taskNumber));
    if (!t) { output({ error: 'Task not found' }); process.exit(2); }
    const resultText = opts.result === 'pass'
      ? `PASS${opts.feedback ? ': ' + opts.feedback : ''}`
      : `FAIL${opts.feedback ? ': ' + opts.feedback : ''}`;
    db.setTaskReview(t.id, opts.type, resultText);

    // Auto-approve if both reviews pass
    const updated = db.getTask(t.id)!;
    if (updated.spec_review?.startsWith('PASS') && updated.quality_review?.startsWith('PASS')) {
      db.approveTask(t.id);
    }

    db.createEvent({ project_id: projectId, event_type: 'review', details: JSON.stringify({ task: taskNumber, type: opts.type, result: opts.result }) });
    output(db.getTask(t.id));
  });

// --- Advance ---
program.command('advance <projectId>').action((projectId) => {
  const result = sm.advance(projectId);
  if (!result.success) process.exitCode = 1;
  output(result);
});

// --- Log ---
program.command('log <projectId>')
  .option('--limit <n>', 'Limit results', '20')
  .action((projectId, opts) => {
    output(db.listEvents(projectId, parseInt(opts.limit)));
  });

program.parse();
```

**Step 4: Run test, verify PASS**

---

### Task 9: Integration test — full workflow

**Files:**
- Test: `engine/src/__tests__/integration.test.ts`

**Step 1: Write full workflow test**

Create `engine/src/__tests__/integration.test.ts`:
```typescript
import { describe, it, expect, afterEach } from 'vitest';
import { GridDB } from '../db.js';
import { StateMachine } from '../state.js';
import fs from 'fs';
import path from 'path';

const TEST_DB = path.join(import.meta.dirname, '../../test-integration.db');

describe('Full workflow integration', () => {
  afterEach(() => {
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  });

  it('progresses through all phases', () => {
    const db = new GridDB(TEST_DB);
    const sm = new StateMachine(db);

    // 1. Create project
    const project = db.createProject({ name: 'Test Feature', repo_path: '/tmp/repo' });
    expect(project.phase).toBe('brainstorm');

    // 2. brainstorm → design (need approved design)
    const design = db.createArtifact({ project_id: project.id, type: 'design', content: '# Design' });
    db.updateArtifactStatus(design.id, 'approved');
    expect(sm.advance(project.id).success).toBe(true);
    expect(db.getProject(project.id)!.phase).toBe('design');

    // 3. design → plan (all designs approved — already done)
    expect(sm.advance(project.id).success).toBe(true);
    expect(db.getProject(project.id)!.phase).toBe('plan');

    // 4. plan → execute (need approved plan + worktree)
    const plan = db.createArtifact({ project_id: project.id, type: 'plan', content: '# Plan' });
    db.updateArtifactStatus(plan.id, 'approved');
    db.createWorktree({ project_id: project.id, branch: 'feat/test', path: '/tmp/wt' });
    expect(sm.advance(project.id).success).toBe(true);
    expect(db.getProject(project.id)!.phase).toBe('execute');

    // 5. execute → review (all tasks approved)
    const task1 = db.createTask({ project_id: project.id, task_number: 1, title: 'T1', description: 'D1' });
    const task2 = db.createTask({ project_id: project.id, task_number: 2, title: 'T2', description: 'D2' });

    // Can't advance yet
    expect(sm.advance(project.id).success).toBe(false);

    // Approve all tasks
    db.setTaskReview(task1.id, 'spec', 'PASS');
    db.setTaskReview(task1.id, 'quality', 'PASS');
    db.approveTask(task1.id);
    db.setTaskReview(task2.id, 'spec', 'PASS');
    db.setTaskReview(task2.id, 'quality', 'PASS');
    db.approveTask(task2.id);

    expect(sm.advance(project.id).success).toBe(true);
    expect(db.getProject(project.id)!.phase).toBe('review');

    // 6. review → done (final review = auto-pass for now)
    expect(sm.advance(project.id).success).toBe(true);
    expect(db.getProject(project.id)!.phase).toBe('done');

    // 7. Can't advance past done
    expect(sm.advance(project.id).success).toBe(false);

    // Check events
    const events = db.listEvents(project.id);
    expect(events.length).toBeGreaterThanOrEqual(5);

    db.close();
  });
});
```

**Step 2: Run test, verify PASS** (this should pass if all previous tasks are correct)

```bash
npx vitest run
```

Expected: All tests pass across all test files.

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Scaffold + DB init | package.json, tsconfig, db.ts, types.ts |
| 2 | Project CRUD | db.ts |
| 3 | Artifact CRUD | db.ts |
| 4 | State machine | state.ts |
| 5 | Task management | db.ts |
| 6 | Git worktrees | worktree.ts |
| 7 | Events/audit log | db.ts |
| 8 | CLI entry point | cli.ts |
| 9 | Integration test | integration.test.ts |

**Estimated time:** ~45-60 min with subagents.

**Execution:** Subagent-driven. Tasks 1-7 are independent after Task 1 scaffolding. Task 8 depends on all. Task 9 validates everything.
