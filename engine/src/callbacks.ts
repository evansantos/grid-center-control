type CallbackAction = 'approve' | 'reject' | 'view' | 'continue' | 'pause' | 'advance' | 'batch';

const VALID_ACTIONS = new Set<string>(['approve', 'reject', 'view', 'continue', 'pause', 'advance', 'batch']);

export interface GridCallback {
  action: CallbackAction;
  id: string;
  extra?: string; // additional data after the id (e.g., task numbers for batch)
}

export interface InlineButton {
  text: string;
  callback_data: string;
}

export function parseGridCallback(message: string): GridCallback | null {
  const parts = message.split(':');
  if (parts.length < 3 || parts[0] !== 'grid' || !VALID_ACTIONS.has(parts[1])) {
    return null;
  }
  return {
    action: parts[1] as CallbackAction,
    id: parts[2],
    extra: parts.length > 3 ? parts.slice(3).join(':') : undefined,
  };
}

export function formatButtons(type: 'approval' | 'checkpoint', ...ids: string[]): InlineButton[][] {
  if (type === 'approval') {
    const [artifactId, projectId] = ids;
    return [[
      { text: '✅ Approve', callback_data: `grid:approve:${artifactId}` },
      { text: '❌ Revise', callback_data: `grid:reject:${artifactId}` },
      { text: '💬 Dashboard', callback_data: `grid:view:${projectId}` },
    ]];
  }
  const [projectId] = ids;
  return [[
    { text: '▶️ Continue', callback_data: `grid:continue:${projectId}` },
    { text: '⏸ Pause', callback_data: `grid:pause:${projectId}` },
    { text: '🔍 Dashboard', callback_data: `grid:view:${projectId}` },
  ]];
}

// Alias for use in orchestrator
export const formatTelegramButtons = formatButtons;

/**
 * Format orchestrator-specific buttons
 */
export function orchButtons(projectId: string, action: 'launch' | 'advance' | 'progress', taskNums?: number[]): InlineButton[][] {
  switch (action) {
    case 'launch':
      return [[
        { text: `▶️ Launch Tasks ${taskNums?.join(', ')}`, callback_data: `grid:batch:${projectId}:${taskNums?.join(',')}` },
        { text: '⏸️ Skip', callback_data: `grid:pause:${projectId}` },
      ]];
    case 'advance':
      return [[
        { text: '✅ Advance to Review', callback_data: `grid:advance:${projectId}` },
        { text: '🔍 Dashboard', callback_data: `grid:view:${projectId}` },
      ]];
    case 'progress':
      return [[
        { text: '📊 Progress', callback_data: `grid:view:${projectId}` },
      ]];
    default:
      return [];
  }
}
