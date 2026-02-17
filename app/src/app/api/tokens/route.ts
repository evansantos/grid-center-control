import { NextResponse } from 'next/server';
import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const OPENCLAW_DIR = join(process.env.HOME ?? '', '.openclaw');

// Module-level cache with 10s TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 1000; // 10 seconds

interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  sessionCount: number;
}

interface TokenData {
  agents: Record<string, TokenUsage>;
  daily: Record<string, number>;
  total: { input: number; output: number; total: number };
}

function fetchTokenUsage(): TokenData {
  const agentsDir = join(OPENCLAW_DIR, 'agents');
  const result: TokenData = {
    agents: {},
    daily: {},
    total: { input: 0, output: 0, total: 0 }
  };

  if (!existsSync(agentsDir)) {
    return result;
  }

  const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
  const today = new Date().toISOString().split('T')[0];

  const agentDirs = readdirSync(agentsDir).filter(d => {
    try { return statSync(join(agentsDir, d)).isDirectory(); } catch { return false; }
  });

  for (const agentId of agentDirs) {
    const sessionsDir = join(agentsDir, agentId, 'sessions');
    if (!existsSync(sessionsDir)) continue;

    // Map main → mcp for consistency
    const displayAgent = agentId === 'main' ? 'mcp' : agentId;
    
    if (!result.agents[displayAgent]) {
      result.agents[displayAgent] = {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        sessionCount: 0
      };
    }

    const files = readdirSync(sessionsDir)
      .filter(f => f.endsWith('.jsonl'))
      .map(f => ({ name: f, mtime: statSync(join(sessionsDir, f)).mtimeMs }))
      .filter(f => f.mtime > cutoff); // Only last 24 hours

    for (const file of files) {
      try {
        const content = readFileSync(join(sessionsDir, file.name), 'utf-8');
        const lines = content.trim().split('\n').filter(l => l.trim());
        
        let hasSession = false;
        
        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            
            // Track sessions
            if (entry.type === 'session') {
              hasSession = true;
            }
            
            // Look for entries with usage field
            if (entry.usage) {
              const usage = entry.usage;
              const inputTokens = usage.input_tokens || 0;
              const outputTokens = usage.output_tokens || 0;
              const totalTokens = inputTokens + outputTokens;
              
              // Aggregate by agent
              result.agents[displayAgent].inputTokens += inputTokens;
              result.agents[displayAgent].outputTokens += outputTokens;
              result.agents[displayAgent].totalTokens += totalTokens;
              
              // Aggregate by day (use today for all recent entries)
              result.daily[today] = (result.daily[today] || 0) + totalTokens;
              
              // Aggregate total
              result.total.input += inputTokens;
              result.total.output += outputTokens;
              result.total.total += totalTokens;
            }
          } catch {
            // Skip malformed lines
          }
        }
        
        if (hasSession) {
          result.agents[displayAgent].sessionCount++;
        }
      } catch {
        // Skip files that can't be read
      }
    }
  }

  return result;
}

export async function GET() {
  try {
    const cacheKey = 'tokens';
    const now = Date.now();
    const cached = cache.get(cacheKey);

    // Check if cache hit and not expired
    if (cached && (now - cached.timestamp < CACHE_TTL)) {
      return NextResponse.json(cached.data);
    }

    // Compute fresh data
    const data = fetchTokenUsage();
    
    // Store in cache
    cache.set(cacheKey, { data, timestamp: now });

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}