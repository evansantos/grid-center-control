import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir, stat, access } from 'fs/promises';
import { constants } from 'fs';
import { join } from 'path';
import os from 'os';

const OPENCLAW_DIR = join(os.homedir(), '.openclaw');

async function exists(p: string) { try { await access(p, constants.R_OK); return true; } catch { /* existence check */ return false; } }

// Module-level cache with 15s TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 15 * 1000;

interface ErrorEntry {
  agent: string;
  sessionId: string;
  timestamp: string;
  type: 'tool_error' | 'message_error' | 'general_error' | 'exception';
  message: string;
  severity: 'high' | 'medium' | 'low';
}

interface ErrorData {
  errors: ErrorEntry[];
  summary: {
    total: number;
    byAgent: Record<string, number>;
    byType: Record<string, number>;
  };
}

function detectErrorType(entry: any): { isError: boolean; type: string; message: string; severity: 'high' | 'medium' | 'low' } {
  if (entry.message?.tool_result?.is_error === true) {
    return { isError: true, type: 'tool_error', message: entry.message.tool_result.content || 'Tool execution failed', severity: 'high' };
  }
  if (entry.error) {
    return { isError: true, type: 'general_error', message: typeof entry.error === 'string' ? entry.error : JSON.stringify(entry.error), severity: 'medium' };
  }
  if (entry.message?.content) {
    const content = Array.isArray(entry.message.content) 
      ? entry.message.content.find((c: any) => c.type === 'text')?.text || ''
      : typeof entry.message.content === 'string' ? entry.message.content : '';
    const errorIndicators = [/error:/i, /exception:/i, /failed:/i, /cannot/i, /unable to/i, /permission denied/i, /not found/i, /timeout/i, /refused/i, /forbidden/i, /unauthorized/i, /invalid/i, /syntax error/i, /fatal:/i, /critical:/i];
    for (const indicator of errorIndicators) {
      if (indicator.test(content)) {
        const severity = /fatal|critical|exception/i.test(content) ? 'high' : /error|failed/i.test(content) ? 'medium' : 'low';
        return { isError: true, type: 'message_error', message: content.slice(0, 500), severity };
      }
    }
  }
  if (entry.type === 'error' || (typeof entry === 'object' && 'stack' in entry)) {
    return { isError: true, type: 'exception', message: entry.message || entry.toString(), severity: 'high' };
  }
  return { isError: false, type: '', message: '', severity: 'low' };
}

async function fetchErrors(agent?: string, type?: string, hours?: number): Promise<ErrorData> {
  const agentsDir = join(OPENCLAW_DIR, 'agents');
  const result: ErrorData = { errors: [], summary: { total: 0, byAgent: {}, byType: {} } };
  if (!(await exists(agentsDir))) return result;

  const cutoff = Date.now() - (hours || 24) * 60 * 60 * 1000;

  const resolvedAgentDirs: string[] = [];
  for (const d of await readdir(agentsDir)) {
    try { if ((await stat(join(agentsDir, d))).isDirectory()) resolvedAgentDirs.push(d); } catch (err) { console.error(err); }
  }

  for (const agentId of resolvedAgentDirs) {
    if (agent && agentId !== agent && !(agentId === 'main' && agent === 'mcp')) continue;
    const sessionsDir = join(agentsDir, agentId, 'sessions');
    if (!(await exists(sessionsDir))) continue;

    const displayAgent = agentId === 'main' ? 'mcp' : agentId;
    const allFiles = await readdir(sessionsDir);
    const fileStats = await Promise.all(
      allFiles.filter(f => f.endsWith('.jsonl')).map(async f => {
        try { const s = await stat(join(sessionsDir, f)); return { name: f, mtime: s.mtimeMs }; } catch { /* stat failed */ return null; }
      })
    );
    const files = fileStats.filter((f): f is { name: string; mtime: number } => f !== null && f.mtime > cutoff)
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 20);

    for (const file of files) {
      try {
        const content = await readFile(join(sessionsDir, file.name), 'utf-8');
        const lines = content.trim().split('\n').filter(l => l.trim());
        let sessionId = '';

        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            if (entry.type === 'session') { sessionId = entry.id || 'unknown'; continue; }
            const errorCheck = detectErrorType(entry);
            if (errorCheck.isError) {
              if (type && errorCheck.type !== type) continue;
              const timestamp = entry.timestamp || new Date().toISOString();
              result.errors.push({ agent: displayAgent, sessionId, timestamp, type: errorCheck.type as any, message: errorCheck.message, severity: errorCheck.severity });
              result.summary.total++;
              result.summary.byAgent[displayAgent] = (result.summary.byAgent[displayAgent] || 0) + 1;
              result.summary.byType[errorCheck.type] = (result.summary.byType[errorCheck.type] || 0) + 1;
            }
          } catch (err) { console.error(err); }
        }
      } catch (err) { console.error(err); }
    }
  }

  result.errors.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  result.errors = result.errors.slice(0, 100);
  return result;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agent = searchParams.get('agent') || undefined;
    const type = searchParams.get('type') || undefined;
    const hours = parseInt(searchParams.get('hours') || '24', 10);

    const cacheKey = `errors-${agent || 'all'}-${type || 'all'}-${hours}`;
    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && (now - cached.timestamp < CACHE_TTL)) {
      return NextResponse.json(cached.data);
    }

    const data = await fetchErrors(agent, type, hours);
    cache.set(cacheKey, { data, timestamp: now });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
