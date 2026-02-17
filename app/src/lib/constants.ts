import path from 'path';
import os from 'os';

export const OPENCLAW_DIR = path.join(os.homedir(), '.openclaw');
export const AGENTS_DIR = path.join(OPENCLAW_DIR, 'agents');
export const MAX_AGENT_ID_LENGTH = 64;
export const SAFE_AGENT_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

export const AGENT_EMOJIS: Record<string, string> = {
  arch: '🏛️',
  grid: '🔴',
  dev: '💻',
  bug: '🐛',
  vault: '🔐',
  atlas: '🗺️',
  scribe: '📝',
  pixel: '🎨',
  sentinel: '🛡️',
  riff: '🎵',
  sage: '🧙',
  main: '👤',
  po: '📋',
  unknown: '❓',
};
