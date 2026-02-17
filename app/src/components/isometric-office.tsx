'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/* ── Types ── */
interface ActivityItem {
  agent: string;
  status: 'active' | 'recent' | 'idle';
  timestamp: string;
  messageCount: number;
  task?: string;
}

interface AgentCfg {
  id: string;
  name: string;
  emoji: string;
  color: string;
  role: string;
  zone: 'boss' | 'engineering' | 'creative' | 'strategy' | 'labs';
  pos: { x: number; y: number };
  accessory: string;
}

const AGENTS: AgentCfg[] = [
  { id: 'mcp',      name: 'MCP',      emoji: '🔴', color: '#dc2626', role: 'Orchestrator',  zone: 'boss',        pos: { x: 120, y: 90 },  accessory: '👑' },
  { id: 'ceo',      name: 'CEO',      emoji: '👔', color: '#d97706', role: 'CEO',           zone: 'boss',        pos: { x: 220, y: 90 },  accessory: '👔' },
  { id: 'grid',     name: 'GRID',     emoji: '⚡', color: '#8b5cf6', role: 'Frontend',      zone: 'engineering', pos: { x: 60, y: 240 },  accessory: '🧥' },
  { id: 'sentinel', name: 'SENTINEL', emoji: '🛡️', color: '#3b82f6', role: 'Security',      zone: 'engineering', pos: { x: 160, y: 240 }, accessory: '🛡️' },
  { id: 'bug',      name: 'BUG',      emoji: '🪲',  color: '#22c55e', role: 'QA Engineer',   zone: 'engineering', pos: { x: 260, y: 240 }, accessory: '🔍' },
  { id: 'arch',     name: 'ARCH',     emoji: '🏛️', color: '#7c3aed', role: 'Architect',     zone: 'engineering', pos: { x: 360, y: 240 }, accessory: '📐' },
  { id: 'dev',      name: 'DEV',      emoji: '🔧', color: '#0ea5e9', role: 'Engineer',      zone: 'engineering', pos: { x: 460, y: 240 }, accessory: '💻' },
  { id: 'pixel',    name: 'PIXEL',    emoji: '🎨', color: '#f43f5e', role: 'Designer',      zone: 'creative',    pos: { x: 580, y: 240 }, accessory: '🎨' },
  { id: 'scribe',   name: 'SCRIBE',   emoji: '✍️',  color: '#ec4899', role: 'Writer',        zone: 'creative',    pos: { x: 700, y: 240 }, accessory: '✏️' },
  { id: 'spec',     name: 'SPEC',     emoji: '📋', color: '#f97316', role: 'Product',       zone: 'strategy',    pos: { x: 100, y: 390 }, accessory: '📋' },
  { id: 'sage',     name: 'SAGE',     emoji: '🧠', color: '#eab308', role: 'Strategist',    zone: 'strategy',    pos: { x: 240, y: 390 }, accessory: '🍵' },
  { id: 'atlas',    name: 'ATLAS',    emoji: '📊', color: '#06b6d4', role: 'Research',      zone: 'labs',        pos: { x: 440, y: 390 }, accessory: '📊' },
  { id: 'riff',     name: 'RIFF',     emoji: '🎸', color: '#ef4444', role: 'Audio',         zone: 'labs',        pos: { x: 580, y: 390 }, accessory: '🎸' },
  { id: 'vault',    name: 'VAULT',    emoji: '📚', color: '#10b981', role: 'Knowledge',     zone: 'labs',        pos: { x: 710, y: 390 }, accessory: '📚' },
];

const FLOOR_W = 840;
const FLOOR_H = 520;

