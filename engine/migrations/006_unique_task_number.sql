CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_unique_project_number ON tasks(project_id, task_number);
