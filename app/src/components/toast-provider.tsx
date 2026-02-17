'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface Toast {
  id: string;
  emoji: string;
  name: string;
  message: string;
  color: string;
  createdAt: number;
}

interface AgentStatus {
  id: string;
  name: string;
  emoji: string;
  status: 'active' | 'idle';
}

const ToastContext = createContext<{
  addToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => void;
}>({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const prevStatusRef = useRef<Map<string, string>>(new Map());
  const initialLoadRef = useRef(true);

  const addToast = useCallback((t: Omit<Toast, 'id' | 'createdAt'>) => {
    const toast: Toast = { ...t, id: Math.random().toString(36).slice(2), createdAt: Date.now() };
    setToasts(prev => [...prev.slice(-2), toast]); // max 3
  }, []);

  // Auto-dismiss after 5s
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setInterval(() => {
      setToasts(prev => prev.filter(t => Date.now() - t.createdAt < 5000));
    }, 1000);
    return () => clearInterval(timer);
  }, [toasts.length]);

  // Poll agent status
  useEffect(() => {
    const poll = async () => {
      try {
        const [statusRes, agentsRes] = await Promise.all([
          fetch('/api/agents/status'),
          fetch('/api/agents'),
        ]);
        const statusData = await statusRes.json();
        const agentsData = await agentsRes.json();
        const statusMap: Record<string, { active: boolean }> = statusData.status ?? {};
        const agentsList: { id: string; name: string; emoji: string }[] = agentsData.agents ?? [];

        if (initialLoadRef.current) {
          Object.entries(statusMap).forEach(([id, s]) => prevStatusRef.current.set(id, s.active ? 'active' : 'idle'));
          initialLoadRef.current = false;
          return;
        }

        for (const [id, s] of Object.entries(statusMap)) {
          const newStatus = s.active ? 'active' : 'idle';
          const prev = prevStatusRef.current.get(id);
          if (prev && prev !== newStatus) {
            const agent = agentsList.find(a => a.id === id);
            const msg = newStatus === 'active' ? 'started working' : 'went idle';
            const color = newStatus === 'active' ? '#22c55e' : '#64748b';
            addToast({ emoji: agent?.emoji ?? '🤖', name: agent?.name ?? id, message: msg, color });
          }
          prevStatusRef.current.set(id, newStatus);
        }
      } catch {}
    };

    poll();
    const iv = setInterval(poll, 15_000);
    return () => clearInterval(iv);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      {toasts.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 16, right: 16, zIndex: 300,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <style>{`
            @keyframes toastSlideIn {
              from { opacity: 0; transform: translateX(100%); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes toastFadeOut {
              from { opacity: 1; }
              to { opacity: 0; transform: translateX(50%); }
            }
          `}</style>
          {toasts.map(toast => {
            const age = Date.now() - toast.createdAt;
            const fading = age > 4000;
            return (
              <div
                key={toast.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px',
                  backgroundColor: '#0a0a0f',
                  borderLeft: `3px solid ${toast.color}`,
                  border: '1px solid #27272a',
                  borderRadius: 8,
                  fontFamily: 'monospace', fontSize: 12,
                  color: '#d1d5db',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                  animation: fading
                    ? 'toastFadeOut 0.3s ease-in forwards'
                    : 'toastSlideIn 0.3s ease-out',
                  minWidth: 240,
                }}
              >
                <span style={{ fontSize: 18 }}>{toast.emoji}</span>
                <div>
                  <span style={{ fontWeight: 'bold', color: toast.color }}>{toast.name}</span>
                  {' '}
                  <span style={{ color: '#94a3b8' }}>{toast.message}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
}
