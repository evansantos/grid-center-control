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

  if (!agentId || !/^[a-zA-Z0-9_-]+$/.test(agentId)) {
    return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
  }

  const url = new URL(request.url);
  const requestedKey = url.searchParams.get('key') ?? '';
  const requestedFile = url.searchParams.get('file') ?? '';
  const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24h ago

  // MCP's agent id in the office map is 'mcp' but sessions live under 'main'
  const resolvedId = agentId === 'mcp' ? 'main' : agentId;

  // Look for session files in the agent's sessions dir
  const sessionsDir = join(OPENCLAW_DIR, 'agents', resolvedId, 'sessions');
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

  // Aggregate messages from ALL session files within 24h window
  const allMessages: Message[] = [];
  const sessionFiles: string[] = [];

  for (const file of orderedFiles) {
    try {
      const content = readFileSync(join(sessionsDir, file), 'utf-8');
      const lines = content.trim().split('\n').filter(l => l.trim());

      // If a specific session key was requested, check if this file contains it
      if (requestedKey) {
        const hasKey = lines.some(l => {
          try { const e = JSON.parse(l); return e.type === 'session' && e.id === requestedKey; } catch { return false; }
        });
        if (!hasKey) continue;
      }

      let fileHasMessages = false;
      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          if (entry.type !== 'message') continue;

          const msg = entry.message;
          if (!msg) continue;

          const role = msg.role;
          if (!role || !['user', 'assistant', 'system'].includes(role)) continue;

          const ts = entry.timestamp ? new Date(entry.timestamp).getTime() : 0;
          if (ts && ts < cutoff) continue;

          const text = extractText(msg.content);
          if (!text) continue;

          allMessages.push({
            role,
            content: text,
            timestamp: entry.timestamp ? new Date(entry.timestamp).toISOString() : undefined,
          });
          fileHasMessages = true;
        } catch {}
      }
      if (fileHasMessages) sessionFiles.push(file);
    } catch {}
  }

  // Sort all messages chronologically
  allMessages.sort((a, b) => {
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return ta - tb;
  });

  return NextResponse.json({
    messages: allMessages,
    agentId,
    sessions: sessionFiles.length,
  });
}
