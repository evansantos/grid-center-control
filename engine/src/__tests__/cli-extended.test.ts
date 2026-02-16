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
