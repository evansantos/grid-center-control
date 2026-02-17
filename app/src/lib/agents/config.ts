import { readFile } from 'fs/promises';
import { join } from 'path';
import { OPENCLAW_DIR } from '@/lib/constants';
const CONFIG_PATH = join(OPENCLAW_DIR, 'openclaw.json');

export interface AgentConfig {
  id: string;
  name: string;
  emoji: string;
  model?: string;
}

// Simple cache with TTL
let configCache: { data: AgentConfig[]; timestamp: number; defaultModel: string } | null = null;
const CACHE_TTL = 5_000;

export async function loadAgentConfigs(): Promise<AgentConfig[]> {
  const now = Date.now();
  if (configCache && (now - configCache.timestamp) < CACHE_TTL) {
    return configCache.data;
  }

  interface RawConfig {
    agents?: {
      list?: Array<{ id: string; name?: string; model?: string; identity?: { name?: string; emoji?: string } }>;
      defaults?: { model?: { primary?: string } };
    };
  }

  let config: RawConfig;
  try {
    config = JSON.parse(await readFile(CONFIG_PATH, 'utf-8')) as RawConfig;
  } catch {
    config = { agents: { list: [] } };
  }

  const agentList = config.agents?.list ?? [];
  const defaultModel = config.agents?.defaults?.model?.primary ?? '';

  const agents: AgentConfig[] = agentList.map((agent) => ({
    id: agent.id,
    name: agent.identity?.name ?? agent.name ?? agent.id,
    emoji: agent.identity?.emoji ?? '🔵',
    model: agent.model ?? defaultModel,
  }));

  configCache = { data: agents, timestamp: now, defaultModel };
  return agents;
}

export function getOpenClawDir(): string {
  return OPENCLAW_DIR;
}
