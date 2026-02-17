'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  type AgentState,
  type AgentStateInfo,
  createInitialState,
  transition,
  inferStateFromActivity,
} from '@/lib/agent-state-machine';

interface UseAgentStateOptions {
  agentId: string;
  pollInterval?: number;
  enabled?: boolean;
}

export function useAgentState({ agentId, pollInterval = 5000, enabled = true }: UseAgentStateOptions) {
  const [stateInfo, setStateInfo] = useState<AgentStateInfo>(createInitialState());
  const [history, setHistory] = useState<AgentStateInfo[]>([]);

  const updateState = useCallback((newState: AgentState, detail?: string) => {
    setStateInfo(prev => {
      if (prev.state === newState) return prev;
      const next = transition(prev, newState, detail);
      setHistory(h => [next, ...h].slice(0, 50));
      return next;
    });
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/agents/${agentId}/session`);
        if (!res.ok) {
          updateState('offline');
          return;
        }
        const data = await res.json();
        const messages = data.messages ?? [];
        const lastMsg = messages[messages.length - 1];
        const lastActivityAge = lastMsg?.timestamp
          ? Date.now() - new Date(lastMsg.timestamp).getTime()
          : Infinity;

        const inferred = inferStateFromActivity({
          hasRecentMessage: lastActivityAge < 10000,
          hasToolCall: lastMsg?.content?.includes('tool') || false,
          hasError: lastMsg?.content?.includes('error') || lastMsg?.content?.includes('Error') || false,
          isSessionActive: messages.length > 0,
          lastActivityAge,
        });

        updateState(inferred);
      } catch {
        updateState('offline');
      }
    };

    poll();
    const iv = setInterval(poll, pollInterval);
    return () => clearInterval(iv);
  }, [agentId, pollInterval, enabled, updateState]);

  return { stateInfo, history, updateState };
}
