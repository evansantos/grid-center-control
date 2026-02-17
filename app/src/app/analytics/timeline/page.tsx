'use client';

import { useState, useEffect } from 'react';
import { SessionTimeline } from '@/components/session-timeline';

interface SessionOption {
  key: string;
  agent: string;
  date: string;
}

export default function TimelinePage() {
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/subagents')
      .then(r => r.json())
      .then(data => {
        const flat: SessionOption[] = [];
        const flatten = (items: any[]) => {
          for (const item of items) {
            flat.push({ key: item.sessionKey, agent: item.agentId, date: item.startedAt });
            if (item.children?.length) flatten(item.children);
          }
        };
        flatten(data);
        flat.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setSessions(flat);
        if (flat.length > 0) setSelected(flat[0].key);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">📊 Session Timeline</h1>
        <p className="text-sm text-zinc-500 mt-1">Flame graph visualization of session events</p>
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-1">Session</label>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
        >
          {loading && <option>Loading sessions...</option>}
          {sessions.map(s => (
            <option key={s.key} value={s.key}>
              {s.agent} — {new Date(s.date).toLocaleString()} — {s.key.slice(-12)}
            </option>
          ))}
        </select>
      </div>

      {selected && <SessionTimeline sessionKey={selected} />}
    </div>
  );
}
