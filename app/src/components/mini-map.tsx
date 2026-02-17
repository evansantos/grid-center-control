'use client';

import { useCallback, useState } from 'react';

/* ── Agent config (mirrors living-office.tsx) ── */
const AGENTS = [
  { id: 'mcp',      name: 'MCP',      color: '#dc2626', role: 'Orchestrator', x: 70,  y: 75  },
  { id: 'ceo',      name: 'CEO',      color: '#d97706', role: 'CEO',          x: 140, y: 75  },
  { id: 'grid',     name: 'GRID',     color: '#8b5cf6', role: 'Frontend',     x: 30,  y: 230 },
  { id: 'sentinel', name: 'SENTINEL', color: '#3b82f6', role: 'Security',     x: 130, y: 230 },
  { id: 'bug',      name: 'BUG',      color: '#22c55e', role: 'QA Engineer',  x: 230, y: 230 },
  { id: 'arch',     name: 'ARCH',     color: '#7c3aed', role: 'Architect',    x: 330, y: 230 },
  { id: 'dev',      name: 'DEV',      color: '#0ea5e9', role: 'Engineer',     x: 430, y: 230 },
  { id: 'pixel',    name: 'PIXEL',    color: '#f43f5e', role: 'Designer',     x: 510, y: 230 },
  { id: 'scribe',   name: 'SCRIBE',   color: '#ec4899', role: 'Writer',       x: 640, y: 230 },
  { id: 'spec',     name: 'SPEC',     color: '#f97316', role: 'Product',      x: 50,  y: 365 },
  { id: 'sage',     name: 'SAGE',     color: '#eab308', role: 'Strategist',   x: 180, y: 365 },
  { id: 'atlas',    name: 'ATLAS',    color: '#06b6d4', role: 'Research',     x: 410, y: 365 },
  { id: 'riff',     name: 'RIFF',     color: '#ef4444', role: 'Audio',        x: 540, y: 365 },
  { id: 'vault',    name: 'VAULT',    color: '#10b981', role: 'Knowledge',    x: 670, y: 365 },
] as const;

/* Scale source coords (max ~700x400) into mini-map (200x150) with padding */
const SRC_W = 720;
const SRC_H = 420;
const MAP_W = 200;
const MAP_H = 150;
const PAD = 10;

function scale(x: number, y: number) {
  return {
    cx: PAD + ((x / SRC_W) * (MAP_W - PAD * 2)),
    cy: PAD + ((y / SRC_H) * (MAP_H - PAD * 2)),
  };
}

export interface MiniMapProps {
  /** Optional map of agentId → status string shown in tooltip */
  statuses?: Record<string, string>;
  /** Called when user clicks an agent dot */
  onAgentClick?: (agentId: string) => void;
}

export default function MiniMap({ statuses = {}, onAgentClick }: MiniMapProps) {
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);

  const handleDotClick = useCallback(
    (agentId: string) => {
      if (onAgentClick) {
        onAgentClick(agentId);
      } else {
        // Dispatch custom event so living-office can listen
        window.dispatchEvent(
          new CustomEvent('minimap:scroll-to-agent', { detail: { agentId } }),
        );
      }
    },
    [onAgentClick],
  );

  return (
    <div className="fixed bottom-4 right-4 z-50 hidden md:flex flex-col items-end gap-1">
      {/* Toggle button */}
      <button
        onClick={() => setVisible((v) => !v)}
        className="flex items-center justify-center w-7 h-7 rounded-md
          bg-zinc-800/70 dark:bg-zinc-900/80 border border-zinc-700/50
          text-zinc-300 hover:text-white transition-colors text-sm"
        aria-label={visible ? 'Hide mini-map' : 'Show mini-map'}
        title={visible ? 'Hide mini-map' : 'Show mini-map'}
      >
        {visible ? (
          /* Eye icon */
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z" />
          </svg>
        ) : (
          /* Eye-off icon */
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473C17.609 13.927 19.075 12.073 19 10c-.73-2.89-4-7-9-7-1.72 0-3.28.5-4.61 1.32L3.707 2.293zM10 5a5 5 0 014.775 6.44l-1.52-1.52a3 3 0 00-3.175-3.175L8.56 5.225A5 5 0 0110 5zM1 10c.73-2.89 4-7 9-7 .87 0 1.71.13 2.5.35L4.17 5.17C2.6 6.49 1.48 8.14 1 10zm4 0a5 5 0 006.83 4.66l-1.58-1.58a3 3 0 01-3.33-3.33L5.34 8.17A5 5 0 005 10z" />
          </svg>
        )}
      </button>

      {/* Mini-map panel */}
      {visible && (
        <div
          className="relative rounded-lg border border-zinc-700/50
            bg-zinc-900/75 dark:bg-zinc-950/80 backdrop-blur-sm shadow-lg"
          style={{ width: MAP_W, height: MAP_H }}
        >
          <svg width={MAP_W} height={MAP_H} className="absolute inset-0">
            {AGENTS.map((a) => {
              const { cx, cy } = scale(a.x, a.y);
              const isHovered = hovered === a.id;
              return (
                <circle
                  key={a.id}
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  fill={a.color}
                  stroke={isHovered ? '#fff' : 'transparent'}
                  strokeWidth={1.5}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHovered(a.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => handleDotClick(a.id)}
                />
              );
            })}
          </svg>

          {/* Tooltip */}
          {hovered && (() => {
            const agent = AGENTS.find((a) => a.id === hovered);
            if (!agent) return null;
            const { cx, cy } = scale(agent.x, agent.y);
            const status = statuses[agent.id] ?? agent.role;
            // Position tooltip above dot, clamp to panel
            const tx = Math.min(Math.max(cx, 40), MAP_W - 40);
            return (
              <div
                className="absolute pointer-events-none px-2 py-1 rounded text-[10px] leading-tight
                  bg-zinc-800 text-zinc-100 border border-zinc-600/50 whitespace-nowrap shadow"
                style={{ left: tx, top: cy - 22, transform: 'translateX(-50%)' }}
              >
                <span className="font-semibold">{agent.name}</span>
                <span className="text-zinc-400"> · {status}</span>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
