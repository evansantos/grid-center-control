const rateMap = new Map<string, { tokens: number; lastRefill: number }>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 100;
const CLEANUP_INTERVAL_MS = 5 * 60_000;

// Auto-cleanup stale entries every 5 minutes
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of rateMap) {
    if (now - entry.lastRefill > WINDOW_MS * 2) {
      rateMap.delete(key);
    }
  }
}

export function rateLimit(ip: string): {
  success: boolean;
  remaining: number;
  reset: number;
} {
  cleanup();

  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry) {
    rateMap.set(ip, { tokens: MAX_REQUESTS - 1, lastRefill: now });
    return { success: true, remaining: MAX_REQUESTS - 1, reset: Math.ceil((now + WINDOW_MS) / 1000) };
  }

  const elapsed = now - entry.lastRefill;
  const refillRate = MAX_REQUESTS / WINDOW_MS;
  const refilled = Math.min(MAX_REQUESTS, entry.tokens + elapsed * refillRate);
  entry.lastRefill = now;

  if (refilled < 1) {
    entry.tokens = refilled;
    const resetTime = Math.ceil((now + (1 - refilled) / refillRate) / 1000);
    return { success: false, remaining: 0, reset: resetTime };
  }

  entry.tokens = refilled - 1;
  return {
    success: true,
    remaining: Math.floor(entry.tokens),
    reset: Math.ceil((now + WINDOW_MS) / 1000),
  };
}
