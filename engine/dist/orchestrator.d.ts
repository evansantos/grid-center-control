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
import type { Task } from './types.js';
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
    totalProgress?: {
        done: number;
        total: number;
    };
    message?: string;
    telegramButtons?: {
        text: string;
        callback_data: string;
    }[][];
}
export declare class Orchestrator {
    private db;
    constructor(db: GridDB);
    /**
     * Get current progress for a project
     */
    getProgress(projectId: string): {
        done: number;
        total: number;
        pending: number;
        inProgress: number;
    };
    /**
     * Mark a task as complete and run reviews
     */
    completeTask(projectId: string, taskNumber: number, result: 'pass' | 'fail', feedback?: string): Task;
    /**
     * Mark multiple tasks as in-progress
     */
    startBatch(projectId: string, taskNumbers: number[]): void;
    /**
     * Determine the next batch of tasks to execute
     * Groups sequential dependent tasks vs parallel independent ones
     */
    getNextBatch(projectId: string, batchSize?: number): BatchPlan | null;
    /**
     * Get the full orchestration status and recommended next action
     */
    status(projectId: string): OrchestrateResult;
    /**
     * Generate a progress summary for Telegram
     */
    progressMessage(projectId: string): string;
}
