import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorktreeManager } from '../worktree.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('WorktreeManager', () => {
  let repoDir: string;
  let wm: WorktreeManager;

  beforeEach(() => {
    repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'grid-test-'));
    execSync('git init', { cwd: repoDir });
    execSync('git config user.email "test@test.com"', { cwd: repoDir });
    execSync('git config user.name "Test"', { cwd: repoDir });
    fs.writeFileSync(path.join(repoDir, 'README.md'), '# Test');
    execSync('git add . && git commit -m "init"', { cwd: repoDir });
    wm = new WorktreeManager(repoDir);
  });

  afterEach(() => {
    try {
      execSync('git worktree prune', { cwd: repoDir });
      // Remove worktree dirs
      const wtDir = path.join(path.dirname(repoDir), '.worktrees');
      if (fs.existsSync(wtDir)) fs.rmSync(wtDir, { recursive: true, force: true });
    } catch {}
    fs.rmSync(repoDir, { recursive: true, force: true });
  });

  it('creates a worktree on a new branch', () => {
    const wtPath = wm.create('feat/test');
    expect(fs.existsSync(wtPath)).toBe(true);
    expect(fs.existsSync(path.join(wtPath, 'README.md'))).toBe(true);
  });

  it('lists worktrees', () => {
    wm.create('feat/a');
    wm.create('feat/b');
    const list = wm.list();
    expect(list.length).toBeGreaterThanOrEqual(3);
  });

  it('removes a worktree', () => {
    const wtPath = wm.create('feat/remove-me');
    expect(fs.existsSync(wtPath)).toBe(true);
    wm.remove(wtPath);
    expect(fs.existsSync(wtPath)).toBe(false);
  });
});
