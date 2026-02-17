import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

interface KanbanTask {
  id: string;
  title: string;
  status: string;
  taskNumber: number;
  description: string;
  agentSession: string | null;
  projectId: string;
}

type Columns = Record<string, KanbanTask[]>;

export async function GET() {
  const columns: Columns = { pending: [], in_progress: [], review: [], done: [] };

  try {
    const db = getDB();
    const rows = db.prepare(
      `SELECT id, project_id, task_number, title, description, status, agent_session, started_at, completed_at FROM tasks ORDER BY task_number`
    ).all() as Array<{
      id: string; project_id: string; task_number: number; title: string;
      description: string; status: string; agent_session: string | null;
      started_at: string | null; completed_at: string | null;
    }>;

    for (const row of rows) {
      let col = row.status.toLowerCase().replace(/\s+/g, '_');
      if (col === 'approved') col = 'done';
      if (!columns[col]) columns[col] = [];

      columns[col].push({
        id: row.id,
        title: row.title,
        status: row.status,
        taskNumber: row.task_number,
        description: row.description,
        agentSession: row.agent_session,
        projectId: row.project_id,
      });
    }
  } catch (err) {
    console.error('[kanban] Failed to read tasks from DB', err);
  }

  return NextResponse.json({ columns });
}
