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
