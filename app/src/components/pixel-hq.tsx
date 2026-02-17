'use client';

import { useState, useEffect, useCallback } from 'react';

/* ── Types ── */
interface ActivityItem {
  agent: string;
  status: 'active' | 'recent' | 'idle';
  timestamp: string;
  messageCount: number;
}

interface Message {
  role: string;
  content: string;
  timestamp?: string;
}

/* ── Agent config ── */
interface AgentCfg {
  id: string;
  name: string;
  color: string;
}

const AGENTS: AgentCfg[] = [
  { id: 'mcp',      name: 'MCP',      color: '#dc2626' },
  { id: 'atlas',    name: 'ATLAS',    color: '#06b6d4' },
  { id: 'scribe',   name: 'SCRIBE',   color: '#ec4899' },
  { id: 'grid',     name: 'GRID',     color: '#8b5cf6' },
  { id: 'sentinel', name: 'SENTINEL', color: '#3b82f6' },
  { id: 'pixel',    name: 'PIXEL',    color: '#f43f5e' },
  { id: 'spec',     name: 'SPEC',     color: '#f97316' },
  { id: 'sage',     name: 'SAGE',     color: '#eab308' },
  { id: 'riff',     name: 'RIFF',     color: '#dc2626' },
  { id: 'bug',      name: 'BUG',      color: '#22c55e' },
  { id: 'vault',    name: 'VAULT',    color: '#10b981' },
];

const AGENT_MAP = Object.fromEntries(AGENTS.map(a => [a.id, a]));

/* Row layout for cubicles (excludes MCP which is in special rooms) */
const ROW2 = ['atlas', 'scribe', 'grid', 'sentinel'];
const ROW3 = ['pixel', 'spec', 'sage', 'riff'];
const ROW4 = ['bug', 'vault'];

/* ── Pixel Character (pure CSS box-shadow) ── */
function PixelCharacter({ color, active, hasGuitar }: { color: string; active: boolean; hasGuitar?: boolean }) {
  const s = 4; // pixel size
  // Build box-shadow pixels: head, body, arms, legs
  // Coordinate system: col, row (0-indexed from top-left)
  // Character is ~7 wide, ~9 tall
  const skin = '#fbbf24';
  const dark = '#1a1a2e';
  const pixels: [number, number, string][] = [
    // Head (2 wide, 2 tall at col 2-3, row 0-1)
    [2, 0, skin], [3, 0, skin],
    [2, 1, skin], [3, 1, skin],
    // Body (3 wide, 3 tall at col 1.5-3.5 → col 2-3, row 2-4)
    [1, 2, color], [2, 2, color], [3, 2, color], [4, 2, color],
    [1, 3, color], [2, 3, color], [3, 3, color], [4, 3, color],
    [2, 4, color], [3, 4, color],
    // Arms (col 0 and col 5, row 2-3)
    [0, 2, color], [0, 3, skin],
    [5, 2, color], [5, 3, skin],
    // Legs (col 2 and col 3, row 5)
    [2, 5, dark], [3, 5, dark],
  ];

  // Guitar accessory for RIFF
  if (hasGuitar) {
    pixels.push([6, 2, '#92400e'], [6, 3, '#92400e'], [6, 4, '#b45309'], [5, 4, '#b45309']);
  }

  const shadow = pixels
    .map(([x, y, c]) => `${x * s}px ${y * s}px 0 0 ${c}`)
    .join(', ');

  return (
    <div className="flex flex-col items-center">
      <div
        style={{
          width: s,
          height: s,
          boxShadow: shadow,
          marginRight: 6 * s,
          marginBottom: 6 * s,
          animation: active ? 'pixelBounce 0.6s ease-in-out infinite alternate' : undefined,
        }}
      />
    </div>
  );
}

/* ── Desk ── */
function Desk({ monitors = 2 }: { monitors?: number }) {
  return (
    <div className="flex flex-col items-center mt-1">
      {/* Monitors */}
      <div className="flex gap-1 mb-0.5">
        {Array.from({ length: monitors }).map((_, i) => (
          <div key={i} className="w-3 h-2.5 rounded-[1px]" style={{ backgroundColor: '#3b82f6', boxShadow: '0 0 4px #3b82f640' }} />
        ))}
      </div>
      {/* Desk surface */}
      <div className="w-12 h-2 rounded-[1px]" style={{ backgroundColor: '#8B7355' }} />
    </div>
  );
}

