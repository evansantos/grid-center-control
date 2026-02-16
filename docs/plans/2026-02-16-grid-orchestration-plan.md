# Grid Orchestration + Telegram Buttons — Implementation Plan

> **For MCP:** Execute using subagent-driven development. One subagent per task with two-stage review.

**Goal:** Add task batch creation, plan parsing, model lookup CLI commands + Telegram button handling.

**Architecture:** Extend engine CLI with new commands. Orchestration is MCP behavior (not code).

**Tech Stack:** TypeScript, better-sqlite3, vitest

---

### Task 1: Task batch creation command

**Files:**
- Modify: `engine/src/db.ts`
- Modify: `engine/src/cli.ts`
- Test: `engine/src/__tests__/task-batch.test.ts`

**Step 1: Write failing test**

Create `engine/src/__tests__/task-batch.test.ts`:
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GridDB } from '../db.js';
import fs from 'fs';
import path from 'path';

const TEST_DB = path.join(import.meta.dirname, '../../test-task-batch.db');

describe('Task batch operations', () => {
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

  it('creates multiple tasks in batch', () => {
    const tasks = [
      { task_number: 1, title: 'Setup', description: 'Init project' },
      { task_number: 2, title: 'CRUD', description: 'Add CRUD ops' },
      { task_number: 3, title: 'Tests', description: 'Write tests' },
    ];
    const created = db.createTaskBatch(projectId, tasks);
    expect(created).toHaveLength(3);
    expect(created[0].task_number).toBe(1);
    expect(created[2].task_number).toBe(3);
  });

  it('gets a batch of tasks by range', () => {
    for (let i = 1; i <= 6; i++) {
      db.createTask({ project_id: projectId, task_number: i, title: `T${i}`, description: `D${i}` });
    }
    const batch = db.getTaskBatch(projectId, 2, 4);
    expect(batch).toHaveLength(3);
    expect(batch[0].task_number).toBe(2);
    expect(batch[2].task_number).toBe(4);
  });

  it('gets model for a phase with defaults', () => {
    const model = db.getModelForPhase(projectId, 'execute');
    expect(model).toBe('sonnet');
  });

  it('gets model for a phase with override', () => {
    db.setModelConfig(projectId, { execute: 'opus' });
    const model = db.getModelForPhase(projectId, 'execute');
    expect(model).toBe('opus');
  });
});
```

**Step 2: Run test, verify FAIL**
```bash
cd engine && npx vitest run src/__tests__/task-batch.test.ts
```
Expected: FAIL — `createTaskBatch`, `getTaskBatch`, `getModelForPhase` don't exist.

**Step 3: Implement in `db.ts`**

Add to `GridDB` class:
```typescript
import { DEFAULT_MODEL_CONFIG } from './types.js';

  createTaskBatch(projectId: string, tasks: { task_number: number; title: string; description: string; artifact_id?: string; worktree_id?: string }[]): Task[] {
    const insert = this.db.prepare(`
      INSERT INTO tasks (id, project_id, artifact_id, worktree_id, task_number, title, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `);

    const created: Task[] = [];
    const transaction = this.db.transaction(() => {
      for (const t of tasks) {
        const id = uuid();
        insert.run(id, projectId, t.artifact_id ?? null, t.worktree_id ?? null, t.task_number, t.title, t.description);
        created.push(this.db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task);
      }
    });
    transaction();
    return created;
  }

  getTaskBatch(projectId: string, from: number, to: number): Task[] {
    return this.db.prepare(
      'SELECT * FROM tasks WHERE project_id = ? AND task_number >= ? AND task_number <= ? ORDER BY task_number'
    ).all(projectId, from, to) as Task[];
  }

  getModelForPhase(projectId: string, phase: string): string {
    const project = this.getProject(projectId);
    if (!project) return DEFAULT_MODEL_CONFIG[phase as Phase] ?? 'opus';
    if (project.model_config && project.model_config[phase]) {
      return project.model_config[phase];
    }
    return DEFAULT_MODEL_CONFIG[phase as Phase] ?? 'opus';
  }
