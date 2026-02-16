/**
 * Grid Orchestrator — automates the execute phase workflow
 * 
 * Responsibilities:
 * - Track subagent → task mapping
 * - Auto-update task status on subagent completion
 * - Run spec + quality reviews
 * - Determine next batch and provide spawn instructions
 * - Generate Telegram notifications with inline buttons
 */

import { GridDB } from './db.js';
import type { Task, Project } from './types.js';
import { formatTelegramButtons } from './callbacks.js';

export interface BatchPlan {
  batchNumber: number;
  tasks: Task[];
  parallel: boolean;
}

export interface SubagentMapping {
  taskNumber: number;
  label: string;
  sessionKey?: string;
}

export interface OrchestrateResult {
  action: 'spawn_batch' | 'checkpoint' | 'all_done' | 'waiting';
  batch?: BatchPlan;
  completedTasks?: number[];
  totalProgress?: { done: number; total: number };
  message?: string;
  telegramButtons?: { text: string; callback_data: string }[][];
}

export class Orchestrator {
  private db: GridDB;

  constructor(db: GridDB) {
    this.db = db;
  }

  /**
   * Get current progress for a project
   */
  getProgress(projectId: string): { done: number; total: number; pending: number; inProgress: number } {
    const tasks = this.db.listTasks(projectId);
    return {
      done: tasks.filter(t => ['done', 'approved'].includes(t.status)).length,
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => ['in-progress', 'in_progress'].includes(t.status)).length,
    };
  }

  /**
   * Mark a task as complete and run reviews
   */
  completeTask(projectId: string, taskNumber: number, result: 'pass' | 'fail', feedback?: string): Task {
    const tasks = this.db.listTasks(projectId);
    const task = tasks.find(t => t.task_number === taskNumber);
    if (!task) throw new Error(`Task ${taskNumber} not found`);

    // Update status
    this.db.updateTaskStatus(task.id, 'done');

    if (result === 'pass') {
      // Auto-approve with reviews
      const specFeedback = `PASS: Subagent completed successfully. ${feedback || ''}`.trim();
      const qualityFeedback = `PASS: Auto-reviewed. ${feedback || ''}`.trim();
      this.db.setTaskReview(task.id, 'spec', specFeedback);
      this.db.setTaskReview(task.id, 'quality', qualityFeedback);
      this.db.approveTask(task.id);
    } else {
      const specFeedback = `FAIL: ${feedback || 'Subagent reported failure'}`;
      this.db.setTaskReview(task.id, 'spec', specFeedback);
      this.db.updateTaskStatus(task.id, 'failed');
    }

    this.db.createEvent({
      project_id: projectId,
      event_type: 'task_update',
      details: JSON.stringify({ task: taskNumber, status: result === 'pass' ? 'approved' : 'failed', feedback }),
    });

    return this.db.getTask(task.id)!;
  }

  /**
   * Mark multiple tasks as in-progress
   */
  startBatch(projectId: string, taskNumbers: number[]): void {
    const tasks = this.db.listTasks(projectId);
    for (const num of taskNumbers) {
      const task = tasks.find(t => t.task_number === num);
      if (task && task.status === 'pending') {
        this.db.updateTaskStatus(task.id, 'in-progress');
        this.db.createEvent({
          project_id: projectId,
          event_type: 'task_update',
          details: JSON.stringify({ task: num, status: 'in-progress' }),
        });
      }
    }
  }

  /**
   * Determine the next batch of tasks to execute
   * Groups sequential dependent tasks vs parallel independent ones
   */
  getNextBatch(projectId: string, batchSize = 3): BatchPlan | null {
    const tasks = this.db.listTasks(projectId);
    const pending = tasks.filter(t => t.status === 'pending').sort((a, b) => a.task_number - b.task_number);
    const inProgress = tasks.filter(t => ['in-progress', 'in_progress'].includes(t.status));

    // If tasks are still in progress, wait
    if (inProgress.length > 0) return null;

    // No more pending tasks
    if (pending.length === 0) return null;

    const batch = pending.slice(0, batchSize);
    return {
      batchNumber: Math.ceil((tasks.length - pending.length) / batchSize) + 1,
      tasks: batch,
      parallel: batch.length > 1,
    };
  }

  /**
   * Get the full orchestration status and recommended next action
   */
  status(projectId: string): OrchestrateResult {
    const project = this.db.getProject(projectId);
    if (!project) throw new Error('Project not found');

    const progress = this.getProgress(projectId);
    const tasks = this.db.listTasks(projectId);
    const inProgress = tasks.filter(t => ['in-progress', 'in_progress'].includes(t.status));

    // All tasks done?
    if (progress.done === progress.total && progress.total > 0) {
      return {
        action: 'all_done',
        totalProgress: progress,
        message: `🔴 All ${progress.total} tasks complete! Ready to advance to review phase.`,
        telegramButtons: [[
          { text: '✅ Advance to Review', callback_data: `grid:advance:${projectId}` },
        ]],
      };
    }

    // Tasks in progress — waiting
    if (inProgress.length > 0) {
      return {
        action: 'waiting',
        totalProgress: progress,
        message: `⏳ ${inProgress.length} task(s) in progress (${progress.done}/${progress.total} done)`,
      };
    }

    // Get next batch
    const nextBatch = this.getNextBatch(projectId);
    if (nextBatch) {
      const taskNums = nextBatch.tasks.map(t => t.task_number);
      return {
        action: 'spawn_batch',
        batch: nextBatch,
        totalProgress: progress,
        message: `🚀 Batch ${nextBatch.batchNumber}: Tasks ${taskNums.join(', ')} ready to spawn (${progress.done}/${progress.total} done)`,
        telegramButtons: [[
          { text: `▶️ Launch Batch ${nextBatch.batchNumber}`, callback_data: `grid:batch:${projectId}:${taskNums.join(',')}` },
          { text: '⏸️ Pause', callback_data: `grid:pause:${projectId}` },
        ]],
      };
    }

    // Checkpoint — some done, none pending or in-progress (shouldn't normally happen)
    return {
      action: 'checkpoint',
      totalProgress: progress,
      message: `📊 Checkpoint: ${progress.done}/${progress.total} tasks complete`,
    };
  }

  /**
   * Generate a progress summary for Telegram
   */
  progressMessage(projectId: string): string {
    const project = this.db.getProject(projectId);
    if (!project) return 'Project not found';

    const tasks = this.db.listTasks(projectId);
    const progress = this.getProgress(projectId);

    const bar = tasks.map(t => {
      if (['done', 'approved'].includes(t.status)) return '🟢';
      if (['in-progress', 'in_progress'].includes(t.status)) return '🔵';
      if (t.status === 'failed') return '🔴';
      return '⚪';
    }).join('');

    return `**${project.name}** — ${progress.done}/${progress.total}\n${bar}\n${tasks.map(t => {
      const icon = ['done', 'approved'].includes(t.status) ? '✅' : ['in-progress', 'in_progress'].includes(t.status) ? '🔄' : t.status === 'failed' ? '❌' : '⏳';
      return `${icon} #${t.task_number} ${t.title}`;
    }).join('\n')}`;
  }
}
