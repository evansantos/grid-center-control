export type Phase = 'brainstorm' | 'design' | 'plan' | 'execute' | 'review' | 'done';
export type ArtifactType = 'design' | 'plan';
export type ArtifactStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';
export type WorktreeStatus = 'active' | 'merged' | 'discarded';
export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'approved' | 'failed';
export type ReviewType = 'spec' | 'quality';
export type EventType = 'phase_change' | 'approval' | 'task_update' | 'review';
export interface Project {
    id: string;
    name: string;
    repo_path: string;
    phase: Phase;
    model_config: Record<string, string> | null;
    created_at: string;
    updated_at: string;
}
export interface Artifact {
    id: string;
    project_id: string;
    type: ArtifactType;
    content: string;
    file_path: string | null;
    status: ArtifactStatus;
    feedback: string | null;
    created_at: string;
    updated_at: string;
}
export interface Worktree {
    id: string;
    project_id: string;
    branch: string;
    path: string;
    status: WorktreeStatus;
    created_at: string;
}
export interface Task {
    id: string;
    project_id: string;
    artifact_id: string | null;
    worktree_id: string | null;
    task_number: number;
    title: string;
    description: string;
    status: TaskStatus;
    agent_session: string | null;
    spec_review: string | null;
    quality_review: string | null;
    started_at: string | null;
    completed_at: string | null;
}
export interface Event {
    id: number;
    project_id: string;
    event_type: EventType;
    details: string | null;
    created_at: string;
}
export declare const DEFAULT_MODEL_CONFIG: Record<Phase, string>;
