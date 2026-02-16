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
    const a1 = db.createArtifact({ project_id: projectId, type: 'design', content: 'x' });
    db.updateArtifactStatus(a1.id, 'approved');
    sm.advance(projectId); // → design

    db.createArtifact({ project_id: projectId, type: 'design', content: 'y' });
    const result = sm.advance(projectId);
    expect(result.success).toBe(false);
  });

  it('advances from plan to execute with approved plan + worktree', () => {
    const d = db.createArtifact({ project_id: projectId, type: 'design', content: 'x' });
    db.updateArtifactStatus(d.id, 'approved');
    sm.advance(projectId); // → design
    sm.advance(projectId); // → plan

    const p = db.createArtifact({ project_id: projectId, type: 'plan', content: 'plan' });
    db.updateArtifactStatus(p.id, 'approved');
    db.createWorktree({ project_id: projectId, branch: 'feat/x', path: '/tmp/wt' });

    const result = sm.advance(projectId);
    expect(result.success).toBe(true);
    expect(db.getProject(projectId)!.phase).toBe('execute');
  });

  it('rejects advance from execute if tasks not all approved', () => {
    const d = db.createArtifact({ project_id: projectId, type: 'design', content: 'x' });
    db.updateArtifactStatus(d.id, 'approved');
    sm.advance(projectId); // → design
    sm.advance(projectId); // → plan
    const p = db.createArtifact({ project_id: projectId, type: 'plan', content: 'plan' });
    db.updateArtifactStatus(p.id, 'approved');
    db.createWorktree({ project_id: projectId, branch: 'feat/x', path: '/tmp/wt' });
    sm.advance(projectId); // → execute

    db.createTask({ project_id: projectId, task_number: 1, title: 'Task 1', description: 'Do stuff' });
    const result = sm.advance(projectId);
    expect(result.success).toBe(false);
    expect(result.reason).toContain('task');
  });

  it('cannot advance past done', () => {
    db.raw().prepare("UPDATE projects SET phase = 'done' WHERE id = ?").run(projectId);
    const result = sm.advance(projectId);
    expect(result.success).toBe(false);
    expect(result.reason).toContain('done');
  });
});
