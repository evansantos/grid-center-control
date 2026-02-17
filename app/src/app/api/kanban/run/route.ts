import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import os from 'os';
import { z } from 'zod';
import { getDB } from '@/lib/db';

const RunTaskSchema = z.object({
  taskId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RunTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request: taskId and title required' }, { status: 400 });
    }

    const { taskId, title, description } = parsed.data;

    const db = getDB();
    const now = new Date().toISOString();
    const result = db.prepare('UPDATE tasks SET status = \'in_progress\', started_at = ? WHERE id = ?').run(now, taskId);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as Record<string, unknown>;

    // Look up agent_session to determine HEARTBEAT.md path
    const session = db.prepare('SELECT * FROM agent_sessions WHERE task_id = ?').get(taskId) as Record<string, unknown> | undefined;

    if (session?.agent_name) {
      const heartbeatPath = path.join(os.homedir(), '.openclaw', 'agents', session.agent_name as string, 'workspace', 'HEARTBEAT.md');

      let existing = '';
      try {
        existing = await readFile(heartbeatPath, 'utf-8');
      } catch {
        // File doesn't exist yet
      }

      const taskEntry = `\n## Auto-Pickup Task: ${title}\n- **Task ID:** ${taskId}\n- **Description:** ${description || title}\n- **Priority:** Pick up this task immediately and report results when done.\n`;

      await writeFile(heartbeatPath, existing + taskEntry, 'utf-8');
    }

    return NextResponse.json({
      success: true,
      message: `Task "${title}" started and updated in grid.db`,
      task,
    });
  } catch (err) {
    console.error('[kanban/run] Failed to run task:', err);
    return NextResponse.json({ error: 'Failed to run task' }, { status: 500 });
  }
}
