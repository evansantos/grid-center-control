import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { AGENTS_DIR } from '@/lib/constants';
const DATE_RE = /^\d{4}-\d{2}-\d{2}\.md$/;

interface CalendarEntry {
  date: string;
  agents: string[];
  size: number;
  previews: Record<string, string>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // YYYY-MM format
    const day = searchParams.get('day'); // YYYY-MM-DD for detail

    const entries: Map<string, CalendarEntry> = new Map();

    const agentDirs = await fs.readdir(AGENTS_DIR, { withFileTypes: true }).catch(() => []);
    for (const agentDir of agentDirs) {
      if (!agentDir.isDirectory()) continue;
      const memoryDir = path.join(AGENTS_DIR, agentDir.name, 'workspace', 'memory');
      let files: string[];
      try {
        files = await fs.readdir(memoryDir);
      } catch (error) { console.error(`[calendar] Failed to read memory dir for agent ${agentDir.name}`, error); continue; }

      for (const file of files) {
        if (!DATE_RE.test(file)) continue;
        const date = file.replace('.md', '');
        if (month && !date.startsWith(month)) continue;
        if (day && date !== day) continue;

        const filePath = path.join(memoryDir, file);
        const stat = await fs.stat(filePath);

        const existing = entries.get(date) || { date, agents: [], size: 0, previews: {} };
        existing.agents.push(agentDir.name);
        existing.size += stat.size;

        // For day detail, include preview
        if (day) {
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            existing.previews[agentDir.name] = content.slice(0, 200);
          } catch (error) { console.error(`[calendar] Failed to read file preview for ${agentDir.name}/${file}`, error); }
        }

        entries.set(date, existing);
      }
    }

    return NextResponse.json({ entries: Array.from(entries.values()) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read calendar data' }, { status: 500 });
  }
}
