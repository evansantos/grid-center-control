/* ── Types & Constants for Isometric Office ── */

export interface ActivityItem {
  agent: string;
  status: 'active' | 'recent' | 'idle';
  timestamp: string;
  messageCount: number;
  task?: string;
}

export interface AgentCfg {
  id: string;
  name: string;
  emoji: string;
  color: string;
  role: string;
  zone: 'boss' | 'engineering' | 'creative' | 'strategy' | 'labs';
  pos: { x: number; y: number };
  accessory: string;
}

export interface SessionMessage {
  role: string;
  content: string;
  timestamp?: string;
}

export type RoleFilter = 'all' | 'user' | 'assistant' | 'system';

export const AGENTS: AgentCfg[] = [
  { id: 'mcp',      name: 'MCP',      emoji: '🔴', color: 'var(--grid-danger)', role: 'Orchestrator',  zone: 'boss',        pos: { x: 120, y: 90 },  accessory: '👑' },
  { id: 'ceo',      name: 'CEO',      emoji: '👔', color: '#d97706', role: 'CEO',           zone: 'boss',        pos: { x: 220, y: 90 },  accessory: '👔' },
  { id: 'grid',     name: 'GRID',     emoji: '⚡', color: 'var(--grid-purple)', role: 'Frontend',      zone: 'engineering', pos: { x: 60, y: 240 },  accessory: '🧥' },
  { id: 'sentinel', name: 'SENTINEL', emoji: '🛡️', color: 'var(--grid-info)', role: 'Security',      zone: 'engineering', pos: { x: 160, y: 240 }, accessory: '🛡️' },
  { id: 'bug',      name: 'BUG',      emoji: '🪲',  color: 'var(--grid-success)', role: 'QA Engineer',   zone: 'engineering', pos: { x: 260, y: 240 }, accessory: '🔍' },
  { id: 'arch',     name: 'ARCH',     emoji: '🏛️', color: '#7c3aed', role: 'Architect',     zone: 'engineering', pos: { x: 360, y: 240 }, accessory: '📐' },
  { id: 'dev',      name: 'DEV',      emoji: '🔧', color: '#0ea5e9', role: 'Engineer',      zone: 'engineering', pos: { x: 460, y: 240 }, accessory: '💻' },
  { id: 'pixel',    name: 'PIXEL',    emoji: '🎨', color: '#f43f5e', role: 'Designer',      zone: 'creative',    pos: { x: 580, y: 240 }, accessory: '🎨' },
  { id: 'scribe',   name: 'SCRIBE',   emoji: '✍️',  color: '#ec4899', role: 'Writer',        zone: 'creative',    pos: { x: 700, y: 240 }, accessory: '✏️' },
  { id: 'spec',     name: 'SPEC',     emoji: '📋', color: 'var(--grid-orange)', role: 'Product',       zone: 'strategy',    pos: { x: 100, y: 390 }, accessory: '📋' },
  { id: 'sage',     name: 'SAGE',     emoji: '🧠', color: 'var(--grid-yellow)', role: 'Strategist',    zone: 'strategy',    pos: { x: 240, y: 390 }, accessory: '🍵' },
  { id: 'atlas',    name: 'ATLAS',    emoji: '📊', color: '#06b6d4', role: 'Research',      zone: 'labs',        pos: { x: 440, y: 390 }, accessory: '📊' },
  { id: 'riff',     name: 'RIFF',     emoji: '🎸', color: 'var(--grid-error)', role: 'Audio',         zone: 'labs',        pos: { x: 580, y: 390 }, accessory: '🎸' },
  { id: 'vault',    name: 'VAULT',    emoji: '📚', color: '#10b981', role: 'Knowledge',     zone: 'labs',        pos: { x: 710, y: 390 }, accessory: '📚' },
];

export const FLOOR_W = 840;
export const FLOOR_H = 520;
