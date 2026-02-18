import { notFound } from 'next/navigation';
export const dynamic = 'force-dynamic';
import { getProject, listArtifacts, listTasks, listWorktrees } from '@/lib/queries';
import { PhaseBadge } from '@/components/phase-badge';
import { ProjectClient } from './client';


export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const artifacts = listArtifacts(id);
  const tasks = listTasks(id);
  const worktrees = listWorktrees(id);

  return (
    <div>
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <PhaseBadge phase={project.phase} />
      </div>
      <p className="text-sm text-zinc-500 mb-6">📁 {project.repo_path}</p>


      <div className="flex gap-4 mb-6">
        <a href={`/project/${id}/log`} className="text-sm text-red-400 hover:underline">📜 Event Log</a>
      </div>

      <ProjectClient
        projectId={id}
        initialArtifacts={artifacts}
        initialTasks={tasks}
        initialWorktrees={worktrees}
        phase={project.phase}
      />
    </div>
  );
}
