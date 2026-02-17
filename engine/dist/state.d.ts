import type { GridDB } from './db.js';
import type { Phase } from './types.js';
export interface AdvanceResult {
    success: boolean;
    from?: Phase;
    to?: Phase;
    reason?: string;
}
export declare class StateMachine {
    private db;
    constructor(db: GridDB);
    advance(projectId: string): AdvanceResult;
    private checkGate;
}
