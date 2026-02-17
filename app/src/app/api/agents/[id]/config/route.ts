import { NextRequest, NextResponse } from 'next/server';
import { AgentConfigSchema, validateBody } from '@/lib/validators';
import { readFile, writeFile, access } from 'fs/promises';
import { constants } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';
import { MAX_AGENT_ID_LENGTH } from '@/lib/constants';

const ALLOWED_FILES = ['SOUL.md', 'TOOLS.md', 'HEARTBEAT.md'];
const MAX_CONTENT_LENGTH = 100000; // 100KB max for config files

function getAgentWorkspacePath(agentName: string): string {
  return join(homedir(), '.openclaw', 'agents', agentName, 'workspace');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || id.length > MAX_AGENT_ID_LENGTH || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    const workspacePath = getAgentWorkspacePath(id);
    
    const files: Record<string, string> = {};
    
    for (const fileName of ALLOWED_FILES) {
      const filePath = resolve(join(workspacePath, fileName));
      if (!filePath.startsWith(resolve(workspacePath))) continue;
      try {
        await access(filePath, constants.R_OK);
        files[fileName] = await readFile(filePath, 'utf-8');
      } catch (error) { /* config read failed */
        /* file not found — expected for new agents */
        files[fileName] = '';
      }
    }
    
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error in GET /api/agents/[id]/config:', error);
    return NextResponse.json(
      { error: 'Failed to read agent configuration files' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || id.length > MAX_AGENT_ID_LENGTH || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    const raw = await request.json();
    const validated = validateBody(AgentConfigSchema, raw);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { file, content } = validated.data;
    
    if (!ALLOWED_FILES.includes(file)) {
      return NextResponse.json(
        { error: `File ${file} is not allowed. Only ${ALLOWED_FILES.join(', ')} are supported.` },
        { status: 400 }
      );
    }

    if (typeof content !== 'string' || content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Content must be a string of max ${MAX_CONTENT_LENGTH} chars` },
        { status: 400 }
      );
    }
    
    const workspacePath = getAgentWorkspacePath(id);
    const filePath = resolve(join(workspacePath, file));
    
    if (!filePath.startsWith(resolve(workspacePath))) {
      return NextResponse.json({ error: 'Path traversal detected' }, { status: 400 });
    }
    
    await writeFile(filePath, content, 'utf-8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/agents/[id]/config:', error);
    return NextResponse.json(
      { error: 'Failed to save agent configuration file' },
      { status: 500 }
    );
  }
}
