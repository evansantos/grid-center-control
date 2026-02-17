'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getAgentDisplay } from '@/lib/agent-meta';

interface SearchResult {
  sessionKey: string;
  agentId: string;
  timestamp: string;
  role: string;
  content: string;
  matchHighlight: string;
}

interface SearchResponse {
  results: SearchResult[];
  count: number;
  searchTimeMs: number;
}

const TIME_RANGES = [
  { label: '1h', value: '1' },
  { label: '6h', value: '6' },
  { label: '24h', value: '24' },
  { label: '7d', value: '168' },
  { label: 'All', value: '8760' },
];

const ROLE_COLORS: Record<string, string> = {
  user: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
  assistant: 'bg-green-600/20 text-green-400 border-green-500/30',
  tool: 'bg-orange-600/20 text-orange-400 border-orange-500/30',
  system: 'bg-zinc-600/20 text-zinc-400 border-zinc-500/30',
};

export function LogSearch() {
  const [query, setQuery] = useState('');
  const [agent, setAgent] = useState('');
  const [hours, setHours] = useState('24');
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  const search = useCallback(async (q: string, a: string, h: string) => {
    if (!q.trim()) { setData(null); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, hours: h });
      if (a) params.set('agent', a);
      const res = await fetch(`/api/logs/search?${params}`);
      const result = await res.json();
      setData(result);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query, agent, hours), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, agent, hours, search]);

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search across all agent logs..."
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 pl-10 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
        />
        <span className="absolute left-3 top-3.5 text-zinc-500">🔍</span>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div>
          <label className="text-xs text-zinc-500 mr-2">Agent:</label>
          <select
            value={agent}
            onChange={e => setAgent(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200"
          >
            <option value="">All</option>
            {['mcp','grid','dev','arch','bug','sentinel','pixel','scribe','spec','sage','atlas','riff','vault'].map(a => {
              const d = getAgentDisplay(a);
              return <option key={a} value={a}>{d.emoji} {d.name}</option>;
            })}
          </select>
        </div>
        <div>
          <label className="text-xs text-zinc-500 mr-2">Time:</label>
          <div className="inline-flex gap-1">
            {TIME_RANGES.map(t => (
              <button
                key={t.value}
                onClick={() => setHours(t.value)}
                className={`px-2 py-0.5 text-xs rounded ${hours === t.value ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results info */}
      {data && (
        <div className="text-xs text-zinc-500">
          {data.count} results in {data.searchTimeMs}ms
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 bg-zinc-900/50 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !data && !query && (
        <div className="text-center py-16 text-zinc-600">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">Search across all agent logs</p>
        </div>
      )}

      {/* Results */}
      {!loading && data && (
        <div className="space-y-2">
          {data.results.map((result, idx) => {
            const agentInfo = getAgentDisplay(result.agentId);
            const expanded = expandedIdx === idx;
            const roleClass = ROLE_COLORS[result.role] || ROLE_COLORS.system;

            return (
              <div
                key={`${result.sessionKey}-${result.timestamp}-${idx}`}
                onClick={() => setExpandedIdx(expanded ? null : idx)}
                className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 cursor-pointer hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span>{agentInfo.emoji}</span>
                  <span className="text-xs font-bold text-zinc-300">{agentInfo.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${roleClass}`}>{result.role}</span>
                  <span className="text-[10px] text-zinc-600 font-mono ml-auto">
                    {result.timestamp ? new Date(result.timestamp).toLocaleString() : ''}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-mono">
                  {expanded ? result.content : result.matchHighlight}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
