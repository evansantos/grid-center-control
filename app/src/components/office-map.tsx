'use client';

import { useState, useEffect, useCallback } from 'react';

interface ActivityItem {
  agent: string;
  agentEmoji: string;
  agentName: string;
  sessionId: string;
  task: string;
  lastMessage: string;
  lastRole: string;
  timestamp: string;
  messageCount: number;
  status: 'active' | 'recent' | 'idle';
  durationMs?: number;
}

interface AgentDesk {
  id: string;
  name: string;
  emoji: string;
  role: string;
  x: number;
  y: number;
  zone: string;
}

// Office layout — agents at desks in functional zones
const DESKS: AgentDesk[] = [
  // Engineering pit (left side)
  { id: 'grid',     name: 'GRID',     emoji: '⚡', role: 'Engineer',       x: 80,  y: 100, zone: 'eng' },
  { id: 'bug',      name: 'BUG',      emoji: '🪲', role: 'QA',             x: 80,  y: 200, zone: 'eng' },
  { id: 'sentinel', name: 'SENTINEL', emoji: '🛡️', role: 'Security',       x: 80,  y: 300, zone: 'eng' },

  // Creative corner (top right)
  { id: 'scribe',   name: 'SCRIBE',   emoji: '✍️', role: 'Writer',         x: 520, y: 80,  zone: 'creative' },
  { id: 'pixel',    name: 'PIXEL',    emoji: '🎨', role: 'Design',         x: 640, y: 80,  zone: 'creative' },

  // Strategy room (center)
  { id: 'po',       name: 'SPEC',     emoji: '📋', role: 'Product Owner',  x: 300, y: 160, zone: 'strategy' },
  { id: 'sage',     name: 'SAGE',     emoji: '🧠', role: 'Advisor',        x: 420, y: 160, zone: 'strategy' },

  // Specialist labs (bottom)
  { id: 'riff',     name: 'RIFF',     emoji: '🎸', role: 'Music Tech',     x: 300, y: 320, zone: 'lab' },
  { id: 'vault',    name: 'VAULT',    emoji: '📚', role: 'Knowledge',      x: 420, y: 320, zone: 'lab' },
  { id: 'atlas',    name: 'ATLAS',    emoji: '📊', role: 'Analytics',      x: 560, y: 320, zone: 'lab' },
];

// Zone labels and boundaries
const ZONES = [
  { id: 'eng',      label: 'ENGINEERING',  x: 20,  y: 50,  w: 180, h: 310 },
  { id: 'creative', label: 'CREATIVE',     x: 470, y: 30,  w: 230, h: 130 },
  { id: 'strategy', label: 'STRATEGY',     x: 240, y: 110, w: 240, h: 110 },
  { id: 'lab',      label: 'LABS',         x: 240, y: 270, w: 390, h: 120 },
];

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  return hrs < 24 ? `${hrs}h` : `${Math.floor(hrs / 24)}d`;
}

interface OfficeMapProps {
  onSelectAgent: (agentId: string) => void;
  selectedAgent: string | null;
}

