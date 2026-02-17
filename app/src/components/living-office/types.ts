/* ── Types ── */
export interface ActivityItem {
  agent: string;
  status: 'active' | 'recent' | 'idle';
  timestamp: string;
  messageCount: number;
  task?: string;
}

export interface Message {
  role: string;
  content: string;
  timestamp?: string;
}

/* ── Agent config ── */
export interface AgentCfg {
  id: string;
  name: string;
  emoji: string;
  color: string;
  accent: string;
  role: string;
  zone: 'boss' | 'engineering' | 'creative' | 'strategy' | 'labs';
  deskPos: { x: number; y: number };
  idleRoutine: 'coffee' | 'water' | 'printer' | 'patrol' | 'inplace';
  accessory: 'tie' | 'hoodie' | 'magnifier' | 'epaulettes' | 'clipboard' | 'glasses' | 'teacup' | 'pen' | 'beret' | 'guitar' | 'readglasses' | 'none';
  monitors: number;
}

/* Positions from PIXEL's design spec (900×600 viewport) */
export const AGENTS: AgentCfg[] = [
  { id: 'mcp',      name: 'MCP',      emoji: '🔴', color: '#dc2626', accent: '#991b1b', role: 'Orchestrator',   zone: 'boss',        deskPos: { x: 70, y: 75 },   idleRoutine: 'inplace', accessory: 'tie',         monitors: 2 },
  { id: 'ceo',      name: 'CEO',      emoji: '👔', color: '#d97706', accent: '#b45309', role: 'CEO',            zone: 'boss',        deskPos: { x: 140, y: 75 },  idleRoutine: 'inplace', accessory: 'tie',         monitors: 2 },
  { id: 'grid',     name: 'GRID',     emoji: '⚡', color: '#8b5cf6', accent: '#6d28d9', role: 'Frontend',       zone: 'engineering',  deskPos: { x: 30, y: 230 },  idleRoutine: 'coffee',  accessory: 'hoodie',      monitors: 3 },
  { id: 'sentinel', name: 'SENTINEL', emoji: '🛡️', color: '#3b82f6', accent: '#1d4ed8', role: 'Security',       zone: 'engineering',  deskPos: { x: 130, y: 230 }, idleRoutine: 'patrol',  accessory: 'epaulettes',  monitors: 1 },
  { id: 'bug',      name: 'BUG',      emoji: '🪲',  color: '#22c55e', accent: '#15803d', role: 'QA Engineer',    zone: 'engineering',  deskPos: { x: 230, y: 230 }, idleRoutine: 'water',   accessory: 'magnifier',   monitors: 2 },
  { id: 'arch',     name: 'ARCH',     emoji: '🏛️', color: '#7c3aed', accent: '#5b21b6', role: 'Architect',      zone: 'engineering',  deskPos: { x: 330, y: 230 }, idleRoutine: 'inplace', accessory: 'glasses',     monitors: 2 },
  { id: 'dev',      name: 'DEV',      emoji: '🔧', color: '#0ea5e9', accent: '#0284c7', role: 'Engineer',       zone: 'engineering',  deskPos: { x: 430, y: 230 }, idleRoutine: 'coffee',  accessory: 'hoodie',      monitors: 2 },
  { id: 'pixel',    name: 'PIXEL',    emoji: '🎨', color: '#f43f5e', accent: '#e11d48', role: 'Designer',       zone: 'creative',     deskPos: { x: 510, y: 230 }, idleRoutine: 'coffee',  accessory: 'beret',       monitors: 1 },
  { id: 'scribe',   name: 'SCRIBE',   emoji: '✍️',  color: '#ec4899', accent: '#be185d', role: 'Writer',         zone: 'creative',     deskPos: { x: 640, y: 230 }, idleRoutine: 'water',   accessory: 'pen',         monitors: 1 },
  { id: 'spec',     name: 'SPEC',     emoji: '📋', color: '#f97316', accent: '#c2410c', role: 'Product',        zone: 'strategy',     deskPos: { x: 50, y: 365 },  idleRoutine: 'water',   accessory: 'clipboard',   monitors: 1 },
  { id: 'sage',     name: 'SAGE',     emoji: '🧠', color: '#eab308', accent: '#a16207', role: 'Strategist',     zone: 'strategy',     deskPos: { x: 180, y: 365 }, idleRoutine: 'inplace', accessory: 'teacup',      monitors: 1 },
  { id: 'atlas',    name: 'ATLAS',    emoji: '📊', color: '#06b6d4', accent: '#0891b2', role: 'Research',       zone: 'labs',         deskPos: { x: 410, y: 365 }, idleRoutine: 'printer', accessory: 'glasses',     monitors: 3 },
  { id: 'riff',     name: 'RIFF',     emoji: '🎸', color: '#ef4444', accent: '#b91c1c', role: 'Audio',          zone: 'labs',         deskPos: { x: 540, y: 365 }, idleRoutine: 'inplace', accessory: 'guitar',      monitors: 1 },
  { id: 'vault',    name: 'VAULT',    emoji: '📚', color: '#10b981', accent: '#047857', role: 'Knowledge',      zone: 'labs',         deskPos: { x: 670, y: 365 }, idleRoutine: 'inplace', accessory: 'readglasses', monitors: 1 },
];

export const AGENT_MAP = Object.fromEntries(AGENTS.map(a => [a.id, a]));

/* ── Shared locations ── */
export const LOCATIONS = {
  coffee:  { x: 520, y: 85 },
  water:   { x: 580, y: 85 },
  printer: { x: 340, y: 500 },
  patrol1: { x: 50, y: 500 },
  patrol2: { x: 800, y: 500 },
};

export const FLOOR_W = 900;
export const FLOOR_H = 580;
