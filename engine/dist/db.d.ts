import type { Database as DatabaseType } from 'better-sqlite3';
import type { Project, Artifact, ArtifactType, ArtifactStatus, Worktree, Task, TaskStatus, ReviewType, Event, Phase } from './types.js';
export declare class GridDB {
    private db;
    constructor(dbPath: string);
    raw(): DatabaseType;
    close(): void;
    createProject(input: {
        name: string;
        repo_path: string;
    }): Project;
    listProjects(): Project[];
    getProject(id: string): Project | null;
    setModelConfig(projectId: string, config: Record<string, string>): void;
    updateProjectPhase(id: string, phase: Phase): void;
    private parseProject;
    createArtifact(input: {
        project_id: string;
        type: ArtifactType;
        content: string;
        file_path?: string;
    }): Artifact;
    getArtifact(id: string): Artifact | null;
    listArtifacts(projectId: string, type?: ArtifactType): Artifact[];
    updateArtifactStatus(id: string, status: ArtifactStatus, feedback?: string): void;
    createWorktree(input: {
        project_id: string;
        branch: string;
        path: string;
    }): Worktree;
    listWorktrees(projectId: string): Worktree[];
    createTask(input: {
        project_id: string;
        task_number: number;
        title: string;
        description: string;
        artifact_id?: string;
        worktree_id?: string;
    }): Task;
    getTask(id: string): Task | null;
    listTasks(projectId: string): Task[];
    startTask(id: string): void;
    updateTaskStatus(id: string, status: TaskStatus): void;
    setTaskReview(id: string, type: ReviewType, result: string): void;
    approveTask(id: string): void;
    setTaskAgent(id: string, sessionKey: string): void;
    createTaskBatch(projectId: string, tasks: {
        task_number: number;
        title: string;
        description: string;
        artifact_id?: string;
        worktree_id?: string;
    }[]): Task[];
    getTaskBatch(projectId: string, from: number, to: number): Task[];
    getModelForPhase(projectId: string, phase: string): string;
    createEvent(input: {
        project_id: string;
        event_type: string;
        details?: string;
    }): void;
    listEvents(projectId: string, limit?: number): Event[];
}
