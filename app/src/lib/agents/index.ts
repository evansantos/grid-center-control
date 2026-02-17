export { loadAgentConfigs, getOpenClawDir, type AgentConfig } from './config';
export { getSessionsForAgent, getAgentLastActivity, type SessionInfo } from './sessions';

import { readFile } from 'fs/promises';
import { join } from 'path';
import { loadAgentConfigs, getOpenClawDir, type AgentConfig } from './config';
import { getSessionsForAgent, getAgentLastActivity, type SessionInfo } from './sessions';

export interface AgentStatus {
  id: string;
  name: string;
  emoji: string;
  active: boolean;
  lastActivity?: string;
}

export async function getAgentStatuses(): Promise<AgentStatus[]> {
  const configs = await loadAgentConfigs();

  return Promise.all(configs.map(async (agent) => {
    const lastMtime = await getAgentLastActivity(agent.id);
    return {
      id: agent.id,
      name: agent.name,
      emoji: agent.emoji,
      active: lastMtime > 0 && (Date.now() - lastMtime) < 30_000,
      lastActivity: lastMtime > 0 ? new Date(lastMtime).toISOString() : undefined,
    };
  }));
}

/**
 * Returns a status map keyed by display id (main→mcp), matching the existing API shape.
 */
export async function getAgentStatusMap(): Promise<Record<string, { active: boolean; lastActivity?: string }>> {
  const statuses = await getAgentStatuses();
  const result: Record<string, { active: boolean; lastActivity?: string }> = {};
  for (const s of statuses) {
    const key = s.id === 'main' ? 'mcp' : s.id;
    result[key] = { active: s.active, lastActivity: s.lastActivity };
  }
  return result;
}

export async function getAgentRole(agentId: string): Promise<string> {
  try {
    const identity = await readFile(
      join(getOpenClawDir(), 'agents', agentId, 'workspace', 'IDENTITY.md'),
      'utf-8'
    );
    const roleMatch = identity.match(/\*\*Role:\*\*\s*(.+)/);
    return roleMatch?.[1]?.trim() ?? '';
  } catch {
    return '';
  }
}

export interface AgentInfo {
  id: string;
  name: string;
  emoji: string;
  role: string;
  model: string;
  activeSessions: SessionInfo[];
}

export async function getFullAgentInfo(): Promise<AgentInfo[]> {
  const configs = await loadAgentConfigs();

  return Promise.all(configs.map(async (agent) => ({
    id: agent.id,
    name: agent.name,
    emoji: agent.emoji,
    role: (await getAgentRole(agent.id)) || (agent.id === 'main' ? 'Chief Strategy Officer' : ''),
    model: agent.model ?? '',
    activeSessions: await getSessionsForAgent(agent.id),
  })));
}
