import { NextResponse } from 'next/server';
import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const OPENCLAW_DIR = join(process.env.HOME ?? '', '.openclaw');

// Module-level cache with 5s TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 1000; // 5 seconds

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

function getAgentMeta(): Record<string, { name: string; emoji: string }> {
  try {
    const config = JSON.parse(readFileSync(join(OPENCLAW_DIR, 'openclaw.json'), 'utf-8'));
    const meta: Record<string, { name: string; emoji: string }> = {};
    for (const agent of config.agents?.list ?? []) {
      meta[agent.id] = {
        name: agent.identity?.name ?? agent.id,
        emoji: agent.identity?.emoji ?? '🔵',
      };
    }
    return meta;
  } catch { return {}; }
}

function fetchActivity() {
  const agentMeta = getAgentMeta();
  const activity: ActivityItem[] = [];
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const agentsDir = join(OPENCLAW_DIR, 'agents');

  if (!existsSync(agentsDir)) {
    return { activity: [] };
  }

  const agentDirs = readdirSync(agentsDir).filter(d => {
    try { return statSync(join(agentsDir, d)).isDirectory(); } catch { return false; }
  });

  for (const agentId of agentDirs) {
    // Process main agent and map it to mcp
    const sessionsDir = join(agentsDir, agentId, 'sessions');
    if (!existsSync(sessionsDir)) continue;

    const files = readdirSync(sessionsDir)
      .filter(f => f.endsWith('.jsonl'))
      .map(f => ({ name: f, mtime: statSync(join(sessionsDir, f)).mtimeMs }))
      .filter(f => f.mtime > cutoff)
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 3); // last 3 sessions per agent

    for (const file of files) {
      try {
        const content = readFileSync(join(sessionsDir, file.name), 'utf-8');
        const lines = content.trim().split('\n').filter(l => l.trim());
        
        let sessionId = '';
        let firstUserMsg = '';
        let lastMsg = '';
        let lastRole = '';
        let lastTimestamp = '';
        let firstTimestamp = '';
        let messageCount = 0;

        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            if (entry.type === 'session') {
              sessionId = entry.id;
            }
            if (entry.type === 'message' && entry.message) {
              const msg = entry.message;
              const role = msg.role;
              const textContent = Array.isArray(msg.content)
                ? msg.content.find((c: any) => c.type === 'text')?.text ?? ''
                : typeof msg.content === 'string' ? msg.content : '';
              
              if (!textContent) continue;

              if (role === 'user' && !firstUserMsg) {
                firstUserMsg = textContent.slice(0, 300);
                if (entry.timestamp) firstTimestamp = entry.timestamp;
              }
              if (role === 'user' || role === 'assistant') {
                messageCount++;
                lastMsg = textContent.slice(0, 300);
                lastRole = role;
                if (entry.timestamp) lastTimestamp = entry.timestamp;
              }
            }
          } catch {}
        }

        if (!sessionId || messageCount === 0) continue;

        const ageMs = Date.now() - file.mtime;
        const durationMs = firstTimestamp && lastTimestamp
          ? new Date(lastTimestamp).getTime() - new Date(firstTimestamp).getTime()
          : undefined;

        // Map main → mcp for consistency with living-office.tsx
        const displayAgent = agentId === 'main' ? 'mcp' : agentId;
        
        activity.push({
          agent: displayAgent,
          agentEmoji: agentMeta[displayAgent] ? agentMeta[displayAgent].emoji : (agentMeta[agentId]?.emoji ?? '🔵'),
          agentName: agentMeta[displayAgent] ? agentMeta[displayAgent].name : (agentMeta[agentId]?.name ?? displayAgent),
          sessionId,
          task: firstUserMsg,
          lastMessage: lastMsg,
          lastRole,
          timestamp: lastTimestamp || new Date(file.mtime).toISOString(),
          messageCount,
          status: ageMs < 60_000 ? 'active' : ageMs < 600_000 ? 'recent' : 'idle',
          durationMs,
        });
      } catch {}
    }
  }

  // Also scan main sessions for subagent spawns
  const mainSessionsDir = join(agentsDir, 'main', 'sessions');
  if (existsSync(mainSessionsDir)) {
    const mainFiles = readdirSync(mainSessionsDir)
      .filter(f => f.endsWith('.jsonl'))
      .map(f => ({ name: f, mtime: statSync(join(mainSessionsDir, f)).mtimeMs }))
      .filter(f => f.mtime > cutoff)
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 5);

    for (const file of mainFiles) {
      try {
        const content = readFileSync(join(mainSessionsDir, file.name), 'utf-8');
        const lines = content.trim().split('\n').filter(l => l.trim());
        
        let sessionId = '';
        let firstUserMsg = '';
        let lastMsg = '';
        let lastRole = '';
        let lastTimestamp = '';
        let firstTimestamp = '';
        let messageCount = 0;

        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            if (entry.type === 'session') sessionId = entry.id;
            if (entry.type === 'message' && entry.message) {
              const msg = entry.message;
              const role = msg.role;
              const textContent = Array.isArray(msg.content)
                ? msg.content.find((c: any) => c.type === 'text')?.text ?? ''
                : typeof msg.content === 'string' ? msg.content : '';
              if (!textContent) continue;
              if (role === 'user' && !firstUserMsg) {
                firstUserMsg = textContent.slice(0, 300);
                if (entry.timestamp) firstTimestamp = entry.timestamp;
              }
              if (role === 'user' || role === 'assistant') {
                messageCount++;
                lastMsg = textContent.slice(0, 300);
                lastRole = role;
                if (entry.timestamp) lastTimestamp = entry.timestamp;
              }
            }
          } catch {}
        }

        // Only include if it looks like a subagent session (not the main chat)
        const isSubagent = firstUserMsg.length > 50 && !firstUserMsg.includes('[System Message]');
        const existsInAgentDirs = activity.some(a => a.sessionId === sessionId);
        
        if (sessionId && messageCount > 0 && isSubagent && !existsInAgentDirs) {
          const ageMs = Date.now() - file.mtime;
          activity.push({
            agent: 'subagent',
            agentEmoji: '⚡',
            agentName: 'Subagent',
            sessionId,
            task: firstUserMsg,
            lastMessage: lastMsg,
            lastRole,
            timestamp: lastTimestamp || new Date(file.mtime).toISOString(),
            messageCount,
            status: ageMs < 60_000 ? 'active' : ageMs < 600_000 ? 'recent' : 'idle',
          });
        }
      } catch {}
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

    // Check if cache hit and not expired
    if (cached && (now - cached.timestamp < CACHE_TTL)) {
      return NextResponse.json(cached.data);
    }

    // Compute fresh data
    const data = fetchActivity();
    
    // Store in cache
    cache.set(cacheKey, { data, timestamp: now });

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}