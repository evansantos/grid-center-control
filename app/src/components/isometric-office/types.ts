/* ── Types & Constants for Living Office ── */

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
  colorDark: string;
  role: string;
  zone: 'boss' | 'engineering' | 'creative' | 'strategy' | 'labs';
  deskPos: { x: number; y: number };
  hairColor: string;
  accessory: string;
}

// Avatar-specific types
export interface AvatarStyle {
  skinTone: string;
  hairStyle: 'slicked' | 'professional' | 'spiky' | 'buzz' | 'messy' | 'wavy' | 'flowing' | 'bob' | 'wise' | 'neat' | 'rock' | 'professorial';
  outfitPattern?: 'pinstripes' | 'lightning' | 'tactical' | 'paint-splatters' | 'ink-stains' | 'data-patterns' | 'music-notes' | 'books';
}

export interface Position {
  x: number;
  y: number;
}

export interface AgentPosition extends Position {
  state: 'active' | 'recent' | 'idle' | 'meeting' | 'walking';
  targetX?: number;
  targetY?: number;
  walkingDuration?: number;
  activity?: string;
}

export interface MeetingState {
  active: boolean;
  orchestrator: string;
  participants: string[];
  task: string;
  startTime: number;
}

export interface SessionMessage {
  role: string;
  content: string;
  timestamp?: string;
}

export type RoleFilter = 'all' | 'user' | 'assistant' | 'system';

// Expanded floor dimensions for the new layout
export const FLOOR_W = 960;
export const FLOOR_H = 680;

// Individual Desk Positions — absolute canvas coordinates matching Room layout
// Each position = center of the cubicle area where the agent avatar sits
export const DESK_POSITIONS = {
  // Boss Office: Room x=15, y=30, padding ~35px top
  mcp:  { x: 65,  y: 100, zone: 'boss' },
  ceo:  { x: 160, y: 100, zone: 'boss' },
  
  // Engineering: Room x=15, y=200, padding ~35px top  
  grid:     { x: 55,  y: 270, zone: 'engineering' },
  sentinel: { x: 130, y: 270, zone: 'engineering' },
  bug:      { x: 205, y: 270, zone: 'engineering' },
  arch:     { x: 280, y: 270, zone: 'engineering' },
  dev:      { x: 355, y: 270, zone: 'engineering' },
  
  // Creative: Room x=15, y=365
  pixel:  { x: 65,  y: 435, zone: 'creative' },
  scribe: { x: 155, y: 435, zone: 'creative' },
  
  // Strategy: Room x=350, y=365
  spec: { x: 405, y: 435, zone: 'strategy' },
  sage: { x: 495, y: 435, zone: 'strategy' },
  
  // Labs: Room x=15, y=530
  atlas: { x: 65,  y: 600, zone: 'labs' },
  riff:  { x: 155, y: 600, zone: 'labs' },
  vault: { x: 245, y: 600, zone: 'labs' },
} as const;

// Common Area Positions (idle agents)
export const COMMON_AREA_SPOTS = [
  { x: 600, y: 60, type: 'couch-left' },
  { x: 640, y: 60, type: 'couch-center' },
  { x: 680, y: 60, type: 'couch-right' },
  { x: 760, y: 50, type: 'coffee-machine' },
  { x: 820, y: 80, type: 'standing-table-1' },
  { x: 860, y: 80, type: 'standing-table-2' },
  { x: 900, y: 60, type: 'plant-area' },
] as const;

// Meeting Room Layout
export const MEETING_ROOM_POSITIONS = {
  presenter: { x: 760, y: 520, facing: 'whiteboard' }, // SPEC position
  whiteboard: { x: 720, y: 500, w: 80, h: 40 },
  table_center: { x: 800, y: 560 },
  chairs: [
    { x: 740, y: 580, seat: 1 },
    { x: 780, y: 590, seat: 2 },
    { x: 820, y: 590, seat: 3 },
    { x: 860, y: 580, seat: 4 },
    { x: 800, y: 540, seat: 5 }, // head of table
    { x: 800, y: 600, seat: 6 }, // foot of table
  ],
} as const;

