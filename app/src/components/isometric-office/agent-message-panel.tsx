'use client';

import { useState, useEffect, useRef } from 'react';
import type { AgentCfg, SessionMessage, RoleFilter } from './types';
import { StatusDot } from '@/components/ui/status-dot';

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

  // Handle escape key to close panel
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="agent-msg-panel" 
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 360,
        height: '100vh',
        background: 'linear-gradient(180deg, var(--grid-bg) 0%, var(--grid-surface) 100%)',
        borderLeft: `2px solid ${agent.color}50`,
        boxShadow: `inset 1px 0 20px ${agent.color}10, -4px 0 24px rgba(0,0,0,0.5)`,
        backdropFilter: 'blur(16px)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily: "'JetBrains Mono', monospace",
        overflow: 'hidden',
      }}
      role="dialog"
      aria-labelledby="agent-panel-title"
      aria-describedby="agent-panel-description"
    >
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            background: `linear-gradient(135deg, ${agent.color}, ${agent.colorDark || agent.color})`,
            borderRadius: '50%',
            fontSize: 16,
            border: `1.5px solid ${agent.color}60`,
            boxShadow: `0 0 12px ${agent.color}30`,
          }}>
            {agent.emoji}
          </div>
          <div>
            <h2 
              id="agent-panel-title"
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--grid-text)',
                letterSpacing: 0.5,
              }}
            >
              {agent.name}
            </h2>
            <p 
              id="agent-panel-description"
              style={{
                margin: 0,
                fontSize: 10,
                color: 'var(--grid-text-dim)',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              {agent.zone} • {sessionCount} sessions
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--grid-text-muted)',
            cursor: 'pointer',
            fontSize: 18,
            padding: 4,
            borderRadius: 4,
            transition: 'color 0.2s ease',
            outline: 'none',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--grid-text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--grid-text-muted)'}
          onFocus={e => e.currentTarget.style.outline = '2px solid var(--grid-accent)'}
          onBlur={e => e.currentTarget.style.outline = 'none'}
          aria-label="Close agent panel"
        >
          ×
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: 4,
        padding: '10px 16px',
        borderBottom: '1px solid var(--grid-border-subtle)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 2,
      }}
      role="tablist"
      aria-label="Message filters"
      >
        {(['all', 'user', 'assistant', 'system'] as const).map(f => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            aria-controls="message-list"
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? `${agent.color}25` : 'var(--grid-surface-hover)',
              color: filter === f ? agent.color : 'var(--grid-text-dim)',
              border: filter === f ? `1px solid ${agent.color}40` : '1px solid var(--grid-border)',
              borderRadius: 12,
              padding: '4px 10px',
              fontSize: 10,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              outline: 'none',
            }}
            onFocus={e => e.currentTarget.style.outline = '2px solid var(--grid-accent)'}
            onBlur={e => e.currentTarget.style.outline = 'none'}
          >
            {f}
            {f !== 'all' && (
              <span style={{
                marginLeft: 4,
                background: filter === f ? agent.color : 'var(--grid-text-muted)',
                color: filter === f ? 'var(--grid-bg)' : 'var(--grid-surface)',
                borderRadius: 6,
                padding: '0 4px',
                fontSize: 9,
                fontWeight: 700,
              }}>
                {messages.filter(m => m.role === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div 
        ref={panelRef}
        id="message-list"
        role="tabpanel"
        aria-labelledby="agent-panel-title"
        className="agent-msg-scroll"
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '0 16px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--grid-text-dim)',
            fontSize: 12,
          }}
          role="status"
          aria-live="polite"
          >
            Loading messages...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--grid-text-muted)',
            fontSize: 11,
            textAlign: 'center',
          }}
          role="status"
          aria-live="polite"
          >
            <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.5 }}>💭</div>
            No messages found
            <br />
            <span style={{ fontSize: 10, opacity: 0.7 }}>
              Try a different filter
            </span>
          </div>
        ) : (
          <div style={{ paddingBottom: 16 }}>
            {filtered.map((msg, i) => {
              const isExpanded = expanded.has(i);
              const preview = msg.content.slice(0, 120);
              const needsExpansion = msg.content.length > 120;

              return (
                <div
                  key={i}
                  style={{
                    marginTop: i === 0 ? 12 : 8,
                    background: msg.role === 'user' 
                      ? 'var(--grid-surface-hover)' 
                      : msg.role === 'assistant' 
                      ? `${agent.color}08` 
                      : 'var(--grid-border)10',
                    border: `1px solid ${
                      msg.role === 'user' 
                        ? 'var(--grid-border)' 
                        : msg.role === 'assistant' 
                        ? `${agent.color}20` 
                        : 'var(--grid-border-subtle)'
                    }`,
                    borderRadius: 8,
                    padding: 10,
                    animation: 'fadeInMsg 0.3s ease-out',
                    position: 'relative',
                  }}
                  role="article"
                  aria-labelledby={`message-${i}-header`}
                >
                  {/* Message header */}
                  <div 
                    id={`message-${i}-header`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                      fontSize: 9,
                      opacity: 0.8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <StatusDot 
                        status={msg.role === 'user' ? 'busy' : msg.role === 'assistant' ? 'active' : 'idle'}
                        size="sm"
                        aria-label={`${msg.role} message`}
                      />
                      <span style={{
                        color: msg.role === 'assistant' ? agent.color : 'var(--grid-text-label)',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                      }}>
                        {msg.role}
                      </span>
                    </div>
                    <span style={{ 
                      color: 'var(--grid-text-faint)', 
                      fontFamily: 'monospace',
                      fontSize: 8,
                    }}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>

                  {/* Message content */}
                  <div style={{
                    fontSize: 11,
                    lineHeight: 1.5,
                    color: 'var(--grid-text)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {isExpanded ? msg.content : preview}
                    {needsExpansion && !isExpanded && '...'}
                  </div>

                  {/* Expand/collapse button */}
                  {needsExpansion && (
                    <button
                      onClick={() => toggleExpand(i)}
                      style={{
                        position: 'absolute',
                        bottom: 6,
                        right: 8,
                        background: 'var(--grid-surface)',
                        border: '1px solid var(--grid-border)',
                        borderRadius: 12,
                        padding: '2px 8px',
                        fontSize: 8,
                        color: 'var(--grid-text-dim)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        outline: 'none',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--grid-surface-hover)';
                        e.currentTarget.style.color = 'var(--grid-text)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'var(--grid-surface)';
                        e.currentTarget.style.color = 'var(--grid-text-dim)';
                      }}
                      onFocus={e => e.currentTarget.style.outline = '2px solid var(--grid-accent)'}
                      onBlur={e => e.currentTarget.style.outline = 'none'}
                      aria-label={isExpanded ? 'Collapse message' : 'Expand message'}
                    >
                      {isExpanded ? 'Less' : 'More'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid var(--grid-border-subtle)',
        background: 'var(--grid-surface-hover)20',
        fontSize: 9,
        color: 'var(--grid-text-faint)',
        textAlign: 'center',
        flexShrink: 0,
        position: 'relative',
        zIndex: 2,
      }}>
        {filtered.length} messages • ESC to close
      </div>
    </div>
  );
}