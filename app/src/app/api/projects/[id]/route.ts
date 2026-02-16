import { NextResponse } from 'next/server';
import { getProject, listArtifacts, listTasks, listWorktrees, listEvents } from '@/lib/queries';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    project,
    artifacts: listArtifacts(id),
    tasks: listTasks(id),
    worktrees: listWorktrees(id),
    events: listEvents(id, 20),
  });
}
