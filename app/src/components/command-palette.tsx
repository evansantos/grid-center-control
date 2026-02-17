'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AgentResult {
  id: string;
  name: string;
  emoji: string;
  role: string;
}

interface SearchItem {
  id: string;
  label: string;
  icon: string;
  hint?: string;
  category: 'page' | 'agent' | 'action';
  action: () => void;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [agents, setAgents] = useState<AgentResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch agents for search
  useEffect(() => {
    fetch('/api/agents')
      .then(r => r.json())
      .then(d => setAgents(d.agents ?? []))
      .catch(() => {});
  }, []);

  // Toggle with Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
        setQuery('');
        setSelected(0);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const navigate = useCallback((path: string) => {
    setOpen(false);
    router.push(path);
  }, [router]);

  const items: SearchItem[] = [
    // Pages
    { id: 'p-projects', label: 'Projects', icon: '📁', hint: '⌘1', category: 'page', action: () => navigate('/') },
    { id: 'p-team', label: 'Team HQ', icon: '👥', hint: '⌘2', category: 'page', action: () => navigate('/agents') },
    { id: 'p-metrics', label: 'Metrics', icon: '📊', hint: '⌘3', category: 'page', action: () => navigate('/metrics') },
    // Agents
    ...agents.map(a => ({
      id: `a-${a.id}`,
      label: `${a.name}`,
      icon: a.emoji,
      hint: a.role,
      category: 'agent' as const,
      action: () => { navigate('/agents'); },
    })),
  ];

  const q = query.toLowerCase();
  const filtered = q
    ? items.filter(i => i.label.toLowerCase().includes(q) || (i.hint?.toLowerCase().includes(q)))
    : items;

  // Group by category
  const pages = filtered.filter(i => i.category === 'page');
  const agentItems = filtered.filter(i => i.category === 'agent');

  const allFiltered = [...pages, ...agentItems];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(prev => Math.min(prev + 1, allFiltered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && allFiltered[selected]) {
      allFiltered[selected].action();
    }
  };

  if (!open) return null;

  let idx = -1;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '20vh',
      }}
      onClick={() => setOpen(false)}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 520, maxHeight: '60vh',
          backgroundColor: '#0a0a0f',
          border: '1px solid #27272a',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          animation: 'cmdPaletteIn 0.15s ease-out',
        }}
      >
        <style>{`
          @keyframes cmdPaletteIn {
            from { opacity: 0; transform: scale(0.96) translateY(-8px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #1e1e2e', gap: 10 }}>
          <span style={{ color: '#64748b', fontSize: 16 }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, agents..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: '#e2e8f0', fontFamily: 'monospace', fontSize: 14,
            }}
          />
          <kbd style={{
            fontSize: 10, fontFamily: 'monospace', color: '#64748b',
            padding: '2px 6px', borderRadius: 4, border: '1px solid #27272a',
          }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '45vh', overflowY: 'auto', padding: '8px 0' }}>
          {pages.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#475569', padding: '8px 16px 4px', textTransform: 'uppercase', letterSpacing: 1 }}>Pages</div>
              {pages.map(item => {
                idx++;
                const i = idx;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '8px 16px', border: 'none',
                      background: selected === i ? '#dc262620' : 'transparent',
                      color: selected === i ? '#fca5a5' : '#d1d5db',
                      fontFamily: 'monospace', fontSize: 13, cursor: 'pointer',
                      textAlign: 'left', outline: 'none',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={() => setSelected(i)}
                  >
                    <span>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.hint && <span style={{ fontSize: 10, color: '#475569' }}>{item.hint}</span>}
                  </button>
                );
              })}
            </>
          )}

          {agentItems.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontFamily: 'monospace', color: '#475569', padding: '12px 16px 4px', textTransform: 'uppercase', letterSpacing: 1 }}>Agents</div>
              {agentItems.map(item => {
                idx++;
                const i = idx;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '8px 16px', border: 'none',
                      background: selected === i ? '#dc262620' : 'transparent',
                      color: selected === i ? '#fca5a5' : '#d1d5db',
                      fontFamily: 'monospace', fontSize: 13, cursor: 'pointer',
                      textAlign: 'left', outline: 'none',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={() => setSelected(i)}
                  >
                    <span>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.hint && <span style={{ fontSize: 10, color: '#475569' }}>{item.hint}</span>}
                  </button>
                );
              })}
            </>
          )}

          {allFiltered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 16px', color: '#475569', fontFamily: 'monospace', fontSize: 13 }}>
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
