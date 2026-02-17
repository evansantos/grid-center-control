import { NextResponse } from 'next/server';
import { readFile, readdir, stat, access } from 'fs/promises';
import { constants } from 'fs';
import { join } from 'path';
import os from 'os';

const OPENCLAW_DIR = join(os.homedir(), '.openclaw');
const CONFIG_PATH = join(OPENCLAW_DIR, 'openclaw.json');

async function exists(p: string) { try { await access(p, constants.R_OK); return true; } catch { /* existence check */ return false; } }

interface AgentInfo {
  id: string;
  name: string;
  emoji: string;
  role: string;
  model: string;
  activeSessions: SessionInfo[];
}

interface SessionInfo {
  sessionKey: string;
  label?: string;
  lastMessage?: string;
  updatedAt?: string;
  messageCount: number;
}

async function getAgentRole(agentDir: string): Promise<string> {
  try {
    const identity = await readFile(join(agentDir, 'workspace', 'IDENTITY.md'), 'utf-8');
    const roleMatch = identity.match(/\*\*Role:\*\*\s*(.+)/);
    return roleMatch?.[1]?.trim() ?? '';
  } catch (error) {
    /* expected — file may not exist */
    return '';
  }
}

async function getSessionsForAgent(agentId: string): Promise<SessionInfo[]> {
  const sessions: SessionInfo[] = [];
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const dir = join(OPENCLAW_DIR, 'agents', agentId, 'sessions');

  if (!(await exists(dir))) return sessions;

  try {
    const allFiles = await readdir(dir);
    const jsonlFiles = allFiles.filter(f => f.endsWith('.jsonl') && !f.includes('.deleted'));

    const fileStats = await Promise.all(
      jsonlFiles.map(async f => {
        try {
          const s = await stat(join(dir, f));
          return { name: f, mtime: s.mtimeMs };
        } catch { /* stat failed */ return null; }
      })
    );
    const files = fileStats.filter((f): f is { name: string; mtime: number } => f !== null)
      .sort((a, b) => b.mtime - a.mtime);

    for (const file of files) {
      try {
        const content = await readFile(join(dir, file.name), 'utf-8');
        const lines = content.trim().split('\n').filter(l => l.trim());
        if (lines.length === 0) continue;

        let sessionKey = '';
        let label = '';
        let lastMessage = '';
        let updatedAt = '';
        let messageCount = 0;

        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            if (entry.type === 'session' && entry.id) {
              sessionKey = entry.id;
            }
            if (entry.type === 'message' && entry.message) {
              const ts = entry.timestamp ? new Date(entry.timestamp).getTime() : 0;
              if (ts && ts < cutoff) continue;
              const msg = entry.message;
              const role = msg.role;
              if (role === 'user' || role === 'assistant') {
                messageCount++;
                if (role === 'assistant') {
                  const textContent = Array.isArray(msg.content) 
                    ? msg.content.find((c: any) => c.type === 'text')?.text ?? ''
                    : typeof msg.content === 'string' ? msg.content : '';
                  if (textContent) lastMessage = textContent.slice(0, 200);
                }
              }
              if (entry.timestamp) updatedAt = new Date(entry.timestamp).toISOString();
            }
          } catch (err) { console.error(err); }
        }

        if (sessionKey) {
          sessions.push({ sessionKey, label, lastMessage, updatedAt, messageCount });
        }
      } catch (err) { console.error(err); }
    }
  } catch (err) { console.error(err); }

  return sessions.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
}

export async function GET() {
  try {
    let config: any;
    try {
      config = JSON.parse(await readFile(CONFIG_PATH, 'utf-8'));
    } catch (error) { /* config may not exist */
      config = { agents: { list: [] } };
    }
    const agentList = config.agents?.list ?? [];

    const agents: AgentInfo[] = await Promise.all(agentList.map(async (agent: any) => {
      const agentDir = join(OPENCLAW_DIR, 'agents', agent.id);
      return {
        id: agent.id,
        name: agent.identity?.name ?? agent.name ?? agent.id,
        emoji: agent.identity?.emoji ?? '',
        role: (await getAgentRole(agentDir)) || (agent.id === 'main' ? 'Chief Strategy Officer' : ''),
        model: agent.model ?? config.agents?.defaults?.model?.primary ?? '',
        activeSessions: await getSessionsForAgent(agent.id),
      };
    }));

    return NextResponse.json({ agents });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
