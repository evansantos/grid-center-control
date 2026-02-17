-- SQLite doesn't support ADD CONSTRAINT on existing tables
-- We need to recreate tables with CHECK constraints
-- For safety, we add CHECK constraints via triggers instead

-- Task status validation trigger
CREATE TRIGGER IF NOT EXISTS check_task_status
BEFORE INSERT ON tasks
BEGIN
  SELECT CASE
    WHEN NEW.status NOT IN ('pending', 'in_progress', 'review', 'done', 'failed')
    THEN RAISE(ABORT, 'Invalid task status')
  END;
END;

CREATE TRIGGER IF NOT EXISTS check_task_status_update
BEFORE UPDATE OF status ON tasks
BEGIN
  SELECT CASE
    WHEN NEW.status NOT IN ('pending', 'in_progress', 'review', 'done', 'failed')
    THEN RAISE(ABORT, 'Invalid task status')
  END;
END;

-- Project phase validation trigger
CREATE TRIGGER IF NOT EXISTS check_project_phase
BEFORE INSERT ON projects
BEGIN
  SELECT CASE
    WHEN NEW.phase NOT IN ('brainstorm', 'design', 'plan', 'execute', 'review', 'done')
    THEN RAISE(ABORT, 'Invalid project phase')
  END;
END;

CREATE TRIGGER IF NOT EXISTS check_project_phase_update
BEFORE UPDATE OF phase ON projects
BEGIN
  SELECT CASE
    WHEN NEW.phase NOT IN ('brainstorm', 'design', 'plan', 'execute', 'review', 'done')
    THEN RAISE(ABORT, 'Invalid project phase')
  END;
END;
