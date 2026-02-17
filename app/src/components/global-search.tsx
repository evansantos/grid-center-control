'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from './theme-provider';
import { useNotifications } from './notification-provider';

interface SearchItem {
  id: string;
  label: string;
  category: 'Pages' | 'Actions';
  action: () => void;
}

const RECENT_KEY = 'grid-recent-searches';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toggle: toggleTheme } = useTheme();
  const { clearAll: clearNotifications } = useNotifications();

  const items: SearchItem[] = [
    { id: 'home', label: 'Dashboard', category: 'Pages', action: () => { window.location.href = '/'; } },
    { id: 'office', label: 'Office Zones', category: 'Pages', action: () => { window.location.href = '/office'; } },
    { id: 'agents', label: 'Living Office', category: 'Pages', action: () => { window.location.href = '/agents'; } },
    { id: 'tokens', label: 'Token Counter', category: 'Pages', action: () => { window.location.href = '/tokens'; } },
    { id: 'errors', label: 'Error Dashboard', category: 'Pages', action: () => { window.location.href = '/errors'; } },
    { id: 'health', label: 'Health Status', category: 'Pages', action: () => { window.location.href = '/health'; } },
    { id: 'subagents', label: 'Sub-Agent Tree', category: 'Pages', action: () => { window.location.href = '/subagents'; } },
    { id: 'spawn', label: 'Spawn Agent', category: 'Pages', action: () => { window.location.href = '/spawn'; } },
    { id: 'logs', label: 'Log Search', category: 'Pages', action: () => { window.location.href = '/logs'; } },
    { id: 'performance', label: 'Performance', category: 'Pages', action: () => { window.location.href = '/analytics/performance'; } },
    { id: 'sessions', label: 'Sessions Heatmap', category: 'Pages', action: () => { window.location.href = '/analytics/sessions'; } },
    { id: 'timeline', label: 'Timeline', category: 'Pages', action: () => { window.location.href = '/analytics/timeline'; } },
    { id: 'escalation', label: 'Escalation Rules', category: 'Pages', action: () => { window.location.href = '/settings/escalation'; } },
    { id: 'toggle-theme', label: 'Toggle Theme', category: 'Actions', action: toggleTheme },
    { id: 'clear-notifications', label: 'Clear Notifications', category: 'Actions', action: clearNotifications },
  ];

  const filtered = query
    ? items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
    : items;

  const grouped = {
    Pages: filtered.filter((i) => i.category === 'Pages'),
    Actions: filtered.filter((i) => i.category === 'Actions'),
  };

  const flatFiltered = [...grouped.Pages, ...grouped.Actions];

  const saveRecent = (label: string) => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      const next = [label, ...stored.filter((s) => s !== label)].slice(0, 5);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
  };

  const select = useCallback((item: SearchItem) => {
    saveRecent(item.label);
    setOpen(false);
    setQuery('');
    item.action();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') { setOpen(false); setQuery(''); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) { inputRef.current?.focus(); setSelectedIndex(0); }
  }, [open]);

  useEffect(() => { setSelectedIndex(0); }, [query]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, flatFiltered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && flatFiltered[selectedIndex]) { e.preventDefault(); select(flatFiltered[selectedIndex]); }
  };

  if (!open) return null;

  let idx = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => { setOpen(false); setQuery(''); }}>
      <div className="w-full max-w-lg rounded-lg border shadow-2xl overflow-hidden" style={{ background: 'var(--grid-surface)', borderColor: 'var(--grid-border)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--grid-border)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--grid-text-dim)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search pages and actions…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--grid-text)' }}
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded border" style={{ color: 'var(--grid-text-dim)', borderColor: 'var(--grid-border)' }}>ESC</kbd>
        </div>
        <div className="max-h-64 overflow-y-auto py-1">
          {flatFiltered.length === 0 ? (
            <p className="text-center py-6 text-sm" style={{ color: 'var(--grid-text-dim)' }}>No results</p>
          ) : (
            (['Pages', 'Actions'] as const).map((cat) => {
              const catItems = grouped[cat];
              if (catItems.length === 0) return null;
              return (
                <div key={cat}>
                  <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--grid-text-dim)' }}>{cat}</p>
                  {catItems.map((item) => {
                    idx++;
                    const thisIdx = idx;
                    return (
                      <div
                        key={item.id}
                        onClick={() => select(item)}
                        onMouseEnter={() => setSelectedIndex(thisIdx)}
                        className="px-4 py-2 cursor-pointer text-sm flex items-center gap-2 transition-colors"
                        style={{
                          color: 'var(--grid-text)',
                          background: selectedIndex === thisIdx ? 'var(--grid-border)' : 'transparent',
                        }}
                      >
                        {item.label}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
