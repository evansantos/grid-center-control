'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { timeAgo } from '@/lib/utils';
import { ControlButtons } from './control-buttons';

interface Message {
  role: string;
  content: string;
  timestamp?: string;
}

interface AgentInfo {
  emoji: string;
  name: string;
  color: string;
  role: string;
}

function ExpandableMessage({ content, color }: { content: string; color: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = content.length > 800;

  return (
    <div className="text-xs text-zinc-300 font-mono whitespace-pre-wrap break-words leading-relaxed">
      {isLong && !expanded ? content.slice(0, 800) + '…' : content}
      {isLong && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="block mt-1 bg-none border-none cursor-pointer text-xs font-mono p-0"
          style={{ color }}
        >
          {expanded ? '▲ Show less' : '▼ Show more'}
        </button>
      )}
    </div>
  );
}

const ROLES = ['user', 'assistant', 'system'] as const;

export function ConversationPanel({ agentId, agent, onClose }: {
  agentId: string;
  agent: AgentInfo;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [activeRoles, setActiveRoles] = useState<Set<string>>(new Set(ROLES));
  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/agents/${agentId}/session`);
      const data = await res.json();
      setMessages(data.messages ?? []);
      setLastRefresh(new Date());
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    setLoading(true);
    fetchMessages();
    const iv = setInterval(fetchMessages, 5000);
    return () => clearInterval(iv);
  }, [fetchMessages]);

  // Auto-scroll when new messages arrive and user is at bottom
  useEffect(() => {
    if (messages.length > prevCountRef.current && isAtBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    prevCountRef.current = messages.length;
  }, [messages.length, isAtBottom]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    setIsAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 40);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      setIsAtBottom(true);
    }
  };

  const toggleRole = (role: string) => {
    setActiveRoles(prev => {
      const next = new Set(prev);
      if (next.has(role)) {
        if (next.size > 1) next.delete(role);
      } else {
        next.add(role);
      }
      return next;
    });
  };

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const filtered = messages.filter(m => activeRoles.has(m.role));

  return (
    <div 
      className="fixed top-0 right-0 w-96 h-screen bg-zinc-950 z-50 flex flex-col animate-[slideInRight_0.3s_ease-out]"
      style={{
        borderLeft: `2px solid ${agent.color}`,
        boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">{agent.emoji}</span>
          <div>
            <div className="flex items-center gap-1.5">
              <span 
                className="font-mono font-bold text-sm"
                style={{ color: agent.color }}
              >
                {agent.name}
              </span>
              {messages.length > 0 && (
                <span 
                  className="text-xs font-mono px-1.5 py-0.5 rounded-lg font-bold"
                  style={{
                    backgroundColor: agent.color + '25',
                    color: agent.color,
                  }}
                >
                  {messages.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-slate-500 text-xs">{agent.role}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-mono text-slate-600">
                Live · {timeAgo(lastRefresh.toISOString())}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={fetchMessages}
            className="bg-transparent border border-slate-600 rounded px-2 py-1 text-slate-400 cursor-pointer font-mono text-xs hover:text-slate-300 hover:border-slate-500"
          >↻</button>
          <button
            onClick={onClose}
            className="bg-transparent border border-slate-600 rounded px-2.5 py-1 text-slate-400 cursor-pointer font-mono text-xs hover:text-slate-300 hover:border-slate-500"
          >✕ ESC</button>
        </div>
      </div>

      {/* Role filters */}
      <div className="flex gap-1 px-4 py-2 border-b border-slate-700 flex-shrink-0">
        {ROLES.map(role => {
          const active = activeRoles.has(role);
          const roleColor = role === 'user' ? '#3b82f6' : role === 'system' ? '#eab308' : agent.color;
          return (
            <button 
              key={role} 
              onClick={() => toggleRole(role)} 
              className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded-xl cursor-pointer transition-colors"
              style={{
                border: `1px solid ${active ? roleColor + '60' : '#27272a'}`,
                backgroundColor: active ? roleColor + '15' : 'transparent',
                color: active ? roleColor : '#4b5563',
              }}
            >
              {role}
            </button>
          );
        })}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-2"
      >
        {loading ? (
          <div className="text-center pt-15">
            <div className="text-2xl animate-pulse">⏳</div>
            <div className="text-xs font-mono text-slate-600 mt-2">Loading messages...</div>
          </div>
        ) : filtered.length > 0 ? (
          [...filtered].reverse().map((msg, i) => {
            const msgKey = msg.timestamp ? `${msg.timestamp}-${msg.role}` : `${i}-${msg.role}-${msg.content.slice(0, 20)}`;
            const roleColor = msg.role === 'user' ? '#3b82f6' : msg.role === 'system' ? '#eab308' : agent.color;
            return (
              <div 
                key={msgKey} 
                className="px-3 py-2 rounded-r bg-gray-900"
                style={{ borderLeft: `2px solid ${roleColor}` }}
              >
                <div className="flex gap-2 mb-1">
                  <span className="text-xs font-mono text-slate-500 uppercase font-bold">
                    {msg.role}
                  </span>
                  {msg.timestamp && (
                    <span className="text-xs font-mono text-slate-600">
                      {timeAgo(msg.timestamp)}
                    </span>
                  )}
                </div>
                <ExpandableMessage content={msg.content} color={agent.color} />
              </div>
            );
          })
        ) : (
          <div className="text-center pt-15">
            <div className="text-3xl mb-2">{agent.emoji}</div>
            <div 
              className="text-sm font-mono font-bold mb-1"
              style={{ color: agent.color }}
            >{agent.name}</div>
            <div className="text-xs font-mono text-slate-500 mb-3">{agent.role}</div>
            <div className="text-xs font-mono text-slate-600">No recent activity</div>
          </div>
        )}
      </div>

      {/* Send Message Input */}
      <div className="px-4 py-2 border-t border-slate-700 flex-shrink-0">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const input = form.elements.namedItem('msg') as HTMLInputElement;
            const msg = input.value.trim();
            if (!msg) return;
            input.value = '';
            try {
              await fetch(`/api/agents/${agentId}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg }),
              });
              fetchMessages();
            } catch { /* ignore */ }
          }}
          className="flex gap-2"
        >
          <input
            name="msg"
            type="text"
            placeholder={`Message ${agent.name}...`}
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-xs font-mono text-white placeholder-zinc-600 outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded text-xs font-mono font-bold border transition-colors"
            style={{
              backgroundColor: agent.color + '20',
              borderColor: agent.color + '50',
              color: agent.color,
            }}
          >
            Send
          </button>
        </form>
        <div className="mt-2">
          <ControlButtons agentId={agentId} size="sm" />
        </div>
      </div>

      {/* Jump to bottom */}
      {!isAtBottom && filtered.length > 5 && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 text-white border-none rounded-2xl px-3 py-1.5 cursor-pointer font-mono text-xs font-bold z-10"
          style={{
            backgroundColor: agent.color,
            boxShadow: `0 2px 8px ${agent.color}40`,
          }}
        >
          ↓ Jump to bottom
        </button>
      )}
    </div>
  );
}