// Updated agent configurations with exact design spec values
export const AGENTS: AgentCfg[] = [
  { 
    id: 'mcp', name: 'MCP', emoji: '🔴', 
    color: '#dc2626', colorDark: '#991b1b', 
    role: 'Orchestrator', zone: 'boss', 
    deskPos: DESK_POSITIONS.mcp, 
    hairColor: '#374151', accessory: '👑' 
  },
  { 
    id: 'ceo', name: 'CEO', emoji: '👔', 
    color: '#d97706', colorDark: '#92400e', 
    role: 'CEO', zone: 'boss', 
    deskPos: DESK_POSITIONS.ceo, 
    hairColor: '#6b7280', accessory: '👔' 
  },
  { 
    id: 'grid', name: 'GRID', emoji: '⚡', 
    color: '#7c3aed', colorDark: '#5b21b6', 
    role: 'Frontend', zone: 'engineering', 
    deskPos: DESK_POSITIONS.grid, 
    hairColor: '#22d3ee', accessory: '💻' 
  },
  { 
    id: 'sentinel', name: 'SENTINEL', emoji: '🛡️', 
    color: '#0ea5e9', colorDark: '#0369a1', 
    role: 'Security', zone: 'engineering', 
    deskPos: DESK_POSITIONS.sentinel, 
    hairColor: '#475569', accessory: '🛡️' 
  },
  { 
    id: 'bug', name: 'BUG', emoji: '🪲', 
    color: '#22c55e', colorDark: '#16a34a', 
    role: 'QA Engineer', zone: 'engineering', 
    deskPos: DESK_POSITIONS.bug, 
    hairColor: '#84cc16', accessory: '🔍' 
  },
  { 
    id: 'arch', name: 'ARCH', emoji: '🏛️', 
    color: '#7c3aed', colorDark: '#5b21b6', 
    role: 'Architect', zone: 'engineering', 
    deskPos: DESK_POSITIONS.arch, 
    hairColor: '#64748b', accessory: '📐' 
  },
  { 
    id: 'dev', name: 'DEV', emoji: '🔧', 
    color: '#0ea5e9', colorDark: '#0369a1', 
    role: 'Engineer', zone: 'engineering', 
    deskPos: DESK_POSITIONS.dev, 
    hairColor: '#475569', accessory: '⚙️' 
  },
  { 
    id: 'pixel', name: 'PIXEL', emoji: '🎨', 
    color: '#f43f5e', colorDark: '#e11d48', 
    role: 'Designer', zone: 'creative', 
    deskPos: DESK_POSITIONS.pixel, 
    hairColor: '#ec4899', accessory: '🎨' 
  },
  { 
    id: 'scribe', name: 'SCRIBE', emoji: '✍️', 
    color: '#ec4899', colorDark: '#be185d', 
    role: 'Writer', zone: 'creative', 
    deskPos: DESK_POSITIONS.scribe, 
    hairColor: '#a855f7', accessory: '✏️' 
  },
  { 
    id: 'spec', name: 'SPEC', emoji: '📋', 
    color: '#f97316', colorDark: '#ea580c', 
    role: 'Product', zone: 'strategy', 
    deskPos: DESK_POSITIONS.spec, 
    hairColor: '#92400e', accessory: '📋' 
  },
  { 
    id: 'sage', name: 'SAGE', emoji: '🧠', 
    color: '#facc15', colorDark: '#eab308', 
    role: 'Strategist', zone: 'strategy', 
    deskPos: DESK_POSITIONS.sage, 
    hairColor: '#a3a3a3', accessory: '🍵' 
  },
  { 
    id: 'atlas', name: 'ATLAS', emoji: '📊', 
    color: '#06b6d4', colorDark: '#0891b2', 
    role: 'Research', zone: 'labs', 
    deskPos: DESK_POSITIONS.atlas, 
    hairColor: '#0f766e', accessory: '📊' 
  },
  { 
    id: 'riff', name: 'RIFF', emoji: '🎸', 
    color: '#ef4444', colorDark: '#dc2626', 
    role: 'Audio', zone: 'labs', 
    deskPos: DESK_POSITIONS.riff, 
    hairColor: '#1f2937', accessory: '🎧' 
  },
  { 
    id: 'vault', name: 'VAULT', emoji: '📚', 
    color: '#10b981', colorDark: '#059669', 
    role: 'Knowledge', zone: 'labs', 
    deskPos: DESK_POSITIONS.vault, 
    hairColor: '#6b7280', accessory: '📚' 
  },
];

// Idle activities for rotation
export const IDLE_ACTIVITIES = [
  'coffee',     // Drinking coffee (near machine)
  'chat',       // Talking with other idle agents
  'read',       // Reading a book/tablet
  'stretch',    // Stretching/exercising
  'phone',      // Checking phone
  'think',      // Just standing/thinking
] as const;

// Zone boundaries for floor rendering
export const ZONE_BOUNDARIES = {
  boss: { x: 0, y: 0, w: 480, h: 120 },
  common: { x: 480, y: 0, w: 480, h: 120 },
  engineering: { x: 0, y: 120, w: 960, h: 180 },
  creative: { x: 0, y: 300, w: 480, h: 180 },
  strategy: { x: 480, y: 300, w: 240, h: 180 },
  labs: { x: 0, y: 480, w: 640, h: 120 },
  meeting: { x: 640, y: 480, w: 320, h: 120 },
} as const;