import { NextResponse } from 'next/server';
import { readFile, readdir, stat, access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';
import os from 'os';

interface Task {
  id: string;
  title: string;
  agent: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: string;
}

const AGENTS_DIR = path.join(os.homedir(), '.openclaw', 'agents');
const TASK_FILE = 'tasks.json';

type Columns = Record<string, Task[]>;

export async function GET() {
  const columns: Columns = { pending: [], in_progress: [], review: [], done: [] };

  try {
    try { await access(AGENTS_DIR, constants.R_OK); } catch { /* agents dir not accessible */ return NextResponse.json({ columns }); }

    const dirs = await readdir(AGENTS_DIR);
    for (const agent of dirs) {
      const agentDir = path.join(AGENTS_DIR, agent);
      try {
        const s = await stat(agentDir);
        if (!s.isDirectory()) continue;
      } catch (err) {
        console.error(`[kanban] stat failed for ${agent}`, err);
        continue;
      }

      // Look for tasks.json in workspace
      const taskPaths = [
        path.join(agentDir, 'workspace', TASK_FILE),
        path.join(agentDir, 'workspace', 'project', TASK_FILE),
      ];

      for (const tp of taskPaths) {
        try {
          await access(tp, constants.R_OK);
          const raw = JSON.parse(await readFile(tp, 'utf-8'));
          const tasks: Task[] = Array.isArray(raw) ? raw : raw.tasks ?? [];
          for (const task of tasks) {
            const status = (task.status || 'pending').replace(/\s+/g, '_').toLowerCase();
            if (!columns[status]) columns[status] = [];
            columns[status].push({
              id: task.id || `${agent}-${Math.random().toString(36).slice(2, 8)}`,
              title: task.title || 'Untitled',
              agent: task.agent || agent,
              priority: task.priority || 'medium',
              status,
            });
          }
        } catch (error) { /* failed to parse kanban data */
          // File doesn't exist for this agent — expected
        }
      }
    }
  } catch (err) {
    console.error('[kanban] Failed to read tasks', err);
  }

  return NextResponse.json({ columns });
}
