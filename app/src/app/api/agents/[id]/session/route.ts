import { NextResponse } from 'next/server';
import { readFile, readdir, stat, access } from 'fs/promises';
import { constants } from 'fs';
import { join } from 'path';
import os from 'os';

const OPENCLAW_DIR = join(os.homedir(), '.openclaw');

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

  if (!agentId || agentId.length > MAX_AGENT_ID_LENGTH || !/^[a-zA-Z0-9_-]+$/.test(agentId)) {
    return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
  }

  const url = new URL(request.url);
  const requestedKey = url.searchParams.get('key') ?? '';
  const requestedFile = url.searchParams.get('file') ?? '';
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;

  const resolvedId = agentId === 'mcp' ? 'main' : agentId;
  const sessionsDir = join(OPENCLAW_DIR, 'agents', resolvedId, 'sessions');

  try { await access(sessionsDir, constants.R_OK); } catch { /* sessions dir not found */
    /* sessions dir not found — expected for new agents */
    return NextResponse.json({ messages: [], agentId });
  }

  const allFiles = (await readdir(sessionsDir))
    .filter(f => f.endsWith('.jsonl') && !f.includes('.deleted'));

  // Get stats for sorting
  const fileStats = await Promise.all(
    allFiles.map(async f => {
      try { const s = await stat(join(sessionsDir, f)); return { name: f, mtime: s.mtimeMs }; } catch (err) { console.error('[session] stat failed', err); return null; }
    })
  );
  const files = fileStats
    .filter((f): f is { name: string; mtime: number } => f !== null)
    .sort((a, b) => b.mtime - a.mtime)
    .map(f => f.name);

  const orderedFiles = requestedFile && files.includes(requestedFile)
    ? [requestedFile, ...files.filter(f => f !== requestedFile)]
    : files;

  const allMessages: Message[] = [];
  const sessionFiles: string[] = [];

  for (const file of orderedFiles) {
    try {
      const content = await readFile(join(sessionsDir, file), 'utf-8');
      const lines = content.trim().split('\n').filter(l => l.trim());

      if (requestedKey) {
        const hasKey = lines.some(l => {
          try { const e = JSON.parse(l); return e.type === 'session' && e.id === requestedKey; } catch { /* malformed JSON — skip */ return false; }
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
        } catch (err) { console.error('[session] line parse error', err); }
      }
      if (fileHasMessages) sessionFiles.push(file);
    } catch (err) { console.error('[session] file read error', err); }
  }

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
