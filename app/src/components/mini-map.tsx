'use client';

interface AgentPos {
  id: string;
  color: string;
  deskPos: { x: number; y: number };
}

interface MiniMapProps {
  agents: AgentPos[];
  floorW: number;
  floorH: number;
  getStatus: (id: string) => 'active' | 'recent' | 'idle';
  onAgentClick?: (id: string) => void;
}

const MAP_W = 150;
const MAP_H = 100;

export function MiniMap({ agents, floorW, floorH, getStatus, onAgentClick }: MiniMapProps) {
  return (
    <div
      style={{
        position: 'absolute',
        right: 8,
        bottom: 28,
        width: MAP_W,
        height: MAP_H,
        backgroundColor: 'rgba(10, 10, 15, 0.75)',
        border: '1px solid #27272a',
        borderRadius: 6,
        zIndex: 30,
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Label */}
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: 6,
          fontSize: 7,
          fontFamily: 'monospace',
          color: '#475569',
          letterSpacing: 1,
          textTransform: 'uppercase',
          pointerEvents: 'none',
        }}
      >
        MAP
      </div>

      {agents.map((agent) => {
        const status = getStatus(agent.id);
        const px = (agent.deskPos.x / floorW) * MAP_W;
        const py = (agent.deskPos.y / floorH) * MAP_H;
        const isActive = status === 'active';
        const dotSize = isActive ? 6 : 4;

        return (
          <button
            key={agent.id}
            onClick={() => onAgentClick?.(agent.id)}
            title={agent.id.toUpperCase()}
            style={{
              position: 'absolute',
              left: px - dotSize / 2,
              top: py - dotSize / 2,
              width: dotSize,
              height: dotSize,
              borderRadius: '50%',
              backgroundColor: agent.color,
              opacity: status === 'idle' ? 0.35 : 0.9,
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: isActive ? `0 0 6px ${agent.color}` : undefined,
              animation: isActive ? 'pulse 1.5s ease-in-out infinite' : undefined,
            }}
          />
        );
      })}

      <style>{`
        @keyframes minimapPulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
