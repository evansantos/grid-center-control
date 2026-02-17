import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const OPENCLAW_DIR = join(process.env.HOME ?? '', '.openclaw');

// Module-level cache with 15s TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 15 * 1000; // 15 seconds

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
  // Check for tool_result with is_error: true
  if (entry.message?.tool_result?.is_error === true) {
    return {
      isError: true,
      type: 'tool_error',
      message: entry.message.tool_result.content || 'Tool execution failed',
      severity: 'high'
    };
  }
  
  // Check for explicit error field
  if (entry.error) {
    return {
      isError: true,
      type: 'general_error',
      message: typeof entry.error === 'string' ? entry.error : JSON.stringify(entry.error),
      severity: 'medium'
    };
  }
  
  // Check for message content with error indicators
  if (entry.message?.content) {
    const content = Array.isArray(entry.message.content) 
      ? entry.message.content.find((c: any) => c.type === 'text')?.text || ''
      : typeof entry.message.content === 'string' ? entry.message.content : '';
    
    const errorIndicators = [
      /error:/i,
      /exception:/i,
      /failed:/i,
      /cannot/i,
      /unable to/i,
      /permission denied/i,
      /not found/i,
      /timeout/i,
      /refused/i,
      /forbidden/i,
      /unauthorized/i,
      /invalid/i,
      /syntax error/i,
      /fatal:/i,
      /critical:/i
    ];
    
    for (const indicator of errorIndicators) {
      if (indicator.test(content)) {
        const severity = /fatal|critical|exception/i.test(content) ? 'high' : 
                        /error|failed/i.test(content) ? 'medium' : 'low';
        return {
          isError: true,
          type: 'message_error',
          message: content.slice(0, 500), // Truncate long messages
          severity
        };
      }
    }
  }
  
  // Check for specific exception patterns in the entry
  if (entry.type === 'error' || (typeof entry === 'object' && 'stack' in entry)) {
    return {
      isError: true,
      type: 'exception',
      message: entry.message || entry.toString(),
      severity: 'high'
    };
  }
  
  return { isError: false, type: '', message: '', severity: 'low' };
}

function fetchErrors(agent?: string, type?: string, hours?: number): ErrorData {
  const agentsDir = join(OPENCLAW_DIR, 'agents');
  const result: ErrorData = {
    errors: [],
    summary: { total: 0, byAgent: {}, byType: {} }
  };

  if (!existsSync(agentsDir)) {
    return result;
  }

  const cutoff = Date.now() - (hours || 24) * 60 * 60 * 1000;
  
  const agentDirs = readdirSync(agentsDir).filter(d => {
    try { return statSync(join(agentsDir, d)).isDirectory(); } catch { return false; }
  });

  for (const agentId of agentDirs) {
    // Filter by agent if specified
    if (agent && agentId !== agent && !(agentId === 'main' && agent === 'mcp')) continue;
    
    const sessionsDir = join(agentsDir, agentId, 'sessions');
    if (!existsSync(sessionsDir)) continue;

    // Map main → mcp for consistency
    const displayAgent = agentId === 'main' ? 'mcp' : agentId;

    const files = readdirSync(sessionsDir)
      .filter(f => f.endsWith('.jsonl'))
      .map(f => ({ name: f, mtime: statSync(join(sessionsDir, f)).mtimeMs }))
      .filter(f => f.mtime > cutoff)
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 20); // Limit to last 20 sessions per agent

    for (const file of files) {
      try {
        const content = readFileSync(join(sessionsDir, file.name), 'utf-8');
        const lines = content.trim().split('\n').filter(l => l.trim());
        
        let sessionId = '';
        
        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            
            if (entry.type === 'session') {
              sessionId = entry.id || 'unknown';
              continue;
            }
            
            const errorCheck = detectErrorType(entry);
            if (errorCheck.isError) {
              // Filter by type if specified
              if (type && errorCheck.type !== type) continue;
              
              const timestamp = entry.timestamp || new Date().toISOString();
              
              const errorEntry: ErrorEntry = {
                agent: displayAgent,
                sessionId,
                timestamp,
                type: errorCheck.type as any,
                message: errorCheck.message,
                severity: errorCheck.severity
              };
              
              result.errors.push(errorEntry);
              result.summary.total++;
              result.summary.byAgent[displayAgent] = (result.summary.byAgent[displayAgent] || 0) + 1;
              result.summary.byType[errorCheck.type] = (result.summary.byType[errorCheck.type] || 0) + 1;
            }
          } catch {
            // Skip malformed lines
          }
        }
      } catch {
        // Skip files that can't be read
      }
    }
  }

  // Sort errors by timestamp (newest first)
  result.errors.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Limit to 100 most recent errors
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

    // Check if cache hit and not expired
    if (cached && (now - cached.timestamp < CACHE_TTL)) {
      return NextResponse.json(cached.data);
    }

    // Compute fresh data
    const data = fetchErrors(agent, type, hours);
    
    // Store in cache
    cache.set(cacheKey, { data, timestamp: now });

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}