import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { summarizeCosts, type TokenUsage } from '@/lib/cost-calculator';

const AGENTS_DIR = path.join(process.env.HOME || '', '.openclaw', 'agents');

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get('period') as 'daily' | 'monthly' || 'daily';

  try {
    const usages = collectTokenUsage(period);
    const summary = summarizeCosts(usages, period);
    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

function collectTokenUsage(period: 'daily' | 'monthly'): TokenUsage[] {
  const usages: TokenUsage[] = [];
  const now = new Date();
  const cutoff = period === 'daily'
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
    : new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    if (!fs.existsSync(AGENTS_DIR)) return usages;
    const agents = fs.readdirSync(AGENTS_DIR);

    for (const agent of agents) {
      const sessionsDir = path.join(AGENTS_DIR, agent, 'sessions');
      if (!fs.existsSync(sessionsDir)) continue;

      try {
        const sessions = fs.readdirSync(sessionsDir);
        for (const session of sessions) {
          const sessionPath = path.join(sessionsDir, session);
          const stat = fs.statSync(sessionPath);
          if (stat.mtime < cutoff) continue;

          // Try to read session metadata for token usage
          const metaPath = path.join(sessionPath, 'metadata.json');
          if (fs.existsSync(metaPath)) {
            try {
              const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
              if (meta.tokenUsage) {
                usages.push({
                  agent,
                  model: meta.model || 'unknown',
                  inputTokens: meta.tokenUsage.input || 0,
                  outputTokens: meta.tokenUsage.output || 0,
                  timestamp: stat.mtime.toISOString(),
                });
              }
            } catch { /* skip malformed */ }
          }

          // Estimate from session file sizes if no metadata
          if (!fs.existsSync(metaPath)) {
            const files = fs.readdirSync(sessionPath).filter(f => f.endsWith('.json'));
            let totalSize = 0;
            for (const f of files) {
              try { totalSize += fs.statSync(path.join(sessionPath, f)).size; } catch {}
            }
            if (totalSize > 0) {
              // Rough estimate: ~4 chars per token
              const estimatedTokens = Math.floor(totalSize / 4);
              usages.push({
                agent,
                model: 'estimated',
                inputTokens: Math.floor(estimatedTokens * 0.6),
                outputTokens: Math.floor(estimatedTokens * 0.4),
                timestamp: stat.mtime.toISOString(),
              });
            }
          }
        }
      } catch { /* skip agent */ }
    }
  } catch { /* ignore */ }

  return usages;
}
