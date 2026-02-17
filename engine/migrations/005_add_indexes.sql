CREATE INDEX IF NOT EXISTS idx_artifacts_project ON artifacts(project_id, type);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id, task_number);
CREATE INDEX IF NOT EXISTS idx_worktrees_project ON worktrees(project_id);
CREATE INDEX IF NOT EXISTS idx_events_project ON events(project_id, id);
