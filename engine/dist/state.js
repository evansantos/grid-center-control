const PHASE_ORDER = ['brainstorm', 'design', 'plan', 'execute', 'review', 'done'];
export class StateMachine {
    db;
    constructor(db) {
        this.db = db;
    }
    advance(projectId) {
        const project = this.db.getProject(projectId);
        if (!project)
            return { success: false, reason: 'Project not found' };
        const currentIndex = PHASE_ORDER.indexOf(project.phase);
        if (currentIndex === PHASE_ORDER.length - 1) {
            return { success: false, reason: 'Project is already done' };
        }
        const gateCheck = this.checkGate(projectId, project.phase);
        if (!gateCheck.passed) {
            return { success: false, from: project.phase, reason: gateCheck.reason };
        }
        const nextPhase = PHASE_ORDER[currentIndex + 1];
        this.db.updateProjectPhase(projectId, nextPhase);
        this.db.createEvent({
            project_id: projectId,
            event_type: 'phase_change',
            details: JSON.stringify({ from: project.phase, to: nextPhase }),
        });
        return { success: true, from: project.phase, to: nextPhase };
    }
    checkGate(projectId, phase) {
        switch (phase) {
            case 'brainstorm': {
                const designs = this.db.listArtifacts(projectId, 'design');
                const approved = designs.filter((a) => a.status === 'approved');
                if (approved.length === 0) {
                    return { passed: false, reason: 'Need at least one approved design artifact' };
                }
                return { passed: true };
            }
            case 'design': {
                const designs = this.db.listArtifacts(projectId, 'design');
                const allApproved = designs.length > 0 && designs.every((a) => a.status === 'approved');
                if (!allApproved) {
                    return { passed: false, reason: 'All design artifacts must be approved' };
                }
                return { passed: true };
            }
            case 'plan': {
                const plans = this.db.listArtifacts(projectId, 'plan');
                const approvedPlans = plans.filter((a) => a.status === 'approved');
                if (approvedPlans.length === 0) {
                    return { passed: false, reason: 'Need an approved plan artifact' };
                }
                const worktrees = this.db.listWorktrees(projectId);
                const active = worktrees.filter((w) => w.status === 'active');
                if (active.length === 0) {
                    return { passed: false, reason: 'Need an active worktree' };
                }
                return { passed: true };
            }
            case 'execute': {
                const tasks = this.db.listTasks(projectId);
                if (tasks.length === 0) {
                    return { passed: false, reason: 'No tasks found' };
                }
                const allApproved = tasks.every((t) => t.status === 'approved');
                if (!allApproved) {
                    return { passed: false, reason: 'All tasks must be approved (spec + quality reviews passed)' };
                }
                return { passed: true };
            }
            case 'review': {
                return { passed: true };
            }
            default:
                return { passed: false, reason: `Unknown phase: ${phase}` };
        }
    }
}
//# sourceMappingURL=state.js.map