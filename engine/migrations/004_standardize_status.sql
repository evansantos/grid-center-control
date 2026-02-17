-- Standardize task status: in-progress → in_progress
UPDATE tasks SET status = 'in_progress' WHERE status = 'in-progress';
