type CallbackAction = 'approve' | 'reject' | 'view' | 'continue' | 'pause' | 'advance' | 'batch';
export interface GridCallback {
    action: CallbackAction;
    id: string;
    extra?: string;
}
export interface InlineButton {
    text: string;
    callback_data: string;
}
export declare function parseGridCallback(message: string): GridCallback | null;
export declare function formatButtons(type: 'approval' | 'checkpoint', ...ids: string[]): InlineButton[][];
export declare const formatTelegramButtons: typeof formatButtons;
/**
 * Format orchestrator-specific buttons
 */
export declare function orchButtons(projectId: string, action: 'launch' | 'advance' | 'progress', taskNums?: number[]): InlineButton[][];
export {};
