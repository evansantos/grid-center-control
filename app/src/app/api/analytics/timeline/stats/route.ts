import { NextResponse } from 'next/server';
import { readdir, stat, readFile, access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';
import { AGENTS_DIR } from '@/lib/constants';

interface TimelineStats {
  overview: {
    totalEvents: number;
    activeSessions: number;
    avgEventRate: number;
    peakConcurrency: number;
  };
}

async function exists(p: string) {
  try {
    await access(p, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const agents = await readdir(AGENTS_DIR).catch(() => []);
    let totalEvents = 0;
    let activeSessions = 0;
    let sessionCount = 0;
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    for (const agent of agents) {
      const sessionsDir = path.join(AGENTS_DIR, agent, 'sessions');
      if (!(await exists(sessionsDir))) continue;

      const files = await readdir(sessionsDir).catch(() => []);
      for (const file of files) {
        if (!file.includes('.jsonl')) continue;
        const filePath = path.join(sessionsDir, file);
        try {
          const s = await stat(filePath);
          sessionCount++;

          // Count as active if modified in last 5 minutes
          if (s.mtime.getTime() > fiveMinutesAgo) {
            activeSessions++;
          }

          // Count events (lines in the file)
          const content = await readFile(filePath, 'utf-8');
          const lines = content.trim().split('\n').filter(Boolean);
          totalEvents += lines.length;
        } catch {
          /* skip */
        }
      }
    }

    // Calculate average event rate (events per session)
    const avgEventRate = sessionCount > 0 ? Math.round(totalEvents / sessionCount) : 0;

    // Peak concurrency is estimated from active sessions
    const peakConcurrency = Math.max(activeSessions, 1);

    const stats: TimelineStats = {
      overview: {
        totalEvents,
        activeSessions,
        avgEventRate,
        peakConcurrency,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to compute timeline stats:', error);
    return NextResponse.json(
      {
        overview: {
          totalEvents: 0,
          activeSessions: 0,
          avgEventRate: 0,
          peakConcurrency: 0,
        },
      },
      { status: 200 }
    );
  }
}
