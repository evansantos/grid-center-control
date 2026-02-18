'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getAgentDisplay } from '@/lib/agent-meta';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

const ROLE_VARIANTS: Record<string, 'info' | 'success' | 'warning' | 'default'> = {
  user: 'info',
  assistant: 'success', 
  tool: 'warning',
  system: 'default',
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
      <Input
        type="text"
        variant="search"
        size="lg"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search across all agent logs..."
      />

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div>
          <label className="text-xs text-grid-text-muted mr-2">Agent:</label>
          <select
            value={agent}
            onChange={e => setAgent(e.target.value)}
            className="bg-grid-surface border border-grid-border rounded px-2 py-1 text-xs text-grid-text"
          >
            <option value="">All</option>
            {['mcp','grid','dev','arch','bug','sentinel','pixel','scribe','spec','sage','atlas','riff','vault'].map(a => {
              const d = getAgentDisplay(a);
              return <option key={a} value={a}>{d.emoji} {d.name}</option>;
            })}
          </select>
        </div>
        <div>
          <label className="text-xs text-grid-text-muted mr-2">Time:</label>
          <div className="inline-flex gap-1">
            {TIME_RANGES.map(t => (
              <button
                key={t.value}
                onClick={() => setHours(t.value)}
                className={cn(
                  "px-2 py-0.5 text-xs rounded transition-colors",
                  hours === t.value 
                    ? 'bg-grid-accent text-white' 
                    : 'bg-grid-surface text-grid-text-muted hover:bg-grid-surface border border-grid-border'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results info */}
      {data && (
        <div className="text-xs text-grid-text-muted">
          {data.count} results in {data.searchTimeMs}ms
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 bg-grid-surface/50 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !data && !query && (
        <div className="text-center py-16 text-grid-text-muted">
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
            const roleVariant = ROLE_VARIANTS[result.role] || ROLE_VARIANTS.system;

            return (
              <div
                key={`${result.sessionKey}-${result.timestamp}-${idx}`}
                onClick={() => setExpandedIdx(expanded ? null : idx)}
                className="bg-grid-surface/50 border border-grid-border rounded-lg p-3 cursor-pointer hover:border-grid-border-hover transition-colors"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span>{agentInfo.emoji}</span>
                  <span className="text-xs font-bold text-grid-text">{agentInfo.name}</span>
                  <Badge variant={roleVariant} size="sm">{result.role}</Badge>
                  <span className="text-[10px] text-grid-text-muted font-mono ml-auto">
                    {result.timestamp ? new Date(result.timestamp).toLocaleString() : ''}
                  </span>
                </div>
                <p className="text-xs text-grid-text-dim font-mono">
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
