import { NextResponse } from 'next/server';
import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const OPENCLAW_DIR = join(process.env.HOME ?? '', '.openclaw');
const CONFIG_PATH = join(OPENCLAW_DIR, 'openclaw.json');
const SESSIONS_DIR = join(OPENCLAW_DIR, 'agents');

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

function getAgentRole(agentDir: string): string {
  try {
    const identity = readFileSync(join(agentDir, 'workspace', 'IDENTITY.md'), 'utf-8');
    const roleMatch = identity.match(/\*\*Role:\*\*\s*(.+)/);
    return roleMatch?.[1]?.trim() ?? '';
  } catch {
    return '';
  }
}

function getSessionsForAgent(agentId: string): SessionInfo[] {
  const sessions: SessionInfo[] = [];
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  // Check main agent sessions dir and agent-specific sessions
  const sessionDirs = [
    join(OPENCLAW_DIR, 'agents', agentId, 'sessions'),
  ];

  for (const dir of sessionDirs) {
    if (!existsSync(dir)) continue;
    try {
      const files = readdirSync(dir)
        .filter(f => f.endsWith('.jsonl') && !f.includes('.deleted'))
        .sort((a, b) => {
          try { return statSync(join(dir, b)).mtimeMs - statSync(join(dir, a)).mtimeMs; } catch { return 0; }
        });
      for (const file of files) {
        try {
          const content = readFileSync(join(dir, file), 'utf-8');
          const lines = content.trim().split('\n').filter(l => l.trim());
          if (lines.length === 0) continue;

          // Check if this session belongs to this agent
          let sessionKey = '';
          let label = '';
          let lastMessage = '';
          let updatedAt = '';
          let messageCount = 0;

          for (const line of lines) {
            try {
              const entry = JSON.parse(line);
              // Session metadata line
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
            } catch {}
          }

          if (sessionKey) {
            sessions.push({ sessionKey, label, lastMessage, updatedAt, messageCount });
          }
        } catch {}
      }
    } catch {}
  }

  return sessions.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
}

export async function GET() {
  try {
    const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
    const agentList = config.agents?.list ?? [];

    const agents: AgentInfo[] = agentList.map((agent: any) => {
      const agentDir = join(OPENCLAW_DIR, 'agents', agent.id);
      return {
        id: agent.id,
        name: agent.identity?.name ?? agent.name ?? agent.id,
        emoji: agent.identity?.emoji ?? '',
        role: getAgentRole(agentDir) || (agent.id === 'main' ? 'Chief Strategy Officer' : ''),
        model: agent.model ?? config.agents?.defaults?.model?.primary ?? '',
        activeSessions: getSessionsForAgent(agent.id),
      };
    });

    return NextResponse.json({ agents });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
