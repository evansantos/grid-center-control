import { NextResponse } from 'next/server';
import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const OPENCLAW_DIR = join(process.env.HOME ?? '', '.openclaw');

interface Message {
  role: string;
  content: string;
  timestamp?: string;
}

function extractText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text)
      .join('\n');
  }
  return '';
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: agentId } = await params;
  const url = new URL(request.url);
  const requestedKey = url.searchParams.get('key') ?? '';
  const requestedFile = url.searchParams.get('file') ?? '';
  const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24h ago

  // Look for session files in the agent's sessions dir
  const sessionsDir = join(OPENCLAW_DIR, 'agents', agentId, 'sessions');
  if (!existsSync(sessionsDir)) {
    return NextResponse.json({ messages: [], agentId });
  }

  const files = readdirSync(sessionsDir)
    .filter(f => f.endsWith('.jsonl') && !f.includes('.deleted'))
    .sort((a, b) => {
      try {
        return statSync(join(sessionsDir, b)).mtimeMs - statSync(join(sessionsDir, a)).mtimeMs;
      } catch { return 0; }
    }); // newest by modification time first

  // If a specific file is requested, try that first
  const orderedFiles = requestedFile && files.includes(requestedFile)
    ? [requestedFile, ...files.filter(f => f !== requestedFile)]
    : files;

  // Return the most recent session's messages
  for (const file of orderedFiles) {
    const messages: Message[] = [];
    try {
      const content = readFileSync(join(sessionsDir, file), 'utf-8');
      const lines = content.trim().split('\n').filter(l => l.trim());

      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          if (entry.type !== 'message') continue;

          const msg = entry.message;
          if (!msg) continue;

          const role = msg.role;
          if (role !== 'user' && role !== 'assistant') continue;

          // Skip messages older than 24h
          const ts = entry.timestamp ? new Date(entry.timestamp).getTime() : 0;
          if (ts && ts < cutoff) continue;

          const text = extractText(msg.content);
          if (!text) continue;

          messages.push({
            role,
            content: text,
            timestamp: entry.timestamp ? new Date(entry.timestamp).toISOString() : undefined,
          });
        } catch {}
      }

      if (messages.length > 0) {
        // If a specific session key was requested, check if this file contains it
        if (requestedKey) {
          const hasKey = lines.some(l => {
            try { const e = JSON.parse(l); return e.type === 'session' && e.id === requestedKey; } catch { return false; }
          });
          if (!hasKey) continue;
        }
        return NextResponse.json({ messages, agentId, file });
      }
    } catch {}
  }

  return NextResponse.json({ messages: [], agentId });
}