export function OfficeMap({ onSelectAgent, selectedAgent }: OfficeMapProps) {
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch('/api/activity');
      const data = await res.json();
      setActivity(data.activity ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 5000);
    return () => clearInterval(interval);
  }, [fetchActivity]);

  // Build agent status map
  const agentActivity: Record<string, ActivityItem> = {};
  for (const item of activity) {
    // Map agent names — subagents get mapped by task content
    const id = item.agent === 'subagent' ? null : item.agent;
    if (id && !agentActivity[id]) {
      agentActivity[id] = item;
    }
  }

  // Find interactions (agents working on related tasks simultaneously)
  const activeAgents = activity.filter(a => a.status === 'active' || a.status === 'recent');
  const interactions: { from: AgentDesk; to: AgentDesk; intensity: number }[] = [];

  // Connect active agents that are working "together" (same time window)
  for (let i = 0; i < activeAgents.length; i++) {
    for (let j = i + 1; j < activeAgents.length; j++) {
      const a = activeAgents[i];
      const b = activeAgents[j];
      const deskA = DESKS.find(d => d.id === a.agent);
      const deskB = DESKS.find(d => d.id === b.agent);
      if (deskA && deskB) {
        const bothActive = a.status === 'active' && b.status === 'active';
        interactions.push({ from: deskA, to: deskB, intensity: bothActive ? 1 : 0.4 });
      }
    }
  }

  // Also show subagent connections to MCP area
  const subagents = activity.filter(a => a.agent === 'subagent' && (a.status === 'active' || a.status === 'recent'));

  return (
    <div className="relative select-none">
      <svg viewBox="0 0 740 420" className="w-full h-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {/* Background */}
        <rect x="0" y="0" width="740" height="420" rx="12" fill="var(--grid-map-bg)" stroke="var(--grid-border-subtle)" strokeWidth="1" />

        {/* Floor grid pattern */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--grid-map-grid)" strokeWidth="0.5" />
          </pattern>
          {/* Glow filter for active agents */}
          <filter id="glow-green">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-yellow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-red">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect x="0" y="0" width="740" height="420" fill="url(#grid)" rx="12" />

        {/* Zone boundaries */}
        {ZONES.map(zone => (
          <g key={zone.id}>
            <rect
              x={zone.x} y={zone.y} width={zone.w} height={zone.h}
              rx="8" fill="none" stroke="var(--grid-border-subtle)" strokeWidth="1" strokeDasharray="4 4"
            />
            <text x={zone.x + 8} y={zone.y + 16} fontSize="9" fill="var(--grid-text-faint)" fontFamily="monospace" fontWeight="bold">
              {zone.label}
            </text>
          </g>
        ))}

        {/* Interaction lines */}
        {interactions.map((link, i) => (
          <line
            key={`link-${i}`}
            x1={link.from.x} y1={link.from.y}
            x2={link.to.x} y2={link.to.y}
            stroke={link.intensity > 0.5 ? 'var(--grid-success)' : 'var(--grid-yellow)'}
            strokeWidth={link.intensity > 0.5 ? 1.5 : 0.8}
            strokeOpacity={link.intensity > 0.5 ? 0.5 : 0.2}
            strokeDasharray={link.intensity > 0.5 ? 'none' : '4 4'}
          >
            {link.intensity > 0.5 && (
              <animate attributeName="stroke-opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
            )}
          </line>
        ))}

        {/* Subagent pulse connections (from center to active agents) */}
        {subagents.length > 0 && (
          <circle cx="370" cy="30" r="4" fill="var(--grid-danger)" opacity="0.6">
            <animate attributeName="r" values="3;6;3" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0.3;0.6" dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}
        {subagents.length > 0 && (
          <text x="370" y="18" fontSize="8" fill="var(--grid-danger)" textAnchor="middle" fontFamily="monospace" opacity="0.7">
            MCP ● {subagents.length} spawned
          </text>
        )}

        {/* Agent desks */}
        {DESKS.map(desk => {
          const act = agentActivity[desk.id];
          const status = act?.status ?? 'idle';
          const isSelected = selectedAgent === desk.id;
          const isActive = status === 'active';
          const isRecent = status === 'recent';

          const ringColor = isActive ? 'var(--grid-success)' : isRecent ? 'var(--grid-yellow)' : 'var(--grid-border-subtle)';
          const glowFilter = isActive ? 'url(#glow-green)' : isRecent ? 'url(#glow-yellow)' : undefined;

          return (
            <g
              key={desk.id}
              className="cursor-pointer"
              onClick={() => onSelectAgent(desk.id)}
              role="button"
              tabIndex={0}
            >
              {/* Desk surface */}
              <rect
                x={desk.x - 35} y={desk.y - 25} width="70" height="50"
                rx="6"
                fill={isSelected ? 'var(--grid-map-desk-selected)' : 'var(--grid-map-desk)'}
                stroke={isSelected ? 'var(--grid-danger)' : ringColor}
                strokeWidth={isSelected ? 2 : 1}
                filter={glowFilter}
              />

              {/* Agent avatar */}
              <text x={desk.x} y={desk.y - 2} fontSize="20" textAnchor="middle" dominantBaseline="central">
                {desk.emoji}
              </text>

              {/* Name */}
              <text x={desk.x} y={desk.y + 18} fontSize="8" fill="var(--grid-text-label)" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                {desk.name}
              </text>

              {/* Status indicator */}
              {isActive && (
                <g>
                  <circle cx={desk.x + 28} cy={desk.y - 18} r="4" fill="var(--grid-success)">
                    <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />
                  </circle>
                  {/* Typing dots */}
                  <circle cx={desk.x + 20} cy={desk.y - 30} r="1.5" fill="var(--grid-success)" opacity="0.7">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={desk.x + 25} cy={desk.y - 30} r="1.5" fill="var(--grid-success)" opacity="0.7">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" begin="0.2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={desk.x + 30} cy={desk.y - 30} r="1.5" fill="var(--grid-success)" opacity="0.7">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" begin="0.4s" repeatCount="indefinite" />
                  </circle>
                </g>
              )}
              {isRecent && (
                <circle cx={desk.x + 28} cy={desk.y - 18} r="3" fill="var(--grid-yellow)" />
              )}

              {/* Time ago badge */}
              {act && (
                <text x={desk.x} y={desk.y - 30} fontSize="7" fill="var(--grid-text-secondary)" textAnchor="middle" fontFamily="monospace">
                  {timeAgo(act.timestamp)} · {act.messageCount}msg
                </text>
              )}
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(600, 390)">
          <circle cx="0" cy="0" r="3" fill="var(--grid-success)" />
          <text x="8" y="3" fontSize="8" fill="var(--grid-text-secondary)" fontFamily="monospace">Active</text>
          <circle cx="50" cy="0" r="3" fill="var(--grid-yellow)" />
          <text x="58" y="3" fontSize="8" fill="var(--grid-text-secondary)" fontFamily="monospace">Recent</text>
          <circle cx="108" cy="0" r="3" fill="var(--grid-border-subtle)" />
          <text x="116" y="3" fontSize="8" fill="var(--grid-text-secondary)" fontFamily="monospace">Idle</text>
        </g>
      </svg>
    </div>
  );
}
