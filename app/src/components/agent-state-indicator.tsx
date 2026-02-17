'use client';

import { useAgentState } from '@/hooks/use-agent-state';
import { STATE_META, getStateDuration } from '@/lib/agent-state-machine';

interface AgentStateIndicatorProps {
  agentId: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showDuration?: boolean;
}

export function AgentStateIndicator({
  agentId,
  size = 'md',
  showLabel = true,
  showDuration = true,
}: AgentStateIndicatorProps) {
  const { stateInfo } = useAgentState({ agentId });
  const meta = STATE_META[stateInfo.state];

  const dotSize = size === 'sm' ? 8 : size === 'md' ? 12 : 16;
  const fontSize = size === 'sm' ? 10 : size === 'md' ? 12 : 14;

  return (
    <div className="flex items-center gap-1.5" title={`${meta.label} — since ${stateInfo.since}`}>
      {/* Status dot */}
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: meta.color,
          display: 'inline-block',
          boxShadow: stateInfo.state === 'executing' ? `0 0 8px ${meta.color}` : undefined,
          animation: meta.animation,
        }}
      />
      {showLabel && (
        <span
          className="font-mono font-bold"
          style={{ fontSize, color: meta.color }}
        >
          {meta.icon} {meta.label}
        </span>
      )}
      {showDuration && (
        <span
          className="font-mono text-zinc-600"
          style={{ fontSize: fontSize - 2 }}
        >
          {getStateDuration(stateInfo.since)}
        </span>
      )}
    </div>
  );
}
