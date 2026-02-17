import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import os from 'os';
import { z } from 'zod';

const HEARTBEAT_PATH = path.join(os.homedir(), '.openclaw', 'workspace', 'HEARTBEAT.md');

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

    // Read existing HEARTBEAT.md
    let existing = '';
    try {
      existing = await readFile(HEARTBEAT_PATH, 'utf-8');
    } catch {
      // File doesn't exist yet — that's fine
    }

    // Append task to HEARTBEAT.md for agent pickup
    const taskEntry = `\n## Auto-Pickup Task: ${title}\n- **Task ID:** ${taskId}\n- **Description:** ${description || title}\n- **Priority:** Pick up this task immediately and report results when done.\n`;

    await writeFile(HEARTBEAT_PATH, existing + taskEntry, 'utf-8');

    return NextResponse.json({ 
      success: true, 
      message: `Task "${title}" queued for auto-pickup via HEARTBEAT.md`,
      taskId,
    });
  } catch (err) {
    console.error('[kanban/run] Failed to queue task:', err);
    return NextResponse.json({ error: 'Failed to queue task' }, { status: 500 });
  }
}
