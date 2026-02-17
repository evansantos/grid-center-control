/** Parse raw SSE activity events into structured activity items */

export interface ParsedActivity {
  id: string;
  agent: string;
  type: 'message' | 'tool-call' | 'tool-result' | 'thinking' | 'error' | 'session-start' | 'session-end' | 'file-change';
  summary: string;
  detail?: string;
  timestamp: string;
  raw?: unknown;
}

export interface RawSSEEvent {
  agent: string;
  eventType: string;
  filename: string;
  timestamp: string;
}

let counter = 0;

export function parseActivityEvent(event: RawSSEEvent): ParsedActivity {
  const { agent, eventType, filename, timestamp } = event;
  const id = `${agent}-${++counter}-${Date.now()}`;

  // Determine type from filename patterns
  const type = inferType(filename, eventType);
  const summary = buildSummary(agent, type, filename);

  return { id, agent, type, summary, detail: filename, timestamp };
}

function inferType(filename: string, eventType: string): ParsedActivity['type'] {
  if (filename.includes('tool')) return 'tool-call';
  if (filename.includes('error') || filename.includes('fail')) return 'error';
  if (filename.includes('think')) return 'thinking';
  if (filename.includes('result')) return 'tool-result';
  if (eventType === 'rename') return 'file-change';
  return 'message';
}

function buildSummary(agent: string, type: ParsedActivity['type'], filename: string): string {
  const agentUpper = agent.toUpperCase();
  switch (type) {
    case 'tool-call': return `${agentUpper} is using a tool`;
    case 'tool-result': return `${agentUpper} received tool result`;
    case 'thinking': return `${agentUpper} is thinking...`;
    case 'error': return `${agentUpper} encountered an error`;
    case 'session-start': return `${agentUpper} started a session`;
    case 'session-end': return `${agentUpper} ended session`;
    case 'file-change': return `${agentUpper} file changed: ${filename}`;
    default: return `${agentUpper} activity: ${filename}`;
  }
}

export function parseMultipleEvents(events: RawSSEEvent[]): ParsedActivity[] {
  return events.map(parseActivityEvent);
}

/** Deduplicate activities by id, keep latest */
export function deduplicateActivities(items: ParsedActivity[], maxItems = 100): ParsedActivity[] {
  const seen = new Map<string, ParsedActivity>();
  for (const item of items) {
    seen.set(item.id, item);
  }
  return Array.from(seen.values())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, maxItems);
}
