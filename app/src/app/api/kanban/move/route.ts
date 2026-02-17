import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir, stat, access, writeFile } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';
import os from 'os';
import { KanbanMoveSchema, validateBody } from '@/lib/validators';

const AGENTS_DIR = path.join(os.homedir(), '.openclaw', 'agents');
const TASK_FILE = 'tasks.json';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateBody(KanbanMoveSchema, body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { taskId, status } = validated.data;

    // Scan agent workspaces for the task
    try { await access(AGENTS_DIR, constants.R_OK); } catch (error) { /* agents dir not accessible */
      return NextResponse.json({ error: 'Agents dir not found' }, { status: 404 });
    }

    const dirs = await readdir(AGENTS_DIR);
    for (const agent of dirs) {
      const agentDir = path.join(AGENTS_DIR, agent);
      try {
        if (!(await stat(agentDir)).isDirectory()) continue;
      } catch (error) { /* skip inaccessible dir */ continue; }

      const taskPaths = [
        path.join(agentDir, 'workspace', TASK_FILE),
        path.join(agentDir, 'workspace', 'project', TASK_FILE),
      ];

      for (const tp of taskPaths) {
        try {
          await access(tp, constants.R_OK);
          const raw = JSON.parse(await readFile(tp, 'utf-8'));
          const tasks = Array.isArray(raw) ? raw : raw.tasks ?? [];
          const task = tasks.find((t: { id: string }) => t.id === taskId);
          if (!task) continue;

          task.status = status;
          const output = Array.isArray(raw) ? tasks : { ...raw, tasks };
          await writeFile(tp, JSON.stringify(output, null, 2), 'utf-8');
          return NextResponse.json({ task: { ...task, status } });
        } catch (error) { /* failed to read session */
          // Not in this file — continue
        }
      }
    }

    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  } catch (err) {
    console.error('[kanban/move] Failed to move task', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
