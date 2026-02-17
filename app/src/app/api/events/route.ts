import { NextRequest } from 'next/server';
import { listProjects, listArtifacts, listTasks, listWorktrees, listEvents } from '@/lib/queries';

// Server-Sent Events endpoint for real-time dashboard updates
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get('projectId');

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (error) {
          /* Stream closed — client disconnected */
          closed = true;
        }
      };

      // Send initial state
      if (projectId) {
        send({
          type: 'init',
          artifacts: listArtifacts(projectId),
          tasks: listTasks(projectId),
          worktrees: listWorktrees(projectId),
          events: listEvents(projectId, 10),
        });
      } else {
        send({
          type: 'init',
          projects: listProjects(),
        });
      }

      // Poll for changes every 2s and push updates
      let lastEventCount = projectId ? listEvents(projectId, 1)?.[0]?.id ?? 0 : 0;
      let lastTaskHash = '';

      const interval = setInterval(() => {
        if (closed) {
          clearInterval(interval);
          return;
        }

        try {
          if (projectId) {
            const tasks = listTasks(projectId);
            const taskHash = tasks.map(t => `${t.task_number}:${t.status}:${t.spec_review}:${t.quality_review}`).join('|');

            if (taskHash !== lastTaskHash) {
              lastTaskHash = taskHash;
              send({
                type: 'update',
                artifacts: listArtifacts(projectId),
                tasks,
              });
            }

            const latestEvent = listEvents(projectId, 1)?.[0];
            if (latestEvent && latestEvent.id !== lastEventCount) {
              lastEventCount = latestEvent.id;
              send({
                type: 'event',
                event: latestEvent,
              });
            }
          } else {
            send({
              type: 'update',
              projects: listProjects(),
            });
          }
        } catch (error) {
          console.error('[events] SSE poll error', error);
          closed = true;
          clearInterval(interval);
        }
      }, 2000);

      // Cleanup on abort
      req.signal.addEventListener('abort', () => {
        closed = true;
        clearInterval(interval);
        try { controller.close(); } catch (error) { /* controller already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
