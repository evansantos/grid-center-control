'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { LivingOffice } from '@/components/living-office';

interface AgentInfo {
  id: string;
  name: string;
  emoji: string;
  role: string;
  model: string;
  activeSessions: { sessionKey: string; label?: string; lastMessage?: string; updatedAt?: string; messageCount: number }[];
}

type ViewMode = 'office' | 'list';
type FilterStatus = 'all' | 'active' | 'idle';

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [view, setView] = useState<ViewMode>('office');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/agents');
      const data = await res.json();
      setAgents(data.agents ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchAgents();
    const iv = setInterval(fetchAgents, 10_000);
    return () => clearInterval(iv);
  }, [fetchAgents]);

  const filteredAgents = agents.filter(a => {
    if (filter === 'active' && a.activeSessions.length === 0) return false;
    if (filter === 'idle' && a.activeSessions.length > 0) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeCount = agents.filter(a => a.activeSessions.length > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-wide">Team HQ</h1>
          <p className="text-xs text-zinc-600 mt-1">{agents.length} agents • {activeCount} with recent sessions</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex border border-zinc-800 rounded-md overflow-hidden">
            <button
              onClick={() => setView('office')}
              className={`text-xs px-3 py-1.5 transition-colors ${
                view === 'office' ? 'bg-red-500/10 text-red-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >🏢 Office</button>
            <button
              onClick={() => setView('list')}
              className={`text-xs px-3 py-1.5 transition-colors border-l border-zinc-800 ${
                view === 'list' ? 'bg-red-500/10 text-red-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >📋 List</button>
          </div>
        </div>
      </div>

      {view === 'office' ? (
        <LivingOffice />
      ) : (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-red-500/50 w-48"
            />
            <div className="flex gap-1">
              {(['all', 'active', 'idle'] as FilterStatus[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-md transition-colors capitalize ${
                    filter === f ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >{f}</button>
              ))}
            </div>
          </div>

          {/* Agent cards */}
          <div className="grid gap-3">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors bg-zinc-900/30"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{agent.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-base">{agent.name}</span>
                      <span className="text-xs text-zinc-600 font-mono">{agent.id}</span>
                      {agent.activeSessions.length > 0 && (
                        <span className="text-[10px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">
                          {agent.activeSessions.length} session{agent.activeSessions.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {agent.role && <p className="text-xs text-zinc-500 mb-2">{agent.role}</p>}
                    {agent.model && <p className="text-[10px] text-zinc-700 font-mono mb-2">Model: {agent.model}</p>}

                    {/* Sessions */}
                    {agent.activeSessions.length > 0 && (
                      <div className="space-y-1.5 mt-2">
                        <div className="text-[10px] text-zinc-600 uppercase font-bold">Recent Sessions</div>
                        {agent.activeSessions.slice(0, 3).map((sess) => (
                          <div key={sess.sessionKey} className="text-xs border-l-2 border-zinc-700 pl-2 py-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500 font-mono truncate">{sess.sessionKey.slice(0, 20)}</span>
                              <span className="text-zinc-600">{sess.messageCount} msgs</span>
                              {sess.updatedAt && <span className="text-zinc-700">{timeAgo(sess.updatedAt)}</span>}
                            </div>
                            {sess.lastMessage && (
                              <div className="text-zinc-600 truncate mt-0.5">{sess.lastMessage.slice(0, 120)}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredAgents.length === 0 && (
              <div className="text-center py-10 text-zinc-600 text-sm">No agents match your filter</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
