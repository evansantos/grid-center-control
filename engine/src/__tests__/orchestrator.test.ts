import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GridDB } from '../db.js';
import { Orchestrator } from '../orchestrator.js';
import fs from 'fs';
import path from 'path';

const TEST_DB = path.join(import.meta.dirname ?? __dirname, '../../test-orch.db');

describe('Orchestrator', () => {
  let db: GridDB;
  let orch: Orchestrator;
  let projectId: string;

  beforeEach(() => {
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
    db = new GridDB(TEST_DB);
    orch = new Orchestrator(db);

    const project = db.createProject({ name: 'Test', repo_path: '/tmp/test' });
    projectId = project.id;

    // Create some tasks
    db.createTaskBatch(projectId, [
      { task_number: 1, title: 'Scaffolding', description: 'Setup project' },
      { task_number: 2, title: 'Server', description: 'Build server' },
      { task_number: 3, title: 'Client', description: 'Build client' },
      { task_number: 4, title: 'Integration', description: 'Wire up' },
      { task_number: 5, title: 'Polish', description: 'Final touches' },
    ]);
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  });

  describe('getProgress', () => {
    it('returns correct counts for all pending', () => {
      const progress = orch.getProgress(projectId);
      expect(progress).toEqual({ done: 0, total: 5, pending: 5, inProgress: 0 });
    });

    it('counts done and approved as complete', () => {
      const tasks = db.listTasks(projectId);
      db.updateTaskStatus(tasks[0].id, 'done');
      db.updateTaskStatus(tasks[1].id, 'approved');
      const progress = orch.getProgress(projectId);
      expect(progress.done).toBe(2);
    });
  });

  describe('getNextBatch', () => {
    it('returns first batch of pending tasks', () => {
      const batch = orch.getNextBatch(projectId, 3);
      expect(batch).not.toBeNull();
      expect(batch!.tasks).toHaveLength(3);
      expect(batch!.tasks.map(t => t.task_number)).toEqual([1, 2, 3]);
      expect(batch!.parallel).toBe(true);
    });

    it('returns null when tasks are in progress', () => {
      const tasks = db.listTasks(projectId);
      db.updateTaskStatus(tasks[0].id, 'in-progress');
      const batch = orch.getNextBatch(projectId);
      expect(batch).toBeNull();
    });

    it('returns remaining tasks after some complete', () => {
      const tasks = db.listTasks(projectId);
      db.updateTaskStatus(tasks[0].id, 'approved');
      db.updateTaskStatus(tasks[1].id, 'approved');
      db.updateTaskStatus(tasks[2].id, 'approved');
      const batch = orch.getNextBatch(projectId, 3);
      expect(batch!.tasks.map(t => t.task_number)).toEqual([4, 5]);
    });

    it('returns null when all tasks done', () => {
      const tasks = db.listTasks(projectId);
      tasks.forEach(t => db.updateTaskStatus(t.id, 'approved'));
      const batch = orch.getNextBatch(projectId);
      expect(batch).toBeNull();
    });
  });

  describe('completeTask', () => {
    it('marks task as approved with passing reviews', () => {
      const task = orch.completeTask(projectId, 1, 'pass', 'All tests green');
      expect(task.status).toBe('approved');
      expect(task.spec_review).toContain('PASS');
      expect(task.quality_review).toContain('PASS');
      expect(task.completed_at).toBeTruthy();
    });

    it('marks task as failed on failure', () => {
      const task = orch.completeTask(projectId, 1, 'fail', 'Tests broken');
      expect(task.status).toBe('failed');
      expect(task.spec_review).toContain('FAIL');
    });
  });

  describe('startBatch', () => {
    it('marks tasks as in-progress', () => {
      orch.startBatch(projectId, [1, 2, 3]);
      const tasks = db.listTasks(projectId);
      expect(tasks[0].status).toBe('in-progress');
      expect(tasks[1].status).toBe('in-progress');
      expect(tasks[2].status).toBe('in-progress');
      expect(tasks[3].status).toBe('pending');
    });
  });

  describe('status', () => {
    it('recommends spawning when tasks are pending', () => {
      const result = orch.status(projectId);
      expect(result.action).toBe('spawn_batch');
      expect(result.batch).toBeTruthy();
      expect(result.telegramButtons).toBeTruthy();
    });

    it('shows waiting when tasks in progress', () => {
      const tasks = db.listTasks(projectId);
      db.updateTaskStatus(tasks[0].id, 'in-progress');
      const result = orch.status(projectId);
      expect(result.action).toBe('waiting');
    });

    it('shows all_done when complete', () => {
      const tasks = db.listTasks(projectId);
      tasks.forEach(t => db.updateTaskStatus(t.id, 'approved'));
      const result = orch.status(projectId);
      expect(result.action).toBe('all_done');
      expect(result.telegramButtons).toBeTruthy();
    });
  });

  describe('progressMessage', () => {
    it('generates visual progress', () => {
      const tasks = db.listTasks(projectId);
      db.updateTaskStatus(tasks[0].id, 'approved');
      db.updateTaskStatus(tasks[1].id, 'in-progress');

      const msg = orch.progressMessage(projectId);
      expect(msg).toContain('Test');
      expect(msg).toContain('🟢');
      expect(msg).toContain('🔵');
      expect(msg).toContain('⚪');
    });
  });
});
