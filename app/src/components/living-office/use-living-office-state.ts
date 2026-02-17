'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ActivityItem } from './types';
import { FLOOR_W } from './types';

export interface SpawnAnimation {
  id: string;
  parentId: string;
  childId: string;
  reverse: boolean;
  startTime: number;
}

export function useLivingOfficeState() {
  const [activity, setActivity] = useState<Record<string, ActivityItem>>({});
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [spawnAnimations, setSpawnAnimations] = useState<SpawnAnimation[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iv = setInterval(() => setCurrentHour(new Date().getHours()), 60_000);
    return () => clearInterval(iv);
  }, []);

  const getAmbientOverlay = () => {
    const h = currentHour;
    if (h >= 6 && h < 9) return { color: 'rgba(251, 146, 60, 0.1)', label: '🌅' };
    if (h >= 9 && h < 17) return { color: 'transparent', label: '☀️' };
    if (h >= 17 && h < 20) return { color: 'rgba(245, 158, 11, 0.15)', label: '🌇' };
    return { color: 'rgba(30, 58, 138, 0.2)', label: '🌙' };
  };

  const isNight = currentHour >= 20 || currentHour < 6;
  const ambient = getAmbientOverlay();

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch('/api/activity');
      const data = await res.json();
      const map: Record<string, ActivityItem> = {};
      const statusPriority = { active: 3, recent: 2, idle: 1 };
      (data.activity ?? []).forEach((a: ActivityItem) => {
        const existing = map[a.agent];
        if (!existing || (statusPriority[a.status] ?? 0) > (statusPriority[existing.status] ?? 0)) {
          map[a.agent] = a;
        }
      });
      setActivity(map);
    } catch { /* noop */ }
  }, []);

  // ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newScale = Math.min(containerWidth / FLOOR_W, 1.2);
        setScale(newScale);
      }
    };
    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(containerRef.current);
    updateScale();
    return () => resizeObserver.disconnect();
  }, []);

  // SSE + polling
  useEffect(() => {
    fetchActivity();
    const iv = setInterval(fetchActivity, 30000);
    const eventSource = new EventSource('/api/stream');

    const handleSSEReconnect = () => {
      console.log('[SSE] Reconnecting...');
      fetchActivity();
    };

    eventSource.addEventListener('activity', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.agent && data.status) {
          setActivity(prev => ({
            ...prev,
            [data.agent]: {
              ...prev[data.agent],
              agent: data.agent,
              status: data.status,
              timestamp: data.timestamp,
              task: prev[data.agent]?.task ?? '',
              messageCount: prev[data.agent]?.messageCount ?? 0,
            }
          }));
        }
        if (data.type === 'spawn' && data.parentAgent && data.agent) {
          const animId = `spawn-${Date.now()}`;
          setSpawnAnimations(prev => [...prev, {
            id: animId, parentId: data.parentAgent, childId: data.agent, reverse: false, startTime: Date.now()
          }]);
          
          setTimeout(() => setSpawnAnimations(prev => prev.filter(a => a.id !== animId)), 10000);
        }
      } catch (err) {
        console.warn('[SSE] Failed to parse activity event:', err);
      }
    });

    eventSource.addEventListener('connected', handleSSEReconnect);
    eventSource.addEventListener('ping', () => { /* keep alive */ });
    eventSource.addEventListener('error', () => {
      console.warn('[SSE] Connection error, will retry');
    });

    return () => {
      clearInterval(iv);
      eventSource.close();
    };
  }, [fetchActivity]);

  const getStatus = (id: string): 'active' | 'recent' | 'idle' => activity[id]?.status ?? 'idle';

  const handleSelect = (id: string) => {
    setSelectedAgent(prev => prev === id ? null : id);
  };

  const handleFloorClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.floor) {
      setSelectedAgent(null);
    }
  };

  return {
    activity,
    selectedAgent,
    setSelectedAgent,
    scale,
    currentHour,
    spawnAnimations,
    containerRef,
    isNight,
    ambient,
    getStatus,
    handleSelect,
    handleFloorClick,
  };
}
