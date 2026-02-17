/** Shared type definitions to replace `any` across the codebase */

/** A block of content inside a message (text, image, etc.) */
export interface ContentBlock {
  type: string;
  text?: string;
  [key: string]: unknown;
}

/** Generic cache entry used by route-level in-memory caches */
export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
}

/** Lightweight cache entry variant (used by logs/search LRU) */
export interface LruEntry<T = unknown> {
  data: T;
  ts: number;
}

/** Raw OpenClaw agent config entry from openclaw.json */
export interface RawAgentEntry {
  id: string;
  name?: string;
  model?: string;
  identity?: { name?: string; emoji?: string };
}

/** Parsed openclaw.json shape (partial) */
export interface OpenClawConfig {
  agents?: {
    list?: RawAgentEntry[];
    defaults?: { model?: { primary?: string } };
  };
}

/** A sprint task shown on the living-office board */
export interface SprintTask {
  id: string;
  task_number: number;
  title: string;
  description: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
}

/** Zod issue shape (subset used in validators.ts) */
export interface ZodIssueLike {
  path: (string | number)[];
  message: string;
}

/** Dirent-like entry from readdir */
export interface DirEntry {
  name: string;
  isDirectory(): boolean;
}

/** SSE send helper data */
export type SsePayload = Record<string, unknown>;

/** Timeline page session item */
export interface SubagentSessionItem {
  sessionKey: string;
  agentId: string;
  startedAt: string;
  children?: SubagentSessionItem[];
}
