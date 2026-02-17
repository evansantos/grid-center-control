import { NextResponse } from 'next/server';
import { readFile, readdir, stat, access } from 'fs/promises';
import { constants } from 'fs';
import { join } from 'path';
import os from 'os';

const OPENCLAW_DIR = join(os.homedir(), '.openclaw');

async function exists(p: string) { try { await access(p, constants.R_OK); return true; } catch { /* existence check */ return false; } }

// Module-level cache with 5s TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 1000;

interface ActivityItem {
  agent: string;
  agentEmoji: string;
  agentName: string;
  sessionId: string;
  task: string;
  lastMessage: string;
  lastRole: string;
  timestamp: string;
  messageCount: number;
  status: 'active' | 'recent' | 'idle';
  durationMs?: number;
}

async function getAgentMeta(): Promise<Record<string, { name: string; emoji: string }>> {
  try {
    let config: any;
    try {
      config = JSON.parse(await readFile(join(OPENCLAW_DIR, 'openclaw.json'), 'utf-8'));
    } catch (error) { /* Config may not exist */
      config = { agents: { list: [] } };
    }
    const meta: Record<string, { name: string; emoji: string }> = {};
    for (const agent of config.agents?.list ?? []) {
      meta[agent.id] = { name: agent.identity?.name ?? agent.id, emoji: agent.identity?.emoji ?? '🔵' };
    }
    return meta;
  } catch (error) { console.error("[activity] Failed to get agent meta", error); return {}; }
}

async function parseSessionFile(filePath: string, cutoff: number): Promise<{ sessionId: string; firstUserMsg: string; lastMsg: string; lastRole: string; lastTimestamp: string; firstTimestamp: string; messageCount: number } | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.trim().split('\n').filter(l => l.trim());
    let sessionId = '', firstUserMsg = '', lastMsg = '', lastRole = '', lastTimestamp = '', firstTimestamp = '';
    let messageCount = 0;

    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        if (entry.type === 'session') { sessionId = entry.id; continue; }
        if (entry.type === 'message' && entry.message) {
          const msg = entry.message;
          const role = msg.role;
          const textContent = Array.isArray(msg.content)
            ? msg.content.find((c: any) => c.type === 'text')?.text ?? ''
            : typeof msg.content === 'string' ? msg.content : '';
          if (!textContent) continue;
          if (role === 'user' && !firstUserMsg) { firstUserMsg = textContent.slice(0, 300); if (entry.timestamp) firstTimestamp = entry.timestamp; }
          if (role === 'user' || role === 'assistant') { messageCount++; lastMsg = textContent.slice(0, 300); lastRole = role; if (entry.timestamp) lastTimestamp = entry.timestamp; }
        }
      } catch (err) { console.error(err); }
    }
    if (!sessionId || messageCount === 0) return null;
    return { sessionId, firstUserMsg, lastMsg, lastRole, lastTimestamp, firstTimestamp, messageCount };
  } catch (error) { console.error(`[activity] Failed to parse session file`, error); return null; }
}

async function getFilesWithStats(dir: string, cutoff: number, limit: number) {
  const allFiles = await readdir(dir);
  const fileStats = await Promise.all(
    allFiles.filter(f => f.endsWith('.jsonl')).map(async f => {
      try { const s = await stat(join(dir, f)); return { name: f, mtime: s.mtimeMs }; } catch { /* stat failed */ return null; }
    })
  );
  return fileStats.filter((f): f is { name: string; mtime: number } => f !== null && f.mtime > cutoff)
    .sort((a, b) => b.mtime - a.mtime).slice(0, limit);
}

async function fetchActivity() {
  const agentMeta = await getAgentMeta();
  const activity: ActivityItem[] = [];
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const agentsDir = join(OPENCLAW_DIR, 'agents');
  if (!(await exists(agentsDir))) return { activity: [] };

  const allDirs = await readdir(agentsDir);
  const agentDirs: string[] = [];
  for (const d of allDirs) { try { if ((await stat(join(agentsDir, d))).isDirectory()) agentDirs.push(d); } catch (err) { console.error(err); } }

  for (const agentId of agentDirs) {
    const sessionsDir = join(agentsDir, agentId, 'sessions');
    if (!(await exists(sessionsDir))) continue;

    const files = await getFilesWithStats(sessionsDir, cutoff, 3);
    for (const file of files) {
      const parsed = await parseSessionFile(join(sessionsDir, file.name), cutoff);
      if (!parsed) continue;
      const ageMs = Date.now() - file.mtime;
      const durationMs = parsed.firstTimestamp && parsed.lastTimestamp
        ? new Date(parsed.lastTimestamp).getTime() - new Date(parsed.firstTimestamp).getTime() : undefined;
      const displayAgent = agentId === 'main' ? 'mcp' : agentId;
      activity.push({
        agent: displayAgent,
        agentEmoji: agentMeta[displayAgent]?.emoji ?? agentMeta[agentId]?.emoji ?? '🔵',
        agentName: agentMeta[displayAgent]?.name ?? agentMeta[agentId]?.name ?? displayAgent,
        sessionId: parsed.sessionId, task: parsed.firstUserMsg, lastMessage: parsed.lastMsg, lastRole: parsed.lastRole,
        timestamp: parsed.lastTimestamp || new Date(file.mtime).toISOString(), messageCount: parsed.messageCount,
        status: ageMs < 60_000 ? 'active' : ageMs < 600_000 ? 'recent' : 'idle', durationMs,
      });
    }
  }

  // Scan main sessions for subagent spawns
  const mainSessionsDir = join(agentsDir, 'main', 'sessions');
  if (await exists(mainSessionsDir)) {
    const mainFiles = await getFilesWithStats(mainSessionsDir, cutoff, 5);
    for (const file of mainFiles) {
      const parsed = await parseSessionFile(join(mainSessionsDir, file.name), cutoff);
      if (!parsed) continue;
      const isSubagent = parsed.firstUserMsg.length > 50 && !parsed.firstUserMsg.includes('[System Message]');
      const existsInActivity = activity.some(a => a.sessionId === parsed.sessionId);
      if (isSubagent && !existsInActivity) {
        const ageMs = Date.now() - file.mtime;
        activity.push({
          agent: 'subagent', agentEmoji: '⚡', agentName: 'Subagent',
          sessionId: parsed.sessionId, task: parsed.firstUserMsg, lastMessage: parsed.lastMsg, lastRole: parsed.lastRole,
          timestamp: parsed.lastTimestamp || new Date(file.mtime).toISOString(), messageCount: parsed.messageCount,
          status: ageMs < 60_000 ? 'active' : ageMs < 600_000 ? 'recent' : 'idle',
        });
      }
    }
  }

  activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return { activity: activity.slice(0, 50) };
}

export async function GET() {
  try {
    const cacheKey = 'activity';
    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && (now - cached.timestamp < CACHE_TTL)) return NextResponse.json(cached.data);

    const data = await fetchActivity();
    cache.set(cacheKey, { data, timestamp: now });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
