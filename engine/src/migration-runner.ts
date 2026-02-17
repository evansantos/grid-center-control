import type { Database as DatabaseType } from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const MIGRATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS _migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TEXT NOT NULL
);
`;

/**
 * Run all pending SQL migrations from the given directory.
 * Safe to call multiple times (idempotent).
 */
export function runMigrations(db: DatabaseType, migrationsDir?: string): void {
  const dir = migrationsDir ?? path.join(import.meta.dirname, '..', 'migrations');

  // Ensure tracking table exists
  db.exec(MIGRATIONS_TABLE);

  // Read and sort migration files
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) return;

  // Get already-applied versions
  const applied = new Set(
    (db.prepare('SELECT version FROM _migrations').all() as { version: number }[])
      .map(r => r.version)
  );

  for (const file of files) {
    const match = file.match(/^(\d+)/);
    if (!match) continue;

    const version = parseInt(match[1], 10);
    if (applied.has(version)) continue;

    const sql = fs.readFileSync(path.join(dir, file), 'utf-8');

    const migrate = db.transaction(() => {
      db.exec(sql);
      db.prepare('INSERT INTO _migrations (version, name, applied_at) VALUES (?, ?, ?)')
        .run(version, file, new Date().toISOString());
    });

    migrate();
  }
}
