/**
 * Optimized file reading utilities for better performance with large JSONL files
 */

import { readFile } from 'fs/promises';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

/**
 * Read only the first N and last N lines from a file for better performance
 */
export async function readFirstAndLastLines(filePath: string, firstN: number = 10, lastN: number = 50): Promise<string[]> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    
    if (lines.length <= firstN + lastN) {
      return lines;
    }
    
    return [...lines.slice(0, firstN), ...lines.slice(-lastN)];
  } catch {
    return [];
  }
}

/**
 * Stream-based reading for very large files (not used yet but available for future optimization)
 */
export async function streamJsonlFile(filePath: string, processLine: (line: string) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const fileStream = createReadStream(filePath);
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      if (line.trim()) {
        processLine(line);
      }
    });

    rl.on('close', resolve);
    rl.on('error', reject);
  });
}

/**
 * Extract basic session metadata without parsing entire file
 */
export async function extractSessionMetadata(filePath: string): Promise<{
  sessionKey: string;
  firstTimestamp: string;
  lastTimestamp: string;
  hasErrors: boolean;
}> {
  const lines = await readFirstAndLastLines(filePath, 5, 5);
  let sessionKey = '';
  let firstTimestamp = '';
  let lastTimestamp = '';
  let hasErrors = false;

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      if (!sessionKey && parsed.type === 'session' && parsed.id) {
        sessionKey = parsed.id;
      }
      const ts = parsed.timestamp || parsed.ts;
      if (ts) {
        if (!firstTimestamp) firstTimestamp = ts;
        lastTimestamp = ts;
      }
      if (parsed.error) hasErrors = true;
    } catch {
      // Skip malformed lines
    }
  }

  return { sessionKey, firstTimestamp, lastTimestamp, hasErrors };
}