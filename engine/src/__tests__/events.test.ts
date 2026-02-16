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
    expect(events[0].event_type).toBe('approval');
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