/* ── 3D Isometric Character ── */
function IsoCharacter({ agent, status }: { agent: AgentCfg; status: 'active' | 'recent' | 'idle' }) {
  const isActive = status === 'active';
  const isIdle = status === 'idle';
  const opacity = isIdle ? 0.45 : status === 'recent' ? 0.75 : 1;
  const c = agent.color;
  
  // Darken color for side faces
  const darken = (hex: string, amt: number) => {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, (n >> 16) - amt);
    const g = Math.max(0, ((n >> 8) & 0xff) - amt);
    const b = Math.max(0, (n & 0xff) - amt);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  };
  const cDark = darken(c, 40);
  const cDarker = darken(c, 70);
  const skin = '#fcd34d';
  const skinDark = '#f59e0b';

  const bounce = isActive
    ? 'isoCharBounce 0.8s ease-in-out infinite alternate'
    : isIdle
    ? 'isoCharBreathe 4s ease-in-out infinite'
    : 'isoCharBreathe 5s ease-in-out infinite';

  return (
    <div style={{
      position: 'relative',
      width: 40,
      height: 60,
      opacity,
      animation: bounce,
      filter: isIdle ? 'saturate(0.4)' : undefined,
      transition: 'opacity 0.5s, filter 0.5s',
    }}>
      {/* Shadow */}
      <div style={{
        position: 'absolute',
        bottom: -4,
        left: 4,
        width: 32,
        height: 10,
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.35)',
        filter: 'blur(3px)',
      }} />

      {/* Body — isometric cube */}
      <div style={{
        position: 'absolute',
        bottom: 4,
        left: 4,
        width: 32,
        height: 28,
        transformStyle: 'preserve-3d',
        transform: 'perspective(200px) rotateX(-5deg)',
      }}>
        {/* Front face */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${c}, ${cDark})`,
          borderRadius: '4px 4px 2px 2px',
          border: `1px solid ${cDarker}`,
        }} />
        {/* Top face (lighter) */}
        <div style={{
          position: 'absolute',
          top: -4,
          left: 2,
          width: 28,
          height: 8,
          background: c,
          borderRadius: '3px 3px 0 0',
          transform: 'perspective(100px) rotateX(25deg)',
          opacity: 0.7,
        }} />
        {/* Side accent */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: 6,
          height: '100%',
          background: cDarker,
          borderRadius: '0 4px 2px 0',
          opacity: 0.5,
        }} />
      </div>

      {/* Head */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        left: 8,
        width: 24,
        height: 22,
        transformStyle: 'preserve-3d',
        transform: 'perspective(200px) rotateX(-3deg)',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${skin}, ${skinDark})`,
          borderRadius: 6,
          border: '1px solid #d97706',
        }} />
        {/* Eyes */}
        <div style={{
          position: 'absolute',
          top: 8,
          left: 5,
          display: 'flex',
          gap: 6,
        }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#1e293b' }} />
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#1e293b' }} />
        </div>
      </div>

      {/* Accessory floating above */}
      <div style={{
        position: 'absolute',
        top: -4,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 14,
        filter: isIdle ? 'grayscale(0.5)' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
      }}>
        {agent.accessory}
      </div>

      {/* Active glow ring */}
      {isActive && (
        <div style={{
          position: 'absolute',
          bottom: -6,
          left: -2,
          width: 44,
          height: 14,
          borderRadius: '50%',
          border: `2px solid ${c}`,
          boxShadow: `0 0 12px ${c}80, 0 0 24px ${c}40`,
          animation: 'isoGlowPulse 1.5s ease-in-out infinite',
        }} />
      )}

      {/* Active typing dots */}
      {isActive && (
        <div style={{
          position: 'absolute',
          top: -18,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 3,
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: '#22c55e',
              animation: `isoTypingDot 1s ease-in-out ${i * 0.15}s infinite`,
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Isometric Desk ── */
function IsoDesk({ active }: { active: boolean }) {
  return (
    <div style={{
      width: 50,
      height: 16,
      position: 'relative',
      marginTop: 2,
    }}>
      {/* Desk top */}
      <div style={{
        width: 50,
        height: 8,
        background: active
          ? 'linear-gradient(90deg, #92400e, #78350f)'
          : 'linear-gradient(90deg, #57534e, #44403c)',
        borderRadius: 3,
        border: '1px solid #78350f',
        transform: 'perspective(100px) rotateX(15deg)',
      }} />
      {/* Monitor */}
      <div style={{
        position: 'absolute',
        top: -12,
        left: 14,
        width: 22,
        height: 14,
        background: active ? '#0a1628' : '#1a1a2e',
        borderRadius: 2,
        border: `1px solid ${active ? '#22c55e30' : '#27272a'}`,
        boxShadow: active ? '0 0 8px #22c55e20' : undefined,
      }}>
        {active && (
          <div style={{
            position: 'absolute',
            bottom: 2,
            left: 3,
            display: 'flex',
            gap: 2,
          }}>
            {['#22c55e', '#3b82f6', '#f97316'].map((cl, i) => (
              <div key={i} style={{ width: 2, height: 3 + i, background: cl, borderRadius: 1 }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Zone Label ── */
function ZoneLabel({ x, y, label, icon }: { x: number; y: number; label: string; icon: string }) {
  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      fontSize: 10,
      fontFamily: 'monospace',
      color: '#475569',
      letterSpacing: 2,
      textTransform: 'uppercase',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    }}>
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

/* ── Zone Floor ── */
function ZoneFloor({ x, y, w, h, tint }: { x: number; y: number; w: number; h: number; tint: string }) {
  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      background: tint,
      borderRadius: 8,
      border: '1px dashed rgba(255,255,255,0.04)',
      pointerEvents: 'none',
    }} />
  );
}

/* ── Furniture ── */
function Plant({ x, y, size = 'sm' }: { x: number; y: number; size?: 'sm' | 'lg' }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, pointerEvents: 'none',
      fontSize: size === 'lg' ? 18 : 12,
    }}>
      🌿
    </div>
  );
}

function CoffeeMachine({ x, y }: { x: number; y: number }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, pointerEvents: 'none',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 16 }}>☕</div>
      <div style={{ fontSize: 7, fontFamily: 'monospace', color: '#64748b', marginTop: 1 }}>COFFEE</div>
    </div>
  );
}

/* ── Agent Unit (character + desk + nameplate) ── */
function AgentUnit({
  agent, status, onClick, selected,
}: {
  agent: AgentCfg;
  status: 'active' | 'recent' | 'idle';
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        left: agent.pos.x - 20,
        top: agent.pos.y - 60,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        outline: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: selected ? 50 : 10,
        padding: 0,
      }}
    >
      {/* Selection highlight */}
      {selected && (
        <div style={{
          position: 'absolute',
          inset: -6,
          borderRadius: 8,
          border: `2px solid ${agent.color}80`,
          boxShadow: `0 0 16px ${agent.color}30`,
          pointerEvents: 'none',
        }} />
      )}

      <IsoCharacter agent={agent} status={status} />
      <IsoDesk active={status === 'active'} />

      {/* Nameplate */}
      <div style={{
        marginTop: 2,
        fontSize: 8,
        fontFamily: 'monospace',
        fontWeight: 700,
        color: status === 'active' ? agent.color : '#64748b',
        textShadow: status === 'active' ? `0 0 6px ${agent.color}60` : undefined,
        whiteSpace: 'nowrap',
        textAlign: 'center',
      }}>
        {agent.emoji} {agent.name}
      </div>

      {/* Role */}
      <div style={{
        fontSize: 7,
        fontFamily: 'monospace',
        color: '#475569',
        whiteSpace: 'nowrap',
      }}>
        {agent.role}
      </div>
    </button>
  );
}

/* ── Metrics Bar ── */
function MetricsBar({ activity }: { activity: Record<string, ActivityItem> }) {
  const items = Object.values(activity);
  const activeCount = items.filter(a => a.status === 'active').length;
  const totalMessages = items.reduce((sum, a) => sum + (a.messageCount || 0), 0);

  return (
    <div style={{
      display: 'flex',
      gap: 20,
      justifyContent: 'center',
      padding: '8px 16px',
      marginBottom: 12,
      fontFamily: 'monospace',
      fontSize: 12,
      color: '#94a3b8',
    }}>
      <span>
        <span style={{ color: '#22c55e', fontWeight: 700 }}>● {activeCount}</span> active
      </span>
      <span>
        <span style={{ color: '#8b5cf6', fontWeight: 700 }}>💬 {totalMessages}</span> messages
      </span>
      <span>
        <span style={{ color: '#64748b' }}>{AGENTS.length}</span> agents
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ██  MAIN COMPONENT
   ═══════════════════════════════════════════ */
/* ── Agent Message Panel ── */
interface SessionMessage {
  role: string;
  content: string;
  timestamp?: string;
}

type RoleFilter = 'all' | 'user' | 'assistant' | 'system';

function AgentMessagePanel({ agent, onClose }: { agent: AgentCfg; onClose: () => void }) {
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RoleFilter>('all');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFilter('all');
    setExpanded(new Set());
    fetch(`/api/agents/${agent.id}/session`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) {
          setMessages((data.messages ?? []).slice(-200));
          setSessionCount(data.sessions ?? 0);
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [agent.id]);

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = panelRef.current.scrollHeight;
    }
  }, [messages, filter]);

  const filtered = filter === 'all' ? messages : messages.filter(m => m.role === filter);

  const toggleExpand = (i: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const formatTime = (ts?: string) => {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const truncate = (text: string, max: number) =>
    text.length > max ? text.slice(0, max) + '…' : text;

  return (
    <div className="agent-msg-panel" style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: 360,
      height: '100vh',
      background: 'linear-gradient(180deg, rgba(8, 8, 16, 0.97) 0%, rgba(12, 12, 24, 0.98) 100%)',
      borderLeft: `2px solid ${agent.color}50`,
      boxShadow: `inset 1px 0 20px ${agent.color}10, -4px 0 24px rgba(0,0,0,0.5)`,
      backdropFilter: 'blur(16px)',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      fontFamily: "'JetBrains Mono', monospace",
      overflow: 'hidden',
    }}>
      {/* Scanline overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />
      {/* Grid pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `radial-gradient(${agent.color}08 1px, transparent 1px)`,
        backgroundSize: '16px 16px',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: `1px solid ${agent.color}30`,
        background: `linear-gradient(90deg, ${agent.color}08, transparent)`,
        flexShrink: 0,
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `${agent.color}18`,
            border: `1.5px solid ${agent.color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            boxShadow: `0 0 12px ${agent.color}20`,
          }}>
            {agent.emoji}
          </div>
          <div>
            <div style={{
              color: agent.color,
              fontWeight: 700,
              fontSize: 13,
              textShadow: `0 0 8px ${agent.color}40`,
              letterSpacing: '0.02em',
            }}>{agent.name}</div>
            <div style={{
              color: '#64748b',
              fontSize: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <span style={{
                display: 'inline-block',
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: agent.color,
                boxShadow: `0 0 6px ${agent.color}80`,
                animation: 'isoGlowPulse 2s infinite',
              }} />
              {agent.role}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${agent.color}25`,
            borderRadius: 6,
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px 8px',
            fontSize: 11,
            fontFamily: 'monospace',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `${agent.color}20`;
            e.currentTarget.style.borderColor = `${agent.color}50`;
            e.currentTarget.style.color = agent.color;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.borderColor = `${agent.color}25`;
            e.currentTarget.style.color = '#94a3b8';
          }}
        >✕</button>
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex',
        gap: 0,
        borderBottom: '1px solid #1e293b',
        flexShrink: 0,
        position: 'relative',
        zIndex: 2,
        padding: '0 12px',
      }}>
        {(['all', 'user', 'assistant', 'system'] as RoleFilter[]).map(f => {
          const count = f === 'all' ? messages.length : messages.filter(m => m.role === f).length;
          const active = filter === f;
          const colors: Record<string, string> = { all: '#94a3b8', user: '#3b82f6', assistant: agent.color, system: '#eab308' };
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              flex: 1,
              padding: '7px 4px',
              background: 'none',
              border: 'none',
              borderBottom: active ? `2px solid ${colors[f]}` : '2px solid transparent',
              color: active ? colors[f] : '#475569',
              fontSize: 9,
              fontFamily: 'monospace',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.15s',
            }}>
              {f} ({count})
            </button>
          );
        })}
      </div>

      {/* Messages */}
      <div ref={panelRef} className="agent-msg-scroll" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        position: 'relative',
        zIndex: 2,
        scrollBehavior: 'smooth',
      }}>
        {loading && (
          <div style={{
            color: agent.color,
            fontSize: 11,
            textAlign: 'center',
            marginTop: 40,
            opacity: 0.7,
            animation: 'isoGlowPulse 1.5s infinite',
          }}>
            ▸ Loading session…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{
            color: '#334155',
            fontSize: 11,
            textAlign: 'center',
            marginTop: 40,
            border: '1px dashed #1e293b',
            padding: '16px 12px',
            borderRadius: 8,
          }}>
            ◇ {filter === 'all' ? 'No recent messages' : `No ${filter} messages`}
          </div>
        )}
        {filtered.map((msg, i) => {
          const roleColors: Record<string, string> = { user: '#3b82f6', assistant: agent.color, system: '#eab308' };
          const roleLabels: Record<string, string> = { user: 'USER', assistant: 'AGENT', system: 'SYS' };
          const rc = roleColors[msg.role] ?? '#64748b';
          const isLong = msg.content.length > 300;
          const isExpanded = expanded.has(i);
          const displayText = isLong && !isExpanded ? msg.content.slice(0, 300) + '…' : msg.content;
          const align = msg.role === 'user' ? 'flex-end' : 'flex-start';

          return (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: align,
              animation: `fadeInMsg 0.2s ease-out ${Math.min(i * 0.02, 0.5)}s both`,
            }}>
              {/* Role badge */}
              <span style={{
                fontSize: 8,
                fontWeight: 700,
                color: rc,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 2,
                paddingInline: 4,
                opacity: 0.8,
              }}>{roleLabels[msg.role] ?? msg.role} {msg.timestamp ? `· ${formatTime(msg.timestamp)}` : ''}</span>
              <div
                onClick={isLong ? () => toggleExpand(i) : undefined}
                style={{
                  maxWidth: '88%',
                  padding: '8px 11px',
                  borderRadius: msg.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                  background: msg.role === 'system'
                    ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.08), rgba(234, 179, 8, 0.03))'
                    : msg.role === 'assistant'
                      ? `linear-gradient(135deg, ${agent.color}12, ${agent.color}08)`
                      : 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(30, 41, 59, 0.5))',
                  border: `1px solid ${rc}25`,
                  boxShadow: `0 1px 6px ${rc}10`,
                  fontSize: 11,
                  lineHeight: 1.55,
                  color: '#cbd5e1',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                  cursor: isLong ? 'pointer' : 'default',
                }}>
                {displayText}
                {isLong && (
                  <span style={{ color: rc, fontSize: 9, marginLeft: 4 }}>
                    {isExpanded ? '[collapse]' : '[expand]'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding: '10px 16px',
        borderTop: `1px solid ${agent.color}15`,
        background: `linear-gradient(90deg, ${agent.color}05, transparent)`,
        flexShrink: 0,
        fontSize: 10,
        color: '#3b4252',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
        letterSpacing: '0.05em',
      }}>
        {messages.length > 0
          ? `■ ${messages.length} messages ─ last 24h`
          : '◇ No session data'}
        {sessionCount > 1 && ` ■ ${sessionCount} sessions`}
      </div>
    </div>
  );
}

