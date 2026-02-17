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
  }
  return db;
}
