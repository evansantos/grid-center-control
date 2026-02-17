/** Agent State Machine — finite states with transition rules */

export type AgentState = 'idle' | 'thinking' | 'executing' | 'waiting' | 'error' | 'paused' | 'offline';

export interface AgentStateInfo {
  state: AgentState;
  since: string;
  detail?: string;
  previousState?: AgentState;
  transitionCount: number;
}

export interface StateTransition {
  from: AgentState;
  to: AgentState;
  trigger: string;
  timestamp: string;
}

/** Valid transitions map */
const VALID_TRANSITIONS: Record<AgentState, AgentState[]> = {
  idle: ['thinking', 'executing', 'paused', 'offline'],
  thinking: ['executing', 'idle', 'error', 'paused'],
  executing: ['thinking', 'idle', 'waiting', 'error', 'paused'],
  waiting: ['thinking', 'executing', 'idle', 'error'],
  error: ['idle', 'thinking', 'offline'],
  paused: ['idle', 'thinking', 'offline'],
  offline: ['idle'],
};

export function canTransition(from: AgentState, to: AgentState): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function createInitialState(): AgentStateInfo {
  return {
    state: 'offline',
    since: new Date().toISOString(),
    transitionCount: 0,
  };
}

export function transition(current: AgentStateInfo, to: AgentState, detail?: string): AgentStateInfo {
  if (!canTransition(current.state, to)) {
    // Force transition anyway but log it
    console.warn(`[StateMachine] Invalid transition: ${current.state} → ${to}`);
  }
  return {
    state: to,
    since: new Date().toISOString(),
    detail,
    previousState: current.state,
    transitionCount: current.transitionCount + 1,
  };
}

/** Infer state from activity signals */
export function inferStateFromActivity(signals: {
  hasRecentMessage?: boolean;
  hasToolCall?: boolean;
  hasError?: boolean;
  isSessionActive?: boolean;
  lastActivityAge?: number; // ms
}): AgentState {
  if (!signals.isSessionActive) return 'offline';
  if (signals.hasError) return 'error';
  if (signals.hasToolCall) return 'executing';
  if (signals.hasRecentMessage) return 'thinking';
  if (signals.lastActivityAge && signals.lastActivityAge < 30000) return 'idle';
  if (signals.lastActivityAge && signals.lastActivityAge < 300000) return 'idle';
  return 'offline';
}

/** State display metadata */
export const STATE_META: Record<AgentState, { label: string; color: string; icon: string; animation?: string }> = {
  idle: { label: 'Idle', color: '#64748b', icon: '😴' },
  thinking: { label: 'Thinking', color: '#eab308', icon: '🤔', animation: 'pulse 2s ease-in-out infinite' },
  executing: { label: 'Executing', color: '#22c55e', icon: '⚡', animation: 'pulse 1s ease-in-out infinite' },
  waiting: { label: 'Waiting', color: '#8b5cf6', icon: '⏳', animation: 'pulse 3s ease-in-out infinite' },
  error: { label: 'Error', color: '#ef4444', icon: '❌', animation: 'shake 0.5s ease-in-out' },
  paused: { label: 'Paused', color: '#f97316', icon: '⏸️' },
  offline: { label: 'Offline', color: '#374151', icon: '⭘' },
};

export function getStateDuration(since: string): string {
  const ms = Date.now() - new Date(since).getTime();
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h`;
}
