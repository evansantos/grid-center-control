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

    // 2. brainstorm → design
    const design = db.createArtifact({ project_id: project.id, type: 'design', content: '# Design' });
    db.updateArtifactStatus(design.id, 'approved');
    expect(sm.advance(project.id).success).toBe(true);
    expect(db.getProject(project.id)!.phase).toBe('design');

    // 3. design → plan
    expect(sm.advance(project.id).success).toBe(true);
    expect(db.getProject(project.id)!.phase).toBe('plan');

    // 4. plan → execute
    const plan = db.createArtifact({ project_id: project.id, type: 'plan', content: '# Plan' });
    db.updateArtifactStatus(plan.id, 'approved');
    db.createWorktree({ project_id: project.id, branch: 'feat/test', path: '/tmp/wt' });
    expect(sm.advance(project.id).success).toBe(true);
    expect(db.getProject(project.id)!.phase).toBe('execute');

    // 5. execute → review
    const task1 = db.createTask({ project_id: project.id, task_number: 1, title: 'T1', description: 'D1' });
    const task2 = db.createTask({ project_id: project.id, task_number: 2, title: 'T2', description: 'D2' });

    expect(sm.advance(project.id).success).toBe(false);

    db.setTaskReview(task1.id, 'spec', 'PASS');
    db.setTaskReview(task1.id, 'quality', 'PASS');
    db.approveTask(task1.id);
    db.setTaskReview(task2.id, 'spec', 'PASS');
    db.setTaskReview(task2.id, 'quality', 'PASS');
    db.approveTask(task2.id);

    expect(sm.advance(project.id).success).toBe(true);
    expect(db.getProject(project.id)!.phase).toBe('review');

    // 6. review → done
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
