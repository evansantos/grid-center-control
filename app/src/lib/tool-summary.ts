/** Summarize tool calls into human-readable speech bubble text */

export interface ToolCall {
  name: string;
  args?: Record<string, unknown>;
  result?: string;
}

const TOOL_EMOJIS: Record<string, string> = {
  read: '📖',
  write: '✍️',
  edit: '✏️',
  exec: '⚡',
  web_search: '🔍',
  web_fetch: '🌐',
  browser: '🖥️',
  image: '🖼️',
  message: '💬',
  tts: '🔊',
  sessions_spawn: '🚀',
};

export function summarizeToolCall(tool: ToolCall): string {
  const emoji = TOOL_EMOJIS[tool.name] || '🔧';
  const name = tool.name;

  switch (name) {
    case 'read':
    case 'Read':
      return `${emoji} Reading ${truncatePath(tool.args?.file_path || tool.args?.path)}`;
    case 'write':
    case 'Write':
      return `${emoji} Writing ${truncatePath(tool.args?.file_path || tool.args?.path)}`;
    case 'edit':
    case 'Edit':
      return `${emoji} Editing ${truncatePath(tool.args?.file_path || tool.args?.path)}`;
    case 'exec':
      return `${emoji} Running: ${truncate(String(tool.args?.command || ''), 40)}`;
    case 'web_search':
      return `${emoji} Searching: "${truncate(String(tool.args?.query || ''), 30)}"`;
    case 'web_fetch':
      return `${emoji} Fetching ${truncate(String(tool.args?.url || ''), 40)}`;
    case 'sessions_spawn':
      return `🚀 Spawning sub-agent: ${truncate(String(tool.args?.label || tool.args?.task || ''), 30)}`;
    case 'message':
      return `💬 Sending message`;
    default:
      return `🔧 ${name}`;
  }
}

export function summarizeContent(content: string, maxLen = 60): string {
  if (!content) return '';
  // Strip markdown artifacts
  const clean = content.replace(/```[\s\S]*?```/g, '[code]').replace(/\n+/g, ' ').trim();
  return truncate(clean, maxLen);
}

function truncatePath(p: unknown): string {
  if (!p) return '...';
  const s = String(p);
  const parts = s.split('/');
  if (parts.length > 3) return `.../${parts.slice(-2).join('/')}`;
  return s;
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + '…' : s;
}