/* ── Cubicle ── */
function Cubicle({
  agent,
  status,
  selected,
  onClick,
}: {
  agent: AgentCfg;
  status: 'active' | 'recent' | 'idle';
  selected: boolean;
  onClick: () => void;
}) {
  const dotColor = status === 'active' ? '#22c55e' : status === 'recent' ? '#eab308' : '#ef4444';
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-between p-3 rounded-lg transition-all hover:scale-[1.03]"
      style={{
        backgroundColor: selected ? '#1e1b4b' : '#111827',
        border: selected ? `1px solid ${agent.color}60` : '1px solid #1f2937',
        minHeight: 120,
        boxShadow: selected ? `0 0 12px ${agent.color}30` : undefined,
      }}
    >
      {/* Name + status */}
      <div className="w-full flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold tracking-wider" style={{ color: agent.color, fontFamily: 'monospace' }}>
          {agent.name}
        </span>
        <span
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: dotColor,
            boxShadow: status === 'active' ? `0 0 6px ${dotColor}` : undefined,
            animation: status === 'active' ? 'pulse 1.5s ease-in-out infinite' : undefined,
          }}
        />
      </div>
      {/* Character + desk */}
      <PixelCharacter color={agent.color} active={status === 'active'} hasGuitar={agent.id === 'riff'} />
      <Desk monitors={agent.id === 'mcp' ? 2 : 1} />
    </button>
  );
}

/* ── Special Rooms ── */
function MCPOffice({ status, selected, onClick }: { status: 'active' | 'recent' | 'idle'; selected: boolean; onClick: () => void }) {
  const agent = AGENT_MAP['mcp'];
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center justify-between p-4 rounded-lg transition-all hover:scale-[1.02]"
      style={{
        backgroundColor: selected ? '#1e1b4b' : '#111827',
        border: selected ? '1px solid #dc262660' : '1px solid #1f2937',
        gridColumn: 'span 2',
        minHeight: 140,
      }}
    >
      <div className="w-full flex items-center justify-between mb-1">
        <span className="text-xs font-bold tracking-wider text-red-500" style={{ fontFamily: 'monospace' }}>MCP&apos;s OFFICE</span>
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{
            backgroundColor: status === 'active' ? '#22c55e' : status === 'recent' ? '#eab308' : '#ef4444',
            animation: status === 'active' ? 'pulse 1.5s ease-in-out infinite' : undefined,
          }}
        />
      </div>
      <PixelCharacter color={agent.color} active={status === 'active'} />
      <Desk monitors={2} />
    </button>
  );
}

function ConferenceRoom() {
  return (
    <div
      className="flex flex-col items-center justify-center p-4 rounded-lg"
      style={{ backgroundColor: '#111827', border: '1px solid #1f2937', minHeight: 140 }}
    >
      <span className="text-[10px] font-bold tracking-wider text-zinc-500 mb-3" style={{ fontFamily: 'monospace' }}>CONFERENCE</span>
      {/* Table */}
      <div className="w-16 h-8 rounded-full" style={{ backgroundColor: '#8B7355', border: '2px solid #6b5a3e' }} />
      {/* Chairs */}
      <div className="flex gap-2 mt-1">
        {[0,1,2,3].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-zinc-700" />
        ))}
      </div>
    </div>
  );
}

function Kitchen() {
  return (
    <div
      className="flex flex-col items-center justify-center p-4 rounded-lg"
      style={{ backgroundColor: '#111827', border: '1px solid #1f2937', minHeight: 140 }}
    >
      <span className="text-[10px] font-bold tracking-wider text-zinc-500 mb-3" style={{ fontFamily: 'monospace' }}>KITCHEN</span>
      <div className="flex gap-2 items-end">
        {/* Fridge */}
        <div className="w-5 h-10 rounded-[2px] bg-zinc-600" />
        {/* Counter */}
        <div className="w-10 h-5 rounded-[1px]" style={{ backgroundColor: '#8B7355' }} />
        {/* Plant */}
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-green-700" />
          <div className="w-1 h-2 bg-green-900" />
        </div>
      </div>
    </div>
  );
}

/* ── Status Pill ── */
function StatusPill({
  agent,
  status,
  selected,
  onClick,
}: {
  agent: AgentCfg;
  status: 'active' | 'recent' | 'idle';
  selected: boolean;
  onClick: () => void;
}) {
  const isWorking = status === 'active' || status === 'recent';
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] transition-all whitespace-nowrap"
      style={{
        fontFamily: 'monospace',
        backgroundColor: selected ? `${agent.color}20` : '#111827',
        border: selected ? `1px solid ${agent.color}50` : '1px solid #1f293780',
        color: isWorking ? '#fff' : '#6b7280',
      }}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{
          backgroundColor: isWorking ? '#22c55e' : '#4b5563',
          animation: status === 'active' ? 'pulse 1.5s ease-in-out infinite' : undefined,
        }}
      />
      <span className="font-bold">{agent.name}</span>
      <span className="text-[10px]">{status === 'active' ? 'Working' : status === 'recent' ? 'Recent' : 'Idle'}</span>
    </button>
  );
}

