import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir, stat, access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';
import os from 'os';
import { summarizeCosts, type TokenUsage } from '@/lib/cost-calculator';

const AGENTS_DIR = path.join(os.homedir(), '.openclaw', 'agents');

async function exists(p: string) { try { await access(p, constants.R_OK); return true; } catch { /* existence check */ return false; } }

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get('period') as 'daily' | 'monthly' || 'daily';

  try {
    const usages = await collectTokenUsage(period);
    const summary = summarizeCosts(usages, period);
    return NextResponse.json(summary);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

async function collectTokenUsage(period: 'daily' | 'monthly'): Promise<TokenUsage[]> {
  const usages: TokenUsage[] = [];
  const now = new Date();
  const cutoff = period === 'daily'
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
    : new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    if (!(await exists(AGENTS_DIR))) return usages;
    const agents = await readdir(AGENTS_DIR);

    for (const agent of agents) {
      const sessionsDir = path.join(AGENTS_DIR, agent, 'sessions');
      if (!(await exists(sessionsDir))) continue;

      try {
        const sessions = await readdir(sessionsDir);
        for (const session of sessions) {
          const sessionPath = path.join(sessionsDir, session);
          const s = await stat(sessionPath);
          if (s.mtime < cutoff) continue;

          const metaPath = path.join(sessionPath, 'metadata.json');
          if (await exists(metaPath)) {
            try {
              const meta = JSON.parse(await readFile(metaPath, 'utf-8'));
              if (meta.tokenUsage) {
                usages.push({
                  agent,
                  model: meta.model || 'unknown',
                  inputTokens: meta.tokenUsage.input || 0,
                  outputTokens: meta.tokenUsage.output || 0,
                  timestamp: s.mtime.toISOString(),
                });
              }
            } catch (err) { console.error("[costs] malformed metadata", err); }
          }

          if (!(await exists(metaPath))) {
            const files = (await readdir(sessionPath)).filter(f => f.endsWith('.json'));
            let totalSize = 0;
            for (const f of files) {
              try { totalSize += (await stat(path.join(sessionPath, f))).size; } catch (err) { console.error(err); }
            }
            if (totalSize > 0) {
              const estimatedTokens = Math.floor(totalSize / 4);
              usages.push({
                agent,
                model: 'estimated',
                inputTokens: Math.floor(estimatedTokens * 0.6),
                outputTokens: Math.floor(estimatedTokens * 0.4),
                timestamp: s.mtime.toISOString(),
              });
            }
          }
        }
      } catch (err) { console.error("[costs] agent processing error", err); }
    }
  } catch (err) { console.error("[costs] collectTokenUsage error", err); }

  return usages;
}
