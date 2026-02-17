'use client';

import { useState, useCallback } from 'react';

interface ControlButtonsProps {
  agentId: string;
  onAction?: (action: string, result: unknown) => void;
  size?: 'sm' | 'md';
}

export function ControlButtons({ agentId, onAction, size = 'md' }: ControlButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmKill, setConfirmKill] = useState(false);

  const execute = useCallback(async (action: string) => {
    setLoading(action);
    try {
      const res = await fetch(`/api/agents/${agentId}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      onAction?.(action, data);
    } catch (err) {
      onAction?.(action, { error: String(err) });
    } finally {
      setLoading(null);
      setConfirmKill(false);
    }
  }, [agentId, onAction]);

  const btnClass = size === 'sm'
    ? 'px-2 py-1 text-xs rounded'
    : 'px-3 py-1.5 text-sm rounded-md';

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => execute('pause')}
        disabled={loading !== null}
        className={`${btnClass} font-mono font-bold border transition-colors
          bg-yellow-500/10 border-yellow-500/30 text-yellow-400
          hover:bg-yellow-500/20 disabled:opacity-50`}
      >
        {loading === 'pause' ? '...' : '⏸ Pause'}
      </button>

      <button
        onClick={() => execute('resume')}
        disabled={loading !== null}
        className={`${btnClass} font-mono font-bold border transition-colors
          bg-green-500/10 border-green-500/30 text-green-400
          hover:bg-green-500/20 disabled:opacity-50`}
      >
        {loading === 'resume' ? '...' : '▶ Resume'}
      </button>

      {confirmKill ? (
        <div className="flex items-center gap-1">
          <span className="text-xs text-red-400 font-mono">Sure?</span>
          <button
            onClick={() => execute('kill')}
            disabled={loading !== null}
            className={`${btnClass} font-mono font-bold border transition-colors
              bg-red-500/20 border-red-500/50 text-red-300
              hover:bg-red-500/30 disabled:opacity-50`}
          >
            {loading === 'kill' ? '...' : '✓ Yes'}
          </button>
          <button
            onClick={() => setConfirmKill(false)}
            className={`${btnClass} font-mono border border-zinc-700 text-zinc-400 hover:text-zinc-300`}
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmKill(true)}
          disabled={loading !== null}
          className={`${btnClass} font-mono font-bold border transition-colors
            bg-red-500/10 border-red-500/30 text-red-400
            hover:bg-red-500/20 disabled:opacity-50`}
        >
          ☠ Kill
        </button>
      )}
    </div>
  );
}
