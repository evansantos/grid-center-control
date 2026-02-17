import Database from 'better-sqlite3';
import path from 'path';
import os from 'os';

const DB_PATH = process.env.GRID_DB ?? path.join(os.homedir(), 'workspace/mcp-projects/grid/grid.db');

let db: Database.Database | null = null;

export function getDB(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH, { readonly: false });
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Check foreign key integrity on startup
    const fkViolations = db.pragma('foreign_key_check');
    if (Array.isArray(fkViolations) && fkViolations.length > 0) {
      console.warn(`[db] foreign_key_check found ${fkViolations.length} violation(s):`, fkViolations);
    }

    // Ensure indexes exist
    db.exec(`CREATE INDEX IF NOT EXISTS idx_artifacts_project ON artifacts(project_id, type)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id, task_number)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_worktrees_project ON worktrees(project_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_events_project ON events(project_id, id)`);
  }
  return db;
}