/* ── Conversation Panel ── */
function ConversationPanel({ agentId }: { agentId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const agent = AGENT_MAP[agentId];

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/agents/${agentId}/session`);
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch {
      setMessages([]);
    }
  }, [agentId]);

  useEffect(() => {
    fetchMessages();
    const iv = setInterval(fetchMessages, 5000);
    return () => clearInterval(iv);
  }, [fetchMessages]);

  return (
    <div className="mt-4 border border-zinc-800 rounded-lg bg-zinc-900/50 overflow-hidden">
      <div className="px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: agent?.color }} />
        <span className="text-sm font-bold" style={{ color: agent?.color, fontFamily: 'monospace' }}>{agent?.name}</span>
        <span className="text-xs text-zinc-600">Latest Session</span>
      </div>
      <div className="max-h-[400px] overflow-y-auto p-4 space-y-2">
        {messages.length > 0 ? (
          [...messages].reverse().map((msg, i) => (
            <div
              key={i}
              className={`rounded-r-lg p-3 ${
                msg.role === 'user'
                  ? 'border-l-2 border-blue-500 bg-zinc-800/30'
                  : msg.role === 'system'
                    ? 'border-l-2 border-yellow-500 bg-zinc-800/20'
                    : 'border-l-2 border-red-500 bg-zinc-800/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">{msg.role}</span>
                {msg.timestamp && (
                  <span className="text-[10px] text-zinc-600">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                )}
              </div>
              <div className="text-xs text-zinc-300 whitespace-pre-wrap break-words leading-relaxed">
                {msg.content.length > 3000 ? msg.content.slice(0, 3000) + '…' : msg.content}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-zinc-600 text-sm">No recent messages.</div>
        )}
      </div>
    </div>
  );
}

/* ── Main Component ── */
export function PixelHQ() {
  const [activity, setActivity] = useState<Record<string, ActivityItem>>({});
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch('/api/activity');
      const data = await res.json();
      const map: Record<string, ActivityItem> = {};
      (data.activity ?? []).forEach((a: ActivityItem) => { map[a.agent] = a; });
      setActivity(map);
    } catch {}
  }, []);

  useEffect(() => {
    fetchActivity();
    const iv = setInterval(fetchActivity, 8000);
    return () => clearInterval(iv);
  }, [fetchActivity]);

  const getStatus = (id: string): 'active' | 'recent' | 'idle' => activity[id]?.status ?? 'idle';

  const handlePillClick = (id: string) => {
    setSelectedAgent(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Global keyframes */}
      <style jsx global>{`
        @keyframes pixelBounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-2px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-[0.3em] text-zinc-200" style={{ fontFamily: 'monospace' }}>OFFICE</h1>
        <p className="text-sm text-zinc-400 mt-1">Pixel Art Headquarters</p>
        <p className="text-xs text-zinc-600 mt-0.5">Characters sit at their desks. Active agents glow.</p>
      </div>

      {/* Office Floor */}
      <div
        className="p-4 rounded-xl"
        style={{
          background: `repeating-conic-gradient(#1a1a2e 0% 25%, #16162a 0% 50%) 0 0 / 40px 40px`,
        }}
      >
        {/* Top row: special rooms */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          <MCPOffice
            status={getStatus('mcp')}
            selected={selectedAgent === 'mcp'}
            onClick={() => handlePillClick('mcp')}
          />
          <ConferenceRoom />
          <Kitchen />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          {ROW2.map(id => (
            <Cubicle
              key={id}
              agent={AGENT_MAP[id]}
              status={getStatus(id)}
              selected={selectedAgent === id}
              onClick={() => handlePillClick(id)}
            />
          ))}
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          {ROW3.map(id => (
            <Cubicle
              key={id}
              agent={AGENT_MAP[id]}
              status={getStatus(id)}
              selected={selectedAgent === id}
              onClick={() => handlePillClick(id)}
            />
          ))}
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-4 gap-3">
          {ROW4.map(id => (
            <Cubicle
              key={id}
              agent={AGENT_MAP[id]}
              status={getStatus(id)}
              selected={selectedAgent === id}
              onClick={() => handlePillClick(id)}
            />
          ))}
        </div>
      </div>

      {/* Status Pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        {AGENTS.map(a => (
          <StatusPill
            key={a.id}
            agent={a}
            status={getStatus(a.id)}
            selected={selectedAgent === a.id}
            onClick={() => handlePillClick(a.id)}
          />
        ))}
      </div>

      {/* Conversation Panel */}
      {selectedAgent && <ConversationPanel agentId={selectedAgent} />}
    </div>
  );
}
