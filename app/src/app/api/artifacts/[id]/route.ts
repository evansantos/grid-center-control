import { NextResponse } from 'next/server';
import { ArtifactActionSchema, validateBody } from '@/lib/validators';
import { updateArtifactStatus, createEvent, getArtifact } from '@/lib/queries';
import { sendNotification } from '@/lib/notify';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const raw = await req.json();
  const validated = validateBody(ArtifactActionSchema, raw);
  if (!validated.success) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const { action, projectId, feedback } = validated.data;

  if (action === 'approve') {
    updateArtifactStatus(id, 'approved');
    createEvent(projectId, 'approval', JSON.stringify({ artifact_id: id, status: 'approved', source: 'dashboard' }));
    const artifact = getArtifact(id);
    sendNotification({
      timestamp: new Date().toISOString(),
      type: 'artifact_approved',
      projectId,
      details: { artifactId: id, artifactType: artifact?.type },
    });
  } else if (action === 'reject') {
    updateArtifactStatus(id, 'rejected', feedback);
    createEvent(projectId, 'approval', JSON.stringify({ artifact_id: id, status: 'rejected', feedback, source: 'dashboard' }));
    sendNotification({
      timestamp: new Date().toISOString(),
      type: 'artifact_rejected',
      projectId,
      details: { artifactId: id, feedback },
    });
  }

  return NextResponse.json(getArtifact(id));
}
