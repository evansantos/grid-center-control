type CallbackAction = 'approve' | 'reject' | 'view' | 'continue' | 'pause';

const VALID_ACTIONS = new Set<string>(['approve', 'reject', 'view', 'continue', 'pause']);

export interface GridCallback {
  action: CallbackAction;
  id: string;
}

export interface InlineButton {
  text: string;
  callback_data: string;
}

export function parseGridCallback(message: string): GridCallback | null {
  const parts = message.split(':');
  if (parts.length !== 3 || parts[0] !== 'grid' || !VALID_ACTIONS.has(parts[1]) || !parts[2]) {
    return null;
  }
  return { action: parts[1] as CallbackAction, id: parts[2] };
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
