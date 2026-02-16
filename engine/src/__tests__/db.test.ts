import { describe, it, expect, afterEach } from 'vitest';
import { GridDB } from '../db.js';
import fs from 'fs';
import path from 'path';

const TEST_DB = path.join(import.meta.dirname, '../../test.db');

describe('GridDB', () => {
  afterEach(() => {
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  });

  it('creates database with all tables', () => {
    const db = new GridDB(TEST_DB);
    const tables = db.raw()
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[];
    const names = tables.map((t) => t.name);

    expect(names).toContain('projects');
    expect(names).toContain('artifacts');
    expect(names).toContain('worktrees');
    expect(names).toContain('tasks');
    expect(names).toContain('events');
    db.close();
  });
});