export default function IsometricOffice() {
  const [activity, setActivity] = useState<Record<string, ActivityItem>>({});
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch('/api/activity');
      const data = await res.json();
      const map: Record<string, ActivityItem> = {};
      for (const a of (data.activity ?? [])) {
        if (!map[a.agent] || a.status === 'active') map[a.agent] = a;
      }
      setActivity(map);
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    fetchActivity();
    const iv = setInterval(fetchActivity, 15000);
    return () => clearInterval(iv);
  }, [fetchActivity]);

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setScale(Math.min(w / FLOOR_W, 1.15));
      }
    };
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    update();
    return () => ro.disconnect();
  }, []);

  const getStatus = (id: string): 'active' | 'recent' | 'idle' => activity[id]?.status ?? 'idle';

  const handleFloorClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.floor) setSelectedAgent(null);
  };

  return (
    <div style={{ fontFamily: 'monospace' }}>
      {/* Keyframes */}
      <style>{`
        @keyframes isoCharBounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-3px); }
        }
        @keyframes isoCharBreathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.5px); }
        }
        @keyframes isoGlowPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes isoTypingDot {
          0%, 80%, 100% { opacity: 0.2; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-3px); }
        }
        @keyframes isoNeonFlicker {
          0%, 93%, 95%, 97%, 100% { opacity: 1; }
          94% { opacity: 0.7; }
          96% { opacity: 0.9; }
        }
        @keyframes isoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeInMsg {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .agent-msg-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .agent-msg-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .agent-msg-scroll::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.25);
          border-radius: 4px;
        }
        .agent-msg-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.4);
        }
      `}</style>

      <MetricsBar activity={activity} />

      <div ref={containerRef} style={{
        width: '100%',
        maxWidth: 1100,
        margin: '0 auto',
        height: FLOOR_H * scale,
        overflow: 'hidden',
      }}>
        <div
          data-floor="true"
          onClick={handleFloorClick}
          style={{
            position: 'relative',
            width: FLOOR_W,
            height: FLOOR_H,
            transform: `perspective(1200px) rotateX(8deg) scale(${scale})`,
            transformOrigin: 'top left',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 12px 60px rgba(0,0,0,0.7), 0 0 1px rgba(255,255,255,0.05)',
          }}>

          {/* Floor — isometric checkered */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `
              repeating-conic-gradient(#12121a 0% 25%, #0e0e16 0% 50%) 0 0 / 32px 32px
            `,
            borderRadius: 14,
          }} />

          {/* Border glow */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 14,
            border: '1px solid #dc262630',
            boxShadow: 'inset 0 0 40px rgba(220,38,38,0.03)',
            pointerEvents: 'none',
          }} />

          {/* Title */}
          <div style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 22,
            fontWeight: 700,
            fontFamily: 'monospace',
            letterSpacing: 8,
            color: '#8b5cf6',
            textShadow: '0 0 10px #8b5cf680, 0 0 20px #8b5cf640, 0 0 40px #8b5cf620',
            animation: 'isoNeonFlicker 6s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: 20,
          }}>
            GRID HQ
          </div>

          {/* Zone floors */}
          <ZoneFloor x={40} y={55} w={260} h={130} tint="rgba(220,38,38,0.06)" />
          <ZoneFloor x={20} y={200} w={530} h={120} tint="rgba(139,92,246,0.05)" />
          <ZoneFloor x={560} y={200} w={260} h={120} tint="rgba(236,72,153,0.05)" />
          <ZoneFloor x={40} y={350} w={280} h={120} tint="rgba(249,115,22,0.05)" />
          <ZoneFloor x={380} y={350} w={430} h={120} tint="rgba(6,182,212,0.05)" />

          {/* Zone labels */}
          <ZoneLabel x={50} y={60} label="BOSS OFFICE" icon="🔴" />
          <ZoneLabel x={30} y={205} label="ENGINEERING" icon="⚡" />
          <ZoneLabel x={570} y={205} label="CREATIVE" icon="🎨" />
          <ZoneLabel x={50} y={355} label="STRATEGY" icon="📋" />
          <ZoneLabel x={390} y={355} label="LABS" icon="🧪" />

          {/* Furniture */}
          <Plant x={320} y={70} size="lg" />
          <Plant x={540} y={80} />
          <Plant x={790} y={200} size="lg" />
          <Plant x={30} y={470} />
          <CoffeeMachine x={400} y={65} />

          {/* Whiteboard */}
          <div style={{
            position: 'absolute',
            left: 700,
            top: 210,
            width: 70,
            height: 45,
            background: '#e5e7eb',
            borderRadius: 3,
            border: '2px solid #cbd5e1',
            padding: 4,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            pointerEvents: 'none',
          }}>
            {['#fef08a','#fbcfe8','#a5f3fc','#bbf7d0','#fecaca'].map((c, i) => (
              <div key={i} style={{ width: 8, height: 8, background: c, borderRadius: 1 }} />
            ))}
          </div>
          <div style={{
            position: 'absolute', left: 705, top: 258,
            fontSize: 7, fontFamily: 'monospace', color: '#64748b', pointerEvents: 'none',
          }}>Mood Board</div>

          {/* Agents */}
          {AGENTS.map((agent) => (
            <AgentUnit
              key={agent.id}
              agent={agent}
              status={getStatus(agent.id)}
              onClick={() => setSelectedAgent(prev => prev === agent.id ? null : agent.id)}
              selected={selectedAgent === agent.id}
            />
          ))}

          {/* Interaction lines between active agents */}
          {(() => {
            const activeAgents = AGENTS.filter(a => getStatus(a.id) === 'active');
            if (activeAgents.length < 2) return null;
            return activeAgents.slice(0, 4).flatMap((a, i) =>
              activeAgents.slice(i + 1, 4).map((b, j) => {
                const dx = b.pos.x - a.pos.x;
                const dy = b.pos.y - a.pos.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                return (
                  <div key={`line-${i}-${j}`} style={{
                    position: 'absolute',
                    left: a.pos.x,
                    top: a.pos.y,
                    width: len,
                    height: 1,
                    background: 'linear-gradient(90deg, #22c55e40, #22c55e80, #22c55e40)',
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: '0 0',
                    opacity: 0.3,
                    pointerEvents: 'none',
                    zIndex: 5,
                  }} />
                );
              })
            );
          })()}

          {/* Clock */}
          <div style={{
            position: 'absolute',
            right: 12,
            bottom: 10,
            fontSize: 10,
            fontFamily: 'monospace',
            color: '#475569',
            pointerEvents: 'none',
            zIndex: 20,
          }}>
            {new Date().getHours().toString().padStart(2, '0')}:{new Date().getMinutes().toString().padStart(2, '0')}
          </div>

          {/* Dim overlay when selected */}
          {selectedAgent && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.25)',
              pointerEvents: 'none', zIndex: 8,
              borderRadius: 14,
            }} />
          )}

        </div>
      </div>

      {/* Status pills */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        justifyContent: 'center',
        marginTop: 14,
        padding: '8px 0',
      }}>
        {AGENTS.map(a => {
          const st = getStatus(a.id);
          const isSel = selectedAgent === a.id;
          return (
            <button
              key={a.id}
              onClick={() => setSelectedAgent(prev => prev === a.id ? null : a.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 16,
                border: isSel ? `1px solid ${a.color}80` : '1px solid #1e293b',
                background: isSel ? `${a.color}15` : '#0a0a0f',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: 10,
                color: st === 'active' ? '#e2e8f0' : '#64748b',
                outline: 'none',
                transition: 'all 0.2s',
              }}
            >
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                display: 'inline-block',
                background: st === 'active' ? '#22c55e' : st === 'recent' ? '#eab308' : '#4b5563',
                boxShadow: st === 'active' ? '0 0 6px #22c55e' : undefined,
              }} />
              <span style={{ fontWeight: 700 }}>{a.name}</span>
            </button>
          );
        })}
      </div>

      {/* Agent message panel — fixed to right side of browser */}
      {selectedAgent && (() => {
        const agentCfg = AGENTS.find(a => a.id === selectedAgent);
        if (!agentCfg) return null;
        return (
          <AgentMessagePanel
            agent={agentCfg}
            onClose={() => setSelectedAgent(null)}
          />
        );
      })()}
    </div>
  );
}