```

**Step 4: Run test, verify PASS**

---

### Task 2: Plan parser

**Files:**
- Create: `engine/src/parser.ts`
- Test: `engine/src/__tests__/parser.test.ts`

**Step 1: Write failing test**

Create `engine/src/__tests__/parser.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { parsePlan } from '../parser.js';

const SAMPLE_PLAN = `# Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans.

**Goal:** Build something cool

**Architecture:** Simple and clean

**Tech Stack:** TypeScript, Node.js

---

### Task 1: Project scaffold

**Files:**
- Create: \`src/index.ts\`
- Test: \`src/__tests__/index.test.ts\`

**Step 1: Write failing test**

\`\`\`typescript
test('it works', () => {
  expect(true).toBe(true);
});
\`\`\`

**Step 2: Run test, verify FAIL**

**Step 3: Implement**

\`\`\`typescript
export function hello() { return 'world'; }
\`\`\`

**Step 4: Run test, verify PASS**

---

### Task 2: Add CRUD operations

**Files:**
- Modify: \`src/db.ts\`
- Test: \`src/__tests__/db.test.ts\`

**Step 1: Write failing test**

Some test content here.

**Step 2: Implement**

Some implementation.

---

### Task 3: Wire up CLI

**Files:**
- Create: \`src/cli.ts\`

Just a simple task.
`;

describe('parsePlan', () => {
  it('extracts all tasks from plan markdown', () => {
    const tasks = parsePlan(SAMPLE_PLAN);
    expect(tasks).toHaveLength(3);
  });

  it('extracts task numbers and titles', () => {
    const tasks = parsePlan(SAMPLE_PLAN);
    expect(tasks[0].task_number).toBe(1);
    expect(tasks[0].title).toBe('Project scaffold');
    expect(tasks[1].task_number).toBe(2);
    expect(tasks[1].title).toBe('Add CRUD operations');
    expect(tasks[2].task_number).toBe(3);
    expect(tasks[2].title).toBe('Wire up CLI');
  });

  it('extracts full task description including steps', () => {
    const tasks = parsePlan(SAMPLE_PLAN);
    expect(tasks[0].description).toContain('Write failing test');
    expect(tasks[0].description).toContain('verify PASS');
    expect(tasks[0].description).toContain('```typescript');
  });

  it('returns empty array for plan with no tasks', () => {
    const tasks = parsePlan('# Just a header\nNo tasks here.');
    expect(tasks).toHaveLength(0);
  });
});
```

**Step 2: Run test, verify FAIL**

**Step 3: Implement parser**

Create `engine/src/parser.ts`:
```typescript
export interface ParsedTask {
  task_number: number;
  title: string;
  description: string;
}

