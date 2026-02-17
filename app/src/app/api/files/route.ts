import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const WORKSPACE_ROOT_RAW = path.join(os.homedir(), '.openclaw', 'workspace');
const MAX_FILE_SIZE = 100 * 1024; // 100KB

// Resolve WORKSPACE_ROOT to its canonical (realpath) form at startup
// so symlinked roots still work correctly.
let WORKSPACE_ROOT = WORKSPACE_ROOT_RAW;
(async () => {
  try {
    WORKSPACE_ROOT = await fs.realpath(WORKSPACE_ROOT_RAW);
  } catch {
    // If the directory doesn't exist yet, keep the raw path
  }
})();

async function safePath(relativePath: string): Promise<string | null> {
  // Block null bytes
  if (relativePath.includes('\0')) return null;

  // Block double-encoding attacks — reject any literal '%'
  if (relativePath.includes('%')) return null;

  // Block '..' segments as defense-in-depth
  if (relativePath.includes('..')) return null;

  const resolved = path.resolve(WORKSPACE_ROOT, relativePath);

  // Use realpath to resolve symlinks, then check containment
  let canonical: string;
  try {
    canonical = await fs.realpath(resolved);
  } catch {
    // Path doesn't exist — fall back to resolved but still check prefix
    canonical = resolved;
  }

  if (!canonical.startsWith(WORKSPACE_ROOT + path.sep) && canonical !== WORKSPACE_ROOT) {
    return null;
  }

  return canonical;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const reqPath = searchParams.get('path') ?? '';
  const wantContent = searchParams.get('content') === 'true';

  const resolved = await safePath(reqPath);
  if (!resolved) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    if (wantContent) {
      const stat = await fs.stat(resolved);
      if (stat.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'File too large' }, { status: 413 });
      }
      const content = await fs.readFile(resolved, 'utf-8');
      return new NextResponse(content, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const entries = await fs.readdir(resolved, { withFileTypes: true });
    const results = await Promise.all(
      entries
        .filter((e) => !e.name.startsWith('.'))
        .map(async (e) => {
          try {
            const fullPath = path.join(resolved, e.name);
            const stat = await fs.stat(fullPath);
            return {
              name: e.name,
              type: e.isDirectory() ? 'dir' : 'file',
              size: stat.size,
              mtime: stat.mtime.toISOString(),
            };
          } catch (error) { /* stat failed */
            return null;
          }
        })
    );

    return NextResponse.json(results.filter(Boolean));
  } catch (err: unknown) {
    console.error('Files API error:', err);
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
