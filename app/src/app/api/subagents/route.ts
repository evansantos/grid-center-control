import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

const SESSIONS_DIR = path.join(process.env.HOME || '~', '.openclaw', 'sessions');

function parseSessionFiles(): SubagentInfo[] {
  const agents: SubagentInfo[] = [];
  try {
    if (!fs.existsSync(SESSIONS_DIR)) return agents;
    const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.jsonl'));

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(SESSIONS_DIR, file), 'utf-8');
        const lines = content.trim().split('\n').filter(Boolean);
        if (lines.length === 0) continue;

        const firstLine = JSON.parse(lines[0]);
        const lastLine = JSON.parse(lines[lines.length - 1]);

        const sessionKey = file.replace('.jsonl', '');
        const isSubagent = sessionKey.includes('subagent');
        const parts = sessionKey.split(':');
        const agentId = parts[1] || 'unknown';

        // Extract parent from session key pattern: agent:<id>:subagent:<uuid>
        let parentSession: string | null = null;
        if (isSubagent && parts.length >= 2) {
          parentSession = `agent:${parts[1]}:main`;
        }

        // Try to extract task from first user message
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
          } catch {}
        }

        const startTime = firstLine.timestamp || firstLine.ts || new Date().toISOString();
        const endTime = lastLine.timestamp || lastLine.ts || new Date().toISOString();
        const runtime = Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000);

        // Determine status from last message
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
      } catch {}
    }
  } catch {}

  // Build tree
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
  const tree = parseSessionFiles();
  cache = { data: tree, ts: now };
  return NextResponse.json(tree);
}
