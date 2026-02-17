import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { apiError } from '@/lib/api-error';

export const dynamic = 'force-dynamic';

interface Recommendation {
  type: 'stale_pending' | 'long_running' | 'needs_review' | 'ready_to_close';
  severity: 'warning' | 'info' | 'urgent';
  message: string;
  count?: number;
  projectName?: string;
}

export async function GET() {
  try {
    const db = getDB();
    const recommendations: Recommendation[] = [];

    // 1. Stale pending tasks (created >1h ago, never started)
    const stalePending = db.prepare(`
      SELECT COUNT(*) as cnt FROM tasks
      WHERE status = 'pending' AND started_at IS NULL
        AND id IN (SELECT t.id FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.created_at < datetime('now', '-1 hour'))
    `).get() as { cnt: number } | undefined;
    // Simpler: tasks pending with no started_at. We approximate "created >1h ago" via project created_at
    // Actually, tasks don't have created_at. Let's use a different approach - check if the task's project was created >1h ago
    // Re-query more accurately
    const stalePending2 = db.prepare(`
      SELECT COUNT(*) as cnt FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE t.status = 'pending' AND t.started_at IS NULL
        AND p.created_at < datetime('now', '-1 hour')
    `).get() as { cnt: number };
    if (stalePending2.cnt > 0) {
      recommendations.push({
        type: 'stale_pending',
        severity: 'warning',
        message: `${stalePending2.cnt} task(s) pending for over 1 hour without being started`,
        count: stalePending2.cnt,
      });
    }

    // 2. Long-running tasks (in_progress for >2h)
    const longRunning = db.prepare(`
      SELECT COUNT(*) as cnt FROM tasks
      WHERE status = 'in_progress' AND started_at < datetime('now', '-2 hours')
    `).get() as { cnt: number };
    if (longRunning.cnt > 0) {
      recommendations.push({
        type: 'long_running',
        severity: 'warning',
        message: `${longRunning.cnt} task(s) in progress for over 2 hours`,
        count: longRunning.cnt,
      });
    }

    // 3. Tasks needing review
    const needsReview = db.prepare(`
      SELECT COUNT(*) as cnt FROM tasks
      WHERE status = 'review' AND (spec_review IS NULL OR quality_review IS NULL)
    `).get() as { cnt: number };
    if (needsReview.cnt > 0) {
      recommendations.push({
        type: 'needs_review',
        severity: 'urgent',
        message: `${needsReview.cnt} task(s) in review awaiting spec or quality review`,
        count: needsReview.cnt,
      });
    }

    // 4. Projects ready to close (not done, but all tasks are done/approved)
    const readyToClose = db.prepare(`
      SELECT p.name FROM projects p
      WHERE p.phase != 'done'
        AND (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) > 0
        AND (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status NOT IN ('done', 'approved')) = 0
    `).all() as { name: string }[];
    for (const row of readyToClose) {
      recommendations.push({
        type: 'ready_to_close',
        severity: 'info',
        message: `Project "${row.name}" has all tasks completed and can be closed`,
        projectName: row.name,
      });
    }

    return NextResponse.json({ recommendations });
  } catch (e: unknown) {
    return apiError(e);
  }
}
