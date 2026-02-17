import { NextRequest, NextResponse } from 'next/server';
import { SoulUpdateSchema, validateBody } from '@/lib/validators';
import { promises as fs } from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { AGENTS_DIR } from '@/lib/constants';

const execFileAsync = promisify(execFile);
const VALID_FILES = ['SOUL.md', 'IDENTITY.md', 'USER.md', 'AGENTS.md', 'TOOLS.md'];
const AGENT_ID_RE = /^[a-zA-Z0-9_-]+$/;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent');
    const file = searchParams.get('file') || 'SOUL.md';
    
    if (!agentId || !AGENT_ID_RE.test(agentId)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }
    if (!VALID_FILES.includes(file)) {
      return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
    }
    
    const filePath = path.join(AGENTS_DIR, agentId, 'workspace', file);
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(AGENTS_DIR)) {
      return NextResponse.json({ error: 'Path traversal' }, { status: 403 });
    }
    
    let content = '';
    try {
      content = await fs.readFile(resolved, 'utf-8');
    } catch (error) {
      /* File may not exist yet for new agents — expected */
      content = '';
    }
    
    // Git history
    let history: { hash: string; message: string; date: string }[] = [];
    try {
      const { stdout } = await execFileAsync('git', [
        'log', '-5', '--format=%H|%s|%ai', '--', resolved
      ], { cwd: path.join(AGENTS_DIR, agentId, 'workspace') });
      history = stdout.trim().split('\n').filter(Boolean).map(line => {
        const [hash, message, date] = line.split('|');
        return { hash, message, date };
      });
    } catch (error) { console.error(`[soul] Failed to read git history for ${resolved}`, error); }
    
    // List available agents
    const agents = searchParams.get('list') === 'true' ? await listAgents() : undefined;
    
    return NextResponse.json({ content, history, agents });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}

async function listAgents(): Promise<string[]> {
  try {
    const entries = await fs.readdir(AGENTS_DIR, { withFileTypes: true });
    return entries.filter(e => e.isDirectory()).map(e => e.name);
  } catch (error) {
    console.error('[soul] Failed to list agents', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const validated = validateBody(SoulUpdateSchema, raw);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { agent, file, content, revertHash } = validated.data;
    
    if (!VALID_FILES.includes(file)) {
      return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
    }
    
    const filePath = path.join(AGENTS_DIR, agent, 'workspace', file);
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(AGENTS_DIR)) {
      return NextResponse.json({ error: 'Path traversal' }, { status: 403 });
    }
    
    if (revertHash && /^[a-f0-9]{7,40}$/.test(revertHash)) {
      await execFileAsync('git', ['checkout', revertHash, '--', resolved], {
        cwd: path.join(AGENTS_DIR, agent, 'workspace')
      });
      const reverted = await fs.readFile(resolved, 'utf-8');
      return NextResponse.json({ success: true, content: reverted });
    }
    
    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'Content required' }, { status: 400 });
    }
    
    await fs.writeFile(resolved, content, 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
  }
}