export function parsePlan(markdown: string): ParsedTask[] {
  const tasks: ParsedTask[] = [];
  const taskRegex = /^### Task (\d+):\s*(.+)$/gm;
  const matches: { index: number; number: number; title: string }[] = [];

  let match;
  while ((match = taskRegex.exec(markdown)) !== null) {
    matches.push({
      index: match.index,
      number: parseInt(match[1]),
      title: match[2].trim(),
    });
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = i + 1 < matches.length ? matches[i + 1].index : markdown.length;
    const fullSection = markdown.slice(start, end).trim();
    // Remove the ### Task N: Title line from description
    const firstNewline = fullSection.indexOf('\n');
    const description = firstNewline >= 0 ? fullSection.slice(firstNewline + 1).trim() : '';

    tasks.push({
      task_number: matches[i].number,
      title: matches[i].title,
      description,
    });
  }

  return tasks;
}
```

**Step 4: Run test, verify PASS**

---

### Task 3: CLI commands for batch + parse + model

**Files:**
- Modify: `engine/src/cli.ts`
- Test: `engine/src/__tests__/cli-extended.test.ts`

**Step 1: Write failing test**

Create `engine/src/__tests__/cli-extended.test.ts`:
```typescript
import { describe, it, expect, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const CLI = path.join(import.meta.dirname, '../cli.ts');
const TEST_DB = path.join(import.meta.dirname, '../../test-cli-ext.db');

function grid(args: string): any {
  const result = execSync(`npx tsx ${CLI} ${args}`, {
    encoding: 'utf-8',
    env: { ...process.env, GRID_DB: TEST_DB },
  });
  return JSON.parse(result.trim());
}

const PLAN_PATH = path.join(import.meta.dirname, '../../test-plan.md');
const PLAN_CONTENT = `# Test Plan

---

### Task 1: Setup

Step 1: Do stuff

### Task 2: Build

Step 1: Build stuff

### Task 3: Test

Step 1: Test stuff
`;

describe('CLI extended commands', () => {
  afterEach(() => {
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
    if (fs.existsSync(PLAN_PATH)) fs.unlinkSync(PLAN_PATH);
  });

  it('parses plan and creates tasks', () => {
    fs.writeFileSync(PLAN_PATH, PLAN_CONTENT);
    const p = grid('project create --name "Test" --repo /tmp/repo');
    const result = grid(`task parse ${p.id} --file ${PLAN_PATH}`);
    expect(result.tasks_created).toBe(3);
    
    const tasks = grid(`task list ${p.id}`);
    expect(tasks).toHaveLength(3);
    expect(tasks[0].title).toBe('Setup');
  });

  it('gets task batch', () => {
    const p = grid('project create --name "Test" --repo /tmp/repo');
    fs.writeFileSync(PLAN_PATH, PLAN_CONTENT);
    grid(`task parse ${p.id} --file ${PLAN_PATH}`);
    
    const batch = grid(`task batch ${p.id} --from 1 --to 2`);
    expect(batch).toHaveLength(2);
  });

  it('gets model for phase', () => {
    const p = grid('project create --name "Test" --repo /tmp/repo');
    const result = grid(`project model ${p.id} --phase execute`);
    expect(result.model).toBe('sonnet');
  });

  it('gets overridden model for phase', () => {
    const p = grid('project create --name "Test" --repo /tmp/repo');
    grid(`project set-model ${p.id} --phase execute --model opus`);
    const result = grid(`project model ${p.id} --phase execute`);
    expect(result.model).toBe('opus');
  });
});
```

**Step 2: Run test, verify FAIL**

**Step 3: Add CLI commands to `cli.ts`**

Add after existing task commands:
```typescript
import { parsePlan } from './parser.js';

task.command('parse <projectId>')
  .requiredOption('--file <path>', 'Plan markdown file')
  .option('--artifact <id>', 'Link to plan artifact')
  .option('--worktree <id>', 'Link to worktree')
  .action((projectId, opts) => {
    const content = fs.readFileSync(opts.file, 'utf-8');
    const parsed = parsePlan(content);
    const tasks = db.createTaskBatch(projectId, parsed.map((t) => ({
      ...t,
      artifact_id: opts.artifact,
      worktree_id: opts.worktree,
    })));
    output({ tasks_created: tasks.length, tasks: tasks.map((t) => ({ number: t.task_number, title: t.title })) });
  });

task.command('batch <projectId>')
  .requiredOption('--from <n>', 'Start task number')
  .requiredOption('--to <n>', 'End task number')
  .action((projectId, opts) => {
    output(db.getTaskBatch(projectId, parseInt(opts.from), parseInt(opts.to)));
  });

// Add under project commands:
project.command('model <id>')
  .requiredOption('--phase <phase>', 'Phase to query')
  .action((id, opts) => {
    const model = db.getModelForPhase(id, opts.phase);
    output({ id, phase: opts.phase, model });
  });
```

**Step 4: Run test, verify PASS**

---

### Task 4: Telegram button callback parser

**Files:**
- Create: `engine/src/callbacks.ts`
- Test: `engine/src/__tests__/callbacks.test.ts`

**Step 1: Write failing test**

Create `engine/src/__tests__/callbacks.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { parseGridCallback, formatButtons } from '../callbacks.js';

describe('Grid callbacks', () => {
  it('parses approve callback', () => {
    const result = parseGridCallback('grid:approve:abc-123');
    expect(result).toEqual({ action: 'approve', id: 'abc-123' });
  });

  it('parses reject callback', () => {
    const result = parseGridCallback('grid:reject:abc-123');
    expect(result).toEqual({ action: 'reject', id: 'abc-123' });
  });

  it('parses view callback', () => {
    const result = parseGridCallback('grid:view:abc-123');
    expect(result).toEqual({ action: 'view', id: 'abc-123' });
  });

  it('parses continue callback', () => {
    const result = parseGridCallback('grid:continue:abc-123');
    expect(result).toEqual({ action: 'continue', id: 'abc-123' });
  });

  it('parses pause callback', () => {
    const result = parseGridCallback('grid:pause:abc-123');
    expect(result).toEqual({ action: 'pause', id: 'abc-123' });
  });

  it('returns null for non-grid messages', () => {
    expect(parseGridCallback('hello')).toBeNull();
    expect(parseGridCallback('grid:')).toBeNull();
    expect(parseGridCallback('grid:unknown:id')).toBeNull();
  });

  it('formats approval buttons', () => {
    const buttons = formatButtons('approval', 'artifact-123', 'project-456');
    expect(buttons).toHaveLength(1); // one row
    expect(buttons[0]).toHaveLength(3); // three buttons
    expect(buttons[0][0].text).toBe('✅ Approve');
    expect(buttons[0][0].callback_data).toBe('grid:approve:artifact-123');
    expect(buttons[0][2].callback_data).toContain('grid:view:project-456');
  });

  it('formats checkpoint buttons', () => {
    const buttons = formatButtons('checkpoint', 'project-456');
    expect(buttons[0]).toHaveLength(3);
    expect(buttons[0][0].text).toBe('▶️ Continue');
    expect(buttons[0][1].text).toBe('⏸ Pause');
  });
});
```

**Step 2: Run test, verify FAIL**

**Step 3: Implement callbacks**

Create `engine/src/callbacks.ts`:
```typescript
type CallbackAction = 'approve' | 'reject' | 'view' | 'continue' | 'pause';

const VALID_ACTIONS: CallbackAction[] = ['approve', 'reject', 'view', 'continue', 'pause'];

export interface GridCallback {
  action: CallbackAction;
  id: string;
}

export interface InlineButton {
  text: string;
  callback_data: string;
}

export function parseGridCallback(message: string): GridCallback | null {
  if (!message.startsWith('grid:')) return null;
  const parts = message.split(':');
  if (parts.length !== 3) return null;
  const action = parts[1] as CallbackAction;
  if (!VALID_ACTIONS.includes(action)) return null;
  const id = parts[2];
  if (!id) return null;
  return { action, id };
}

export function formatButtons(type: 'approval' | 'checkpoint', ...ids: string[]): InlineButton[][] {
  if (type === 'approval') {
    const [artifactId, projectId] = ids;
    return [[
      { text: '✅ Approve', callback_data: `grid:approve:${artifactId}` },
      { text: '❌ Revise', callback_data: `grid:reject:${artifactId}` },
      { text: '💬 Dashboard', callback_data: `grid:view:${projectId}` },
    ]];
  }

  if (type === 'checkpoint') {
    const [projectId] = ids;
    return [[
      { text: '▶️ Continue', callback_data: `grid:continue:${projectId}` },
      { text: '⏸ Pause', callback_data: `grid:pause:${projectId}` },
      { text: '🔍 Dashboard', callback_data: `grid:view:${projectId}` },
    ]];
  }

  return [];
}
```

**Step 4: Run test, verify PASS**

---

## Summary

| Task | What | Files |
|------|------|-------|
| 1 | Task batch + model lookup | db.ts |
| 2 | Plan markdown parser | parser.ts |
| 3 | Extended CLI commands | cli.ts |
| 4 | Telegram callback parser + button formatter | callbacks.ts |

**Estimated time:** ~20 min with subagents (4 small tasks)

**After these tasks:** No more engine code needed. Orchestration is my behavior — I use `sessions_spawn`, `grid` CLI, and `message` tool with buttons. That part is just me following the protocol.
