import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GridDB } from '../db.js';
import fs from 'fs';
import path from 'path';

const TEST_DB = path.join(import.meta.dirname, '../../test-projects.db');

describe('Projects', () => {
  let db: GridDB;

  beforeEach(() => {
    db = new GridDB(TEST_DB);
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  });

  it('creates a project with default phase brainstorm', () => {
    const project = db.createProject({ name: 'Test', repo_path: '/tmp/repo' });
    expect(project.name).toBe('Test');
    expect(project.repo_path).toBe('/tmp/repo');
    expect(project.phase).toBe('brainstorm');
    expect(project.id).toBeTruthy();
  });

  it('lists all projects', () => {
    db.createProject({ name: 'A', repo_path: '/tmp/a' });
    db.createProject({ name: 'B', repo_path: '/tmp/b' });
    const projects = db.listProjects();
    expect(projects).toHaveLength(2);
  });

  it('gets a project by id', () => {
    const created = db.createProject({ name: 'Test', repo_path: '/tmp/repo' });
    const found = db.getProject(created.id);
    expect(found).toBeTruthy();
    expect(found!.name).toBe('Test');
  });

  it('returns null for unknown project', () => {
    const found = db.getProject('nonexistent');
    expect(found).toBeNull();
  });

  it('sets model config', () => {
    const project = db.createProject({ name: 'Test', repo_path: '/tmp/repo' });
    db.setModelConfig(project.id, { execute: 'sonnet' });
    const updated = db.getProject(project.id);
    expect(updated!.model_config).toEqual({ execute: 'sonnet' });
  });
});
