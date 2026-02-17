# Migrations

SQL migration files for the Grid engine database.

## Format

- Files: `NNN_description.sql` (e.g., `001_create_migrations.sql`)
- Version is extracted from the numeric prefix (e.g., `001` → version 1)
- Migrations run in filename order, inside transactions
- Already-applied migrations are skipped (idempotent)

## Adding a Migration

1. Create a new `.sql` file with the next version number
2. Write standard SQLite SQL statements
3. The migration runner will pick it up automatically on next startup
