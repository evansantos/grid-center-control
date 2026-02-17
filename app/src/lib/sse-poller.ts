import { readdir, stat, access, readFile } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';
import os from 'os';

const OPENCLAW_DIR = path.join(os.homedir(), '.openclaw');
const AGENTS_DIR = path.join(OPENCLAW_DIR, 'agents');
const POLL_INTERVAL = 2000;

// --- Types ---

export interface AgentActivity {
  agent: string;
  status: 'active' | 'recent' | 'idle';
  lastMtime: number;
}

export interface AgentStatus {
  active: boolean;
  lastActivity?: string;
}

export type StreamCallback = (event: string, data: unknown) => void;
export type AgentStatusCallback = (statuses: Record<string, AgentStatus>) => void;

// --- Shared state ---

const streamClients = new Set<StreamCallback>();
const agentStatusClients = new Set<AgentStatusCallback>();

let pollerInterval: ReturnType<typeof setInterval> | null = null;
let lastMtimes = new Map<string, number>();
let lastAgentSet = new Set<string>();

// --- Helpers ---

async function exists(p: string): Promise<boolean> {
  try { await access(p, constants.R_OK); return true; } catch { return false; }
}

async function getAgentDirs(): Promise<string[]> {
  if (!await exists(AGENTS_DIR)) return [];
  const entries = await readdir(AGENTS_DIR);
  const dirs: string[] = [];
  for (const e of entries) {
    try { if ((await stat(path.join(AGENTS_DIR, e))).isDirectory()) dirs.push(e); } catch { /* skip */ }
  }
  return dirs;
}

async function getLatestMtime(sessionsDir: string): Promise<number> {
  if (!await exists(sessionsDir)) return 0;
  let latest = 0;
  try {
    const files = (await readdir(sessionsDir)).filter(f => f.endsWith('.jsonl'));
    for (const f of files) {
      try {
        const s = await stat(path.join(sessionsDir, f));
        if (s.mtimeMs > latest) latest = s.mtimeMs;
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
  return latest;
}

function statusFromAge(ageMs: number): 'active' | 'recent' | 'idle' {
  if (ageMs < 60_000) return 'active';
  if (ageMs < 600_000) return 'recent';
  return 'idle';
}

// --- Poll logic ---

async function poll() {
  try {
    const agents = await getAgentDirs();
    const currentSet = new Set(agents);

    // Detect added/removed agents for stream clients
    if (streamClients.size > 0) {
      for (const a of agents) {
        if (!lastAgentSet.has(a)) {
          broadcast('agent-change', { eventType: 'rename', agent: a, timestamp: new Date().toISOString() });
        }
      }
      for (const a of lastAgentSet) {
        if (!currentSet.has(a)) {
          broadcast('agent-change', { eventType: 'rename', agent: a, timestamp: new Date().toISOString() });
        }
      }
    }
    lastAgentSet = currentSet;

    // Check session mtimes
    const agentStatuses: Record<string, AgentStatus> = {};

    for (const agent of agents) {
      const sessionsDir = path.join(AGENTS_DIR, agent, 'sessions');
      const mtime = await getLatestMtime(sessionsDir);
      const key = `${agent}:sessions`;
      const prev = lastMtimes.get(key) ?? 0;

      if (mtime > prev && streamClients.size > 0) {
        const ageMs = Date.now() - mtime;
        broadcast('activity', {
          agent,
          eventType: 'change',
          filename: 'poll',
          timestamp: new Date().toISOString(),
          status: statusFromAge(ageMs),
        });
      }
      lastMtimes.set(key, mtime);

      // Build agent status for status clients
      if (agentStatusClients.size > 0) {
        const statusKey = agent === 'main' ? 'mcp' : agent;
        agentStatuses[statusKey] = {
          active: mtime > 0 && (Date.now() - mtime) < 30_000,
          lastActivity: mtime > 0 ? new Date(mtime).toISOString() : undefined,
        };
      }
    }

    // Also include agents from config that might not have dirs
    if (agentStatusClients.size > 0) {
      try {
        const configPath = path.join(OPENCLAW_DIR, 'openclaw.json');
        if (await exists(configPath)) {
          const config = JSON.parse(await readFile(configPath, 'utf-8')) as { agents?: { list?: Array<{ id: string }> } };
          for (const a of config.agents?.list ?? []) {
            const statusKey = a.id === 'main' ? 'mcp' : a.id;
            if (!(statusKey in agentStatuses)) {
              agentStatuses[statusKey] = { active: false };
            }
          }
        }
      } catch { /* skip config read */ }

      for (const cb of agentStatusClients) {
        try { cb(agentStatuses); } catch { agentStatusClients.delete(cb); }
      }
    }
  } catch (err) {
    console.error('[sse-poller] poll error', err);
  }
}

function broadcast(event: string, data: unknown) {
  for (const cb of streamClients) {
    try { cb(event, data); } catch { streamClients.delete(cb); }
  }
}

function ensurePoller() {
  if (!pollerInterval) {
    pollerInterval = setInterval(poll, POLL_INTERVAL);
    // Run immediately on first client
    poll();
  }
}

function maybeStopPoller() {
  if (streamClients.size === 0 && agentStatusClients.size === 0 && pollerInterval) {
    clearInterval(pollerInterval);
    pollerInterval = null;
  }
}

// --- Public API ---

export function subscribeStream(cb: StreamCallback): () => void {
  streamClients.add(cb);
  ensurePoller();
  return () => { streamClients.delete(cb); maybeStopPoller(); };
}

export function subscribeAgentStatus(cb: AgentStatusCallback): () => void {
  agentStatusClients.add(cb);
  ensurePoller();
  return () => { agentStatusClients.delete(cb); maybeStopPoller(); };
}

export { getAgentDirs as getAgentList };
