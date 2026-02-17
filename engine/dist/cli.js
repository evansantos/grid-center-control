#!/usr/bin/env node
import { Command } from 'commander';
import { GridDB } from './db.js';
import { StateMachine } from './state.js';
import { WorktreeManager } from './worktree.js';
import { Orchestrator } from './orchestrator.js';
import { parsePlan } from './parser.js';
import fs from 'fs';
import path from 'path';
const DEFAULT_DB = path.join(process.env.HOME ?? '~', 'workspace/mcp-projects/grid/grid.db');
const dbPath = process.env.GRID_DB ?? DEFAULT_DB;
const db = new GridDB(dbPath);
const sm = new StateMachine(db);
const orch = new Orchestrator(db);
const program = new Command();
program.name('grid').version('0.1.0');
function output(data) {
    console.log(JSON.stringify(data, null, 2));
}
// --- Project commands ---
const project = program.command('project');
project.command('create')
    .requiredOption('--name <name>', 'Project name')
    .requiredOption('--repo <path>', 'Repository path')
    .action((opts) => {
    const p = db.createProject({ name: opts.name, repo_path: opts.repo });
    db.createEvent({ project_id: p.id, event_type: 'phase_change', details: JSON.stringify({ to: 'brainstorm' }) });
    output(p);
});
project.command('list').action(() => {
    output(db.listProjects());
});
project.command('phase <id>').action((id) => {
    const p = db.getProject(id);
    if (!p) {
        output({ error: 'Project not found' });
        process.exit(2);
    }
    output({ id: p.id, name: p.name, phase: p.phase });
});
project.command('set-model <id>')
    .requiredOption('--phase <phase>', 'Phase to configure')
    .requiredOption('--model <model>', 'Model alias')
    .action((id, opts) => {
    const p = db.getProject(id);
    if (!p) {
        output({ error: 'Project not found' });
        process.exit(2);
    }
    const config = p.model_config ?? {};
    config[opts.phase] = opts.model;
    db.setModelConfig(id, config);
    output({ id, model_config: config });
});
project.command('model <id>')
    .requiredOption('--phase <phase>', 'Phase to query')
    .action((id, opts) => {
    const model = db.getModelForPhase(id, opts.phase);
    output({ id, phase: opts.phase, model });
});
// --- Artifact commands ---
const artifact = program.command('artifact');
artifact.command('create <projectId>')
    .requiredOption('--type <type>', 'design or plan')
    .option('--content <content>', 'Markdown content')
    .option('--file <path>', 'Read content from file')
    .action((projectId, opts) => {
    const content = opts.file
        ? fs.readFileSync(opts.file, 'utf-8')
        : opts.content ?? '';
    const a = db.createArtifact({ project_id: projectId, type: opts.type, content, file_path: opts.file });
    output(a);
});
artifact.command('approve <projectId> <artifactId>').action((projectId, artifactId) => {
    db.updateArtifactStatus(artifactId, 'approved');
    db.createEvent({ project_id: projectId, event_type: 'approval', details: JSON.stringify({ artifact_id: artifactId, status: 'approved' }) });
    output(db.getArtifact(artifactId));
});
artifact.command('reject <projectId> <artifactId>')
    .option('--feedback <text>', 'Rejection reason')
    .action((projectId, artifactId, opts) => {
    db.updateArtifactStatus(artifactId, 'rejected', opts.feedback);
    db.createEvent({ project_id: projectId, event_type: 'approval', details: JSON.stringify({ artifact_id: artifactId, status: 'rejected', feedback: opts.feedback }) });
    output(db.getArtifact(artifactId));
});
artifact.command('status <projectId>')
    .option('--type <type>', 'Filter by type')
    .action((projectId, opts) => {
    output(db.listArtifacts(projectId, opts.type));
});
// --- Worktree commands ---
const worktree = program.command('worktree');
worktree.command('create <projectId>')
    .requiredOption('--branch <branch>', 'Branch name')
    .action((projectId, opts) => {
    const p = db.getProject(projectId);
    if (!p) {
        output({ error: 'Project not found' });
        process.exit(2);
    }
    const wm = new WorktreeManager(p.repo_path);
    const wtPath = wm.create(opts.branch);
    const wt = db.createWorktree({ project_id: projectId, branch: opts.branch, path: wtPath });
    output(wt);
});
worktree.command('list <projectId>').action((projectId) => {
    output(db.listWorktrees(projectId));
});
worktree.command('cleanup <projectId>').action((projectId) => {
    const worktrees = db.listWorktrees(projectId);
    const p = db.getProject(projectId);
    if (!p) {
        output({ error: 'Project not found' });
        process.exit(2);
    }
    const wm = new WorktreeManager(p.repo_path);
    const removed = [];
    for (const wt of worktrees) {
        if (wt.status === 'merged' || wt.status === 'discarded') {
            try {
                wm.remove(wt.path);
            }
            catch { }
            removed.push(wt.id);
        }
    }
    output({ removed });
});
// --- Task commands ---
const task = program.command('task');
task.command('list <projectId>').action((projectId) => {
    output(db.listTasks(projectId));
});
task.command('start <projectId> <taskNumber>').action((projectId, taskNumber) => {
    const tasks = db.listTasks(projectId);
    const t = tasks.find((t) => t.task_number === parseInt(taskNumber));
    if (!t) {
        output({ error: 'Task not found' });
        process.exit(2);
    }
    db.startTask(t.id);
    db.createEvent({ project_id: projectId, event_type: 'task_update', details: JSON.stringify({ task: taskNumber, status: 'in_progress' }) });
    output(db.getTask(t.id));
});
task.command('update <projectId> <taskNumber>')
    .requiredOption('--status <status>', 'New status')
    .action((projectId, taskNumber, opts) => {
    const tasks = db.listTasks(projectId);
    const t = tasks.find((t) => t.task_number === parseInt(taskNumber));
    if (!t) {
        output({ error: 'Task not found' });
        process.exit(2);
    }
    db.updateTaskStatus(t.id, opts.status);
    db.createEvent({ project_id: projectId, event_type: 'task_update', details: JSON.stringify({ task: taskNumber, status: opts.status }) });
    output(db.getTask(t.id));
});
task.command('review <projectId> <taskNumber>')
    .requiredOption('--type <type>', 'spec or quality')
    .requiredOption('--result <result>', 'pass or fail')
    .option('--feedback <text>', 'Review feedback')
    .action((projectId, taskNumber, opts) => {
    const tasks = db.listTasks(projectId);
    const t = tasks.find((t) => t.task_number === parseInt(taskNumber));
    if (!t) {
        output({ error: 'Task not found' });
        process.exit(2);
    }
    const resultText = opts.result === 'pass'
        ? `PASS${opts.feedback ? ': ' + opts.feedback : ''}`
        : `FAIL${opts.feedback ? ': ' + opts.feedback : ''}`;
    db.setTaskReview(t.id, opts.type, resultText);
    // Auto-approve if both reviews pass
    const updated = db.getTask(t.id);
    if (updated.spec_review?.startsWith('PASS') && updated.quality_review?.startsWith('PASS')) {
        db.approveTask(t.id);
    }
    db.createEvent({ project_id: projectId, event_type: 'review', details: JSON.stringify({ task: taskNumber, type: opts.type, result: opts.result }) });
    output(db.getTask(t.id));
});
task.command('parse <projectId>')
    .requiredOption('--file <path>', 'Plan markdown file')
    .option('--artifact <id>', 'Link tasks to artifact')
    .option('--worktree <id>', 'Link tasks to worktree')
    .action((projectId, opts) => {
    const content = fs.readFileSync(opts.file, 'utf-8');
    const parsed = parsePlan(content);
    const tasks = db.createTaskBatch(projectId, parsed.map(t => ({
        ...t,
        artifact_id: opts.artifact,
        worktree_id: opts.worktree,
    })));
    output({ tasks_created: tasks.length, tasks: tasks.map(t => ({ number: t.task_number, title: t.title })) });
});
task.command('batch <projectId>')
    .requiredOption('--from <n>', 'Start task number')
    .requiredOption('--to <n>', 'End task number')
    .action((projectId, opts) => {
    output(db.getTaskBatch(projectId, parseInt(opts.from), parseInt(opts.to)));
});
// --- Advance ---
program.command('advance <projectId>').action((projectId) => {
    const result = sm.advance(projectId);
    if (!result.success)
        process.exitCode = 1;
    output(result);
});
// --- Log ---
program.command('log <projectId>')
    .option('--limit <n>', 'Limit results', '20')
    .action((projectId, opts) => {
    output(db.listEvents(projectId, parseInt(opts.limit)));
});
// --- Orchestrator commands ---
const orchestrate = program.command('orch');
orchestrate.command('status <projectId>').action((projectId) => {
    output(orch.status(projectId));
});
orchestrate.command('progress <projectId>').action((projectId) => {
    console.log(orch.progressMessage(projectId));
});
orchestrate.command('complete <projectId> <taskNumber>')
    .option('--result <result>', 'pass or fail', 'pass')
    .option('--feedback <text>', 'Completion feedback')
    .action((projectId, taskNumber, opts) => {
    const task = orch.completeTask(projectId, parseInt(taskNumber), opts.result, opts.feedback);
    output(task);
});
orchestrate.command('start-batch <projectId>')
    .requiredOption('--tasks <numbers>', 'Comma-separated task numbers')
    .action((projectId, opts) => {
    const nums = opts.tasks.split(',').map(Number);
    orch.startBatch(projectId, nums);
    output({ started: nums });
});
orchestrate.command('next <projectId>')
    .option('--size <n>', 'Batch size', '3')
    .action((projectId, opts) => {
    const batch = orch.getNextBatch(projectId, parseInt(opts.size));
    if (!batch) {
        output({ message: 'No tasks ready to spawn (either all done or tasks in progress)' });
    }
    else {
        output(batch);
    }
});
program.parse();
//# sourceMappingURL=cli.js.map