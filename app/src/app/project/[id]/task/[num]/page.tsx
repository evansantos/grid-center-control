import { notFound } from 'next/navigation';
import { getProject, listTasks } from '@/lib/queries';
import { PhaseBadge } from '@/components/phase-badge';
import { TaskContent } from './client';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function TaskPage({ params }: { params: Promise<{ id: string; num: string }> }) {
  const { id, num } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const tasks = listTasks(id);
  const task = tasks.find((t) => t.task_number === parseInt(num));
  if (!task) notFound();

  return (
    <div>
      <Link href={`/project/${id}`} className="text-sm text-red-400 hover:underline mb-4 inline-block">
        ← Back to {project.name}
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Task #{task.task_number}: {task.title}</h1>
        <PhaseBadge phase={task.status} />
      </div>

      <div className="flex gap-6 text-sm text-zinc-500 mb-6">
        {task.started_at && <span>Started: {new Date(task.started_at).toLocaleString()}</span>}
        {task.completed_at && <span>Completed: {new Date(task.completed_at).toLocaleString()}</span>}
        {task.agent_session && <span>Agent: <code className="text-zinc-400">{task.agent_session}</code></span>}
      </div>

      <TaskContent description={task.description} specReview={task.spec_review} qualityReview={task.quality_review} />
    </div>
  );
}
