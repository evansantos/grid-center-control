'use client';

import { useRealtimeStream } from '@/hooks/use-realtime-stream';
import type { ParsedActivity } from '@/lib/activity-parser';

const TYPE_ICONS: Record<ParsedActivity['type'], string> = {
  'message': '💬',
  'tool-call': '🔧',
  'tool-result': '📦',
  'thinking': '🤔',
  'error': '❌',
  'session-start': '🟢',
  'session-end': '🔴',
  'file-change': '📄',
};

const TYPE_COLORS: Record<ParsedActivity['type'], string> = {
  'message': '#3b82f6',
  'tool-call': '#8b5cf6',
  'tool-result': '#22c55e',
  'thinking': '#eab308',
  'error': '#ef4444',
  'session-start': '#22c55e',
  'session-end': '#ef4444',
  'file-change': '#06b6d4',
};

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 5) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function LiveActivityStream({ maxHeight = 400 }: { maxHeight?: number }) {
  const { activities, connected, error, clear } = useRealtimeStream();

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs font-mono font-bold text-zinc-400">
            LIVE ACTIVITY
          </span>
          <span className="text-xs font-mono text-zinc-600">
            ({activities.length})
          </span>
        </div>
        <div className="flex gap-2">
          {error && (
            <span className="text-xs font-mono text-red-400">{error}</span>
          )}
          <button
            onClick={clear}
            className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Activity list */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        {activities.length === 0 ? (
          <div className="text-center py-8 text-zinc-600 text-xs font-mono">
            {connected ? 'Waiting for activity...' : 'Connecting...'}
          </div>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-2 px-3 py-1.5 hover:bg-zinc-900/50 transition-colors border-b border-zinc-900"
            >
              <span className="text-sm flex-shrink-0 mt-0.5">
                {TYPE_ICONS[item.type] || '📌'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: TYPE_COLORS[item.type] || '#94a3b8' }}
                  >
                    {item.agent.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-zinc-500 truncate">
                    {item.summary}
                  </span>
                </div>
                {item.detail && (
                  <div className="text-xs font-mono text-zinc-600 truncate mt-0.5">
                    {item.detail}
                  </div>
                )}
              </div>
              <span className="text-xs font-mono text-zinc-700 flex-shrink-0 whitespace-nowrap">
                {timeAgo(item.timestamp)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
