import { readFile, readdir, stat, access } from 'fs/promises';
import { constants } from 'fs';
import { join } from 'path';
import { getOpenClawDir } from './config';
import { extractCost, type UsageData } from '../utils/cost';

async function exists(p: string) {
  try { await access(p, constants.R_OK); return true; } catch { return false; }
}

export interface SessionInfo {
  sessionKey: string;
  label?: string;
  lastMessage?: string;
  updatedAt?: string;
  messageCount: number;
  totalCostUSD: number;
}

export async function getSessionsForAgent(agentId: string, cutoffMs?: number): Promise<SessionInfo[]> {
  const sessions: SessionInfo[] = [];
  const cutoff = Date.now() - (cutoffMs ?? 24 * 60 * 60 * 1000);
  const dir = join(getOpenClawDir(), 'agents', agentId, 'sessions');

  if (!(await exists(dir))) return sessions;

  try {
    const allFiles = await readdir(dir);
    const jsonlFiles = allFiles.filter(f => f.endsWith('.jsonl') && !f.includes('.deleted'));

    const fileStats = await Promise.all(
      jsonlFiles.map(async f => {
        try {
          const s = await stat(join(dir, f));
          return { name: f, mtime: s.mtimeMs };
        } catch { return null; }
      })
    );
    const files = fileStats
      .filter((f): f is { name: string; mtime: number } => f !== null)
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
        let sessionCost = 0;

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
                    ? msg.content.find((c: { type: string; text?: string }) => c.type === 'text')?.text ?? ''
                    : typeof msg.content === 'string' ? msg.content : '';
                  if (textContent) lastMessage = textContent.slice(0, 200);
                }
              }
              if (entry.timestamp) updatedAt = new Date(entry.timestamp).toISOString();
              
              // Extract cost from usage data at top level
              if (entry.usage) {
                sessionCost += extractCost(entry.usage as UsageData);
              }
            }
          } catch { /* parse error, skip line */ }
        }

        if (sessionKey) {
          sessions.push({ sessionKey, label, lastMessage, updatedAt, messageCount, totalCostUSD: sessionCost });
        }
      } catch { /* file read error, skip */ }
    }
  } catch { /* readdir error */ }

  return sessions.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
}

export async function getAgentLastActivity(agentId: string): Promise<number> {
  const sessionsDir = join(getOpenClawDir(), 'agents', agentId, 'sessions');

  if (!(await exists(sessionsDir))) return 0;

  let lastMtime = 0;
  try {
    const files = (await readdir(sessionsDir)).filter(f => f.endsWith('.jsonl'));
    for (const file of files) {
      try {
        const s = await stat(join(sessionsDir, file));
        if (s.mtimeMs > lastMtime) lastMtime = s.mtimeMs;
      } catch { /* stat failed */ }
    }
  } catch { /* readdir failed */ }

  return lastMtime;
}
