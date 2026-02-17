'use client';

import { useState, useEffect, useRef } from 'react';
import type { AgentCfg, SessionMessage, RoleFilter } from './types';

/* ── Agent Message Panel ── */
export function AgentMessagePanel({ agent, onClose }: { agent: AgentCfg; onClose: () => void }) {
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
              color: 'var(--grid-text-secondary)',
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
            color: 'var(--grid-text-label)',
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
            e.currentTarget.style.color = 'var(--grid-text-label)';
          }}
        >✕</button>
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex',
        gap: 0,
        borderBottom: '1px solid var(--grid-border)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 2,
        padding: '0 12px',
      }}>
        {(['all', 'user', 'assistant', 'system'] as RoleFilter[]).map(f => {
          const count = f === 'all' ? messages.length : messages.filter(m => m.role === f).length;
          const active = filter === f;
          const colors: Record<string, string> = { all: 'var(--grid-text-label)', user: 'var(--grid-info)', assistant: agent.color, system: 'var(--grid-yellow)' };
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              flex: 1,
              padding: '7px 4px',
              background: 'none',
              border: 'none',
              borderBottom: active ? `2px solid ${colors[f]}` : '2px solid transparent',
              color: active ? colors[f] : 'var(--grid-text-muted)',
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
            color: 'var(--grid-text-muted)',
            fontSize: 11,
            textAlign: 'center',
            marginTop: 40,
            border: '1px dashed var(--grid-border)',
            padding: '16px 12px',
            borderRadius: 8,
          }}>
            ◇ {filter === 'all' ? 'No recent messages' : `No ${filter} messages`}
          </div>
        )}
        {filtered.map((msg, i) => {
          const roleColors: Record<string, string> = { user: 'var(--grid-info)', assistant: agent.color, system: 'var(--grid-yellow)' };
          const roleLabels: Record<string, string> = { user: 'USER', assistant: 'AGENT', system: 'SYS' };
          const rc = roleColors[msg.role] ?? 'var(--grid-text-secondary)';
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
                  color: 'var(--grid-text)',
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
        color: 'var(--grid-text-muted)',
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
