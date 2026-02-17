'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications } from './notification-provider';

function relativeTime(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const typeIcon: Record<string, string> = { info: 'ℹ️', warning: '⚠️', error: '❌', success: '✅' };

export function NotificationCenter() {
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-1.5" style={{ color: 'var(--grid-text-dim)' }} aria-label="Notifications">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center" style={{ background: 'var(--grid-accent)' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg shadow-xl border z-50 overflow-hidden" style={{ background: 'var(--grid-surface)', borderColor: 'var(--grid-border)' }}>
          <div className="flex items-center justify-between px-3 py-2 border-b text-xs font-bold" style={{ borderColor: 'var(--grid-border)', color: 'var(--grid-text)' }}>
            <span>Notifications</span>
            <div className="flex gap-2">
              {unreadCount > 0 && <button onClick={markAllRead} className="hover:underline" style={{ color: 'var(--grid-accent)' }}>Mark all read</button>}
              {notifications.length > 0 && <button onClick={clearAll} className="hover:underline" style={{ color: 'var(--grid-text-dim)' }}>Clear</button>}
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center py-8 text-sm" style={{ color: 'var(--grid-text-dim)' }}>No notifications</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => { markRead(n.id); if (n.link) window.location.href = n.link; }}
                  className="px-3 py-2 border-b cursor-pointer transition-colors hover:brightness-110"
                  style={{ borderColor: 'var(--grid-border)', opacity: n.read ? 0.6 : 1 }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-sm">{typeIcon[n.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold" style={{ color: 'var(--grid-text)' }}>{n.title}</span>
                        <span className="text-[10px]" style={{ color: 'var(--grid-text-dim)' }}>{relativeTime(n.timestamp)}</span>
                      </div>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--grid-text-dim)' }}>{n.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
