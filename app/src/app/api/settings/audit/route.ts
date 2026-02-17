import { NextRequest, NextResponse } from 'next/server';

export interface AuditEntry {
  id: string;
  timestamp: string;
  agent: string;
  field: string;
  changeType: 'config_update' | 'model_change' | 'restart' | 'key_rotation';
  oldValue: string;
  newValue: string;
  changedBy: string;
  severity: 'info' | 'warning' | 'critical';
}

const now = new Date('2026-02-17T16:00:00Z');
const d = (daysAgo: number, hours = 0) => new Date(now.getTime() - daysAgo * 86400000 - hours * 3600000).toISOString();

const sampleEntries: AuditEntry[] = [
  { id: '1',  timestamp: d(0, 1),  agent: 'summarizer',   field: 'temperature',     changeType: 'config_update', oldValue: '0.7',            newValue: '0.4',            changedBy: 'evandro', severity: 'info' },
  { id: '2',  timestamp: d(0, 3),  agent: 'code-review',  field: 'model',           changeType: 'model_change',  oldValue: 'gpt-4o',         newValue: 'claude-opus-4',  changedBy: 'evandro', severity: 'warning' },
  { id: '3',  timestamp: d(0, 5),  agent: 'planner',      field: 'api_key',         changeType: 'key_rotation',  oldValue: 'sk-ant-...q9Wz', newValue: 'sk-ant-...nR3m', changedBy: 'system',  severity: 'critical' },
  { id: '4',  timestamp: d(1, 2),  agent: 'chat-agent',   field: 'max_tokens',      changeType: 'config_update', oldValue: '4096',           newValue: '8192',           changedBy: 'evandro', severity: 'info' },
  { id: '5',  timestamp: d(1, 8),  agent: 'research-bot',  field: 'status',          changeType: 'restart',       oldValue: 'running',        newValue: 'restarted',      changedBy: 'system',  severity: 'warning' },
  { id: '6',  timestamp: d(2, 4),  agent: 'architect',    field: 'system_prompt',   changeType: 'config_update', oldValue: '(truncated)',     newValue: '(truncated)',    changedBy: 'evandro', severity: 'info' },
  { id: '7',  timestamp: d(2, 10), agent: 'summarizer',   field: 'model',           changeType: 'model_change',  oldValue: 'gpt-4o-mini',    newValue: 'gpt-4o',         changedBy: 'evandro', severity: 'warning' },
  { id: '8',  timestamp: d(3, 1),  agent: 'legacy-bot',   field: 'api_key',         changeType: 'key_rotation',  oldValue: 'sk-...nB4x',     newValue: '(revoked)',       changedBy: 'system',  severity: 'critical' },
  { id: '9',  timestamp: d(3, 6),  agent: 'code-review',  field: 'top_p',           changeType: 'config_update', oldValue: '1.0',            newValue: '0.9',            changedBy: 'evandro', severity: 'info' },
  { id: '10', timestamp: d(4, 3),  agent: 'planner',      field: 'timeout',         changeType: 'config_update', oldValue: '30s',            newValue: '60s',            changedBy: 'evandro', severity: 'info' },
  { id: '11', timestamp: d(5, 0),  agent: 'chat-agent',   field: 'status',          changeType: 'restart',       oldValue: 'error',          newValue: 'restarted',      changedBy: 'system',  severity: 'critical' },
  { id: '12', timestamp: d(5, 7),  agent: 'research-bot',  field: 'model',           changeType: 'model_change',  oldValue: 'gemini-1.5',     newValue: 'gemini-2.0',     changedBy: 'evandro', severity: 'warning' },
  { id: '13', timestamp: d(6, 2),  agent: 'summarizer',   field: 'frequency_penalty', changeType: 'config_update', oldValue: '0.0',          newValue: '0.3',            changedBy: 'evandro', severity: 'info' },
  { id: '14', timestamp: d(6, 9),  agent: 'architect',    field: 'status',          changeType: 'restart',       oldValue: 'running',        newValue: 'restarted',      changedBy: 'evandro', severity: 'warning' },
  { id: '15', timestamp: d(7, 1),  agent: 'code-review',  field: 'api_key',         changeType: 'key_rotation',  oldValue: 'sk-...old1',     newValue: 'sk-...a3Xf',     changedBy: 'system',  severity: 'critical' },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agent = searchParams.get('agent');
  const field = searchParams.get('field');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  let filtered = [...sampleEntries];
  if (agent) filtered = filtered.filter(e => e.agent === agent);
  if (field) filtered = filtered.filter(e => e.field === field);
  if (from) filtered = filtered.filter(e => e.timestamp >= from);
  if (to) filtered = filtered.filter(e => e.timestamp <= to);

  return NextResponse.json(filtered);
}
