import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const ALLOWED_FILES = ['SOUL.md', 'TOOLS.md', 'HEARTBEAT.md'];

function getAgentWorkspacePath(agentName: string): string {
  return join(homedir(), '.openclaw', 'agents', agentName, 'workspace');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workspacePath = getAgentWorkspacePath(id);
    
    const files: Record<string, string> = {};
    
    for (const fileName of ALLOWED_FILES) {
      const filePath = join(workspacePath, fileName);
      try {
        if (existsSync(filePath)) {
          files[fileName] = readFileSync(filePath, 'utf-8');
        } else {
          files[fileName] = '';
        }
      } catch (error) {
        console.error(`Error reading ${fileName}:`, error);
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
    const { file, content } = await request.json();
    
    if (!ALLOWED_FILES.includes(file)) {
      return NextResponse.json(
        { error: `File ${file} is not allowed. Only ${ALLOWED_FILES.join(', ')} are supported.` },
        { status: 400 }
      );
    }
    
    const workspacePath = getAgentWorkspacePath(id);
    const filePath = join(workspacePath, file);
    
    writeFileSync(filePath, content, 'utf-8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/agents/[id]/config:', error);
    return NextResponse.json(
      { error: 'Failed to save agent configuration file' },
      { status: 500 }
    );
  }
}