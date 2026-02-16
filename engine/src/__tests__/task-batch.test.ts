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
