'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { parseActivityEvent, deduplicateActivities, type ParsedActivity, type RawSSEEvent } from '@/lib/activity-parser';

interface UseRealtimeStreamOptions {
  url?: string;
  maxItems?: number;
  enabled?: boolean;
}

interface UseRealtimeStreamResult {
  activities: ParsedActivity[];
  connected: boolean;
  error: string | null;
  reconnectCount: number;
  clear: () => void;
}

export function useRealtimeStream(options: UseRealtimeStreamOptions = {}): UseRealtimeStreamResult {
  const { url = '/api/stream', maxItems = 100, enabled = true } = options;
  const [activities, setActivities] = useState<ParsedActivity[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);
  const sourceRef = useRef<EventSource | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => setActivities([]), []);

  useEffect(() => {
    if (!enabled) {
      sourceRef.current?.close();
      setConnected(false);
      return;
    }

    let retryDelay = 1000;

    const connect = () => {
      try {
        const es = new EventSource(url);
        sourceRef.current = es;

        es.addEventListener('connected', () => {
          setConnected(true);
          setError(null);
          retryDelay = 1000; // reset on successful connection
        });

        es.addEventListener('activity', (e) => {
          try {
            const raw: RawSSEEvent = JSON.parse(e.data);
            const parsed = parseActivityEvent(raw);
            setActivities(prev => deduplicateActivities([parsed, ...prev], maxItems));
          } catch { /* skip malformed */ }
        });

        es.addEventListener('agent-change', (e) => {
          try {
            const data = JSON.parse(e.data);
            setActivities(prev => deduplicateActivities([{
              id: `agent-change-${Date.now()}`,
              agent: data.agent,
              type: 'session-start',
              summary: `Agent ${data.agent} ${data.eventType}`,
              timestamp: data.timestamp,
            }, ...prev], maxItems));
          } catch { /* skip */ }
        });

        es.addEventListener('ping', () => {
          // heartbeat received, connection is alive
        });

        es.onerror = () => {
          setConnected(false);
          es.close();
          // Exponential backoff with max 30s
          retryDelay = Math.min(retryDelay * 2, 30000);
          setReconnectCount(c => c + 1);
          setError(`Disconnected. Retrying in ${retryDelay / 1000}s...`);
          reconnectTimer.current = setTimeout(connect, retryDelay);
        };
      } catch (err) {
        setError(`Failed to connect: ${err}`);
      }
    };

    connect();

    return () => {
      sourceRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [url, maxItems, enabled]);

  return { activities, connected, error, reconnectCount, clear };
}
