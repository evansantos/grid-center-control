import { NextResponse } from 'next/server';
import { readFile, readdir, access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';
import { AGENTS_DIR } from '@/lib/constants';

export interface SubagentInfo {
  sessionKey: string;
  agentId: string;
  status: 'running' | 'completed' | 'error' | 'unknown';
  parentSession: string | null;
  task: string;
  runtime: number; // seconds
  startedAt: string;
  children: SubagentInfo[];
}

async function exists(p: string) { try { await access(p, constants.R_OK); return true; } catch { return false; } }

async function parseSessionFiles(): Promise<SubagentInfo[]> {
  const agents: SubagentInfo[] = [];
  try {
    if (!(await exists(AGENTS_DIR))) return agents;
    const agentDirs = await readdir(AGENTS_DIR);

    for (const agentDir of agentDirs) {
      const sessionsDir = path.join(AGENTS_DIR, agentDir, 'sessions');
      if (!(await exists(sessionsDir))) continue;
      const allFiles = await readdir(sessionsDir);
      const files = allFiles.filter(f => f.endsWith('.jsonl'));

    for (const file of files) {
      try {
        const content = await readFile(path.join(sessionsDir, file), 'utf-8');
        const lines = content.trim().split('\n').filter(Boolean);
        if (lines.length === 0) continue;

        const firstLine = JSON.parse(lines[0]);
        const lastLine = JSON.parse(lines[lines.length - 1]);

        const sessionKey = file.replace('.jsonl', '');
        const isSubagent = sessionKey.includes('subagent');
        const parts = sessionKey.split(':');
        const agentId = parts[1] || 'unknown';

        let parentSession: string | null = null;
        if (isSubagent && parts.length >= 2) {
          parentSession = `agent:${parts[1]}:main`;
        }

        let task = '';
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.role === 'user' && parsed.content) {
              task = typeof parsed.content === 'string'
                ? parsed.content.slice(0, 200)
                : JSON.stringify(parsed.content).slice(0, 200);
              break;
            }
          } catch (err) { console.error(err); }
        }

        const startTime = firstLine.timestamp || firstLine.ts || new Date().toISOString();
        const endTime = lastLine.timestamp || lastLine.ts || new Date().toISOString();
        const runtime = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000);

        let status: SubagentInfo['status'] = 'unknown';
        if (lastLine.error) status = 'error';
        else if (lastLine.role === 'assistant' && runtime > 0) status = 'completed';
        else status = 'running';

        agents.push({
          sessionKey,
          agentId,
          status,
          parentSession,
          task,
          runtime: Math.max(0, runtime),
          startedAt: startTime,
          children: [],
        });
      } catch (err) { console.error(err); }
    }
    } // end agentDir loop
  } catch (err) { console.error(err); }

  const map = new Map<string, SubagentInfo>();
  agents.forEach(a => map.set(a.sessionKey, a));
  const roots: SubagentInfo[] = [];
  for (const agent of agents) {
    if (agent.parentSession && map.has(agent.parentSession)) {
      map.get(agent.parentSession)!.children.push(agent);
    } else {
      roots.push(agent);
    }
  }

  return roots;
}

let cache: { data: SubagentInfo[]; ts: number } | null = null;

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.ts < 30_000) {
    return NextResponse.json(cache.data);
  }
  const tree = await parseSessionFiles();
  cache = { data: tree, ts: now };
  return NextResponse.json(tree);
}
