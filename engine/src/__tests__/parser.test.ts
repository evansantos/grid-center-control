import { describe, it, expect } from 'vitest';
import { parsePlan } from '../parser.js';

const SAMPLE_PLAN = `# Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL

**Goal:** Build something cool

---

### Task 1: Project scaffold

**Files:**
- Create: \`src/index.ts\`

**Step 1: Write failing test**

\`\`\`typescript
test('works', () => { expect(true).toBe(true); });
\`\`\`

**Step 2: Implement**

\`\`\`typescript
export function hello() { return 'world'; }
\`\`\`

---

### Task 2: Add CRUD operations

**Files:**
- Modify: \`src/db.ts\`

Some content here.

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
    expect(tasks[0].description).toContain('Implement');
  });

  it('returns empty array for plan with no tasks', () => {
    const tasks = parsePlan('# Just a header\nNo tasks here.');
    expect(tasks).toHaveLength(0);
  });

  it('ignores task headers inside code fences', () => {
    const plan = `# Plan

### Task 1: Real task

Description with example:

\`\`\`markdown
### Task 1: Fake task inside code

This should be ignored.

### Task 2: Also fake

Also ignored.
\`\`\`

### Task 2: Another real task

Real description.
`;
    const tasks = parsePlan(plan);
    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe('Real task');
    expect(tasks[1].title).toBe('Another real task');
  });
});
