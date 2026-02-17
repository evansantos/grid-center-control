import { NextRequest, NextResponse } from 'next/server';
import { KanbanMoveSchema, validateBody } from '@/lib/validators';
import { getDB } from '@/lib/db';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(KanbanMoveSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { taskId, status } = validated.data;

    const db = getDB();
    const result = db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, taskId);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    return NextResponse.json({ task });
  } catch (err) {
    console.error('[kanban/move] Failed to move task', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
