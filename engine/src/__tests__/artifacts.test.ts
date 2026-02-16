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
