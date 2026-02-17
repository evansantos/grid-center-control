export const AGENT_DISPLAY: Record<string, { name: string; emoji: string; color: string }> = {
  mcp: { name: 'MCP', emoji: '🔴', color: '#dc2626' },
  ceo: { name: 'CEO', emoji: '👔', color: '#d97706' },
  grid: { name: 'GRID', emoji: '⚡', color: '#8b5cf6' },
  sentinel: { name: 'SENTINEL', emoji: '🛡️', color: '#3b82f6' },
  bug: { name: 'BUG', emoji: '🪲', color: '#22c55e' },
  arch: { name: 'ARCH', emoji: '🏛️', color: '#7c3aed' },
  dev: { name: 'DEV', emoji: '🔧', color: '#0ea5e9' },
  pixel: { name: 'PIXEL', emoji: '🎨', color: '#f43f5e' },
  scribe: { name: 'SCRIBE', emoji: '✍️', color: '#ec4899' },
  spec: { name: 'SPEC', emoji: '📋', color: '#f97316' },
  sage: { name: 'SAGE', emoji: '🧠', color: '#eab308' },
  atlas: { name: 'ATLAS', emoji: '📊', color: '#06b6d4' },
  riff: { name: 'RIFF', emoji: '🎸', color: '#ef4444' },
  vault: { name: 'VAULT', emoji: '📚', color: '#10b981' },
};

export function getAgentDisplay(agentId: string): { name: string; emoji: string; color: string } {
  return AGENT_DISPLAY[agentId] || { name: agentId.toUpperCase(), emoji: '🔵', color: '#64748b' };
}
