'use client';

import { useState, useEffect, useCallback, useRef, KeyboardEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusDot } from '@/components/ui/status-dot';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface SubagentInfo {
  sessionKey: string;
  agentId: string;
  status: 'running' | 'completed' | 'error' | 'unknown';
  parentSession: string | null;
  task: string;
  runtime: number;
  startedAt: string;
  children: SubagentInfo[];
}

const STATUS_MAPPING: Record<string, 'active' | 'idle' | 'error' | 'busy' | 'offline'> = {
  running: 'active',
  completed: 'idle',
  error: 'error',
  unknown: 'busy',
};

function formatRuntime(sec: number): string {
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ${sec % 60}s`;
  return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m`;
}

interface TreeNodeProps {
  agent: SubagentInfo;
  depth?: number;
  isSelected?: boolean;
  onSelect?: () => void;
  onKeyDown?: (e: KeyboardEvent) => void;
}

function TreeNode({ agent, depth = 0, isSelected, onSelect, onKeyDown }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const [steering, setSteering] = useState(false);
  const [steerMsg, setSteerMsg] = useState('');
  const [confirmKill, setConfirmKill] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleSteer = async () => {
    if (!steerMsg.trim()) return;
    try {
      const response = await fetch('/api/subagents/steer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionKey: agent.sessionKey, message: steerMsg }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      setSteerMsg('');
      setSteering(false);
    } catch {
      setError('Failed to steer agent');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleKill = async () => {
    try {
      const response = await fetch('/api/subagents/kill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionKey: agent.sessionKey }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      setConfirmKill(false);
    } catch {
      setError('Failed to kill agent');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleNodeKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.();
    } else if (e.key === 'ArrowLeft' && expanded && agent.children.length > 0) {
      setExpanded(false);
    } else if (e.key === 'ArrowRight' && !expanded && agent.children.length > 0) {
      setExpanded(true);
    }
    onKeyDown?.(e);
  };

  return (
    <div className={depth > 0 ? 'ml-6 border-l border-grid-border pl-4' : ''}>
      <Card 
        ref={nodeRef}
        className={`group transition-colors cursor-pointer ${
          isSelected ? 'ring-2 ring-grid-accent' : 'hover:bg-grid-surface/50'
        }`}
        onClick={onSelect}
        onKeyDown={handleNodeKeyDown}
        tabIndex={0}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {agent.children.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                className="h-6 w-6 p-0 text-grid-text-muted hover:text-grid-text"
              >
                {expanded ? '▼' : '▶'}
              </Button>
            )}
            {agent.children.length === 0 && <div className="w-6" />}

            <StatusDot 
              status={STATUS_MAPPING[agent.status] || 'busy'} 
              className="mt-1"
            />

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="default" className="font-mono">
                  {agent.agentId}
                </Badge>
                <Badge variant="outline" className="font-mono text-xs">
                  {agent.sessionKey.slice(-12)}
                </Badge>
                <Badge variant="default" className="text-xs">
                  {formatRuntime(agent.runtime)}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`text-xs capitalize ${
                    agent.status === 'running' ? 'text-green-500 border-green-500' :
                    agent.status === 'completed' ? 'text-blue-500 border-blue-500' :
                    agent.status === 'error' ? 'text-red-500 border-red-500' :
                    'text-gray-500 border-gray-500'
                  }`}
                >
                  {agent.status}
                </Badge>
              </div>
              <p className="text-sm text-grid-text-muted line-clamp-2">
                {agent.task || 'No task information available'}
              </p>

              {steering && (
                <div className="flex gap-2 mt-3">
                  <Input
                    value={steerMsg}
                    onChange={e => setSteerMsg(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSteer();
                      } else if (e.key === 'Escape') {
                        setSteering(false);
                      }
                    }}
                    placeholder="Enter steering message..."
                    size="sm"
                    autoFocus
                    aria-label="Steering message"
                  />
                  <Button onClick={handleSteer} size="sm" disabled={!steerMsg.trim()}>
                    Send
                  </Button>
                  <Button onClick={() => setSteering(false)} variant="ghost" size="sm">
                    ✕
                  </Button>
                </div>
              )}

              {confirmKill && (
                <div className="flex items-center gap-3 mt-3 p-2 rounded bg-red-500/10 border border-red-500/20">
                  <span className="text-sm text-red-400 flex-1">
                    Are you sure you want to kill this agent?
                  </span>
                  <Button onClick={handleKill} size="sm" variant="danger">
                    Confirm
                  </Button>
                  <Button onClick={() => setConfirmKill(false)} variant="ghost" size="sm">
                    Cancel
                  </Button>
                </div>
              )}

              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20 mt-2">
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setSteering(!steering);
                }}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                💬 Steer
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmKill(true);
                }}
                variant="ghost"
                size="sm"
                className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                ⛔ Kill
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {expanded && agent.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {agent.children.map(child => (
            <TreeNode key={child.sessionKey} agent={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SubagentTree() {
  const [agents, setAgents] = useState<SubagentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAgents = useCallback(async () => {
    const wasRefreshing = !loading;
    if (wasRefreshing) setRefreshing(true);
    
    try {
      const res = await fetch('/api/subagents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading]);

  const handleRefresh = () => {
    fetchAgents();
  };

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 15_000);
    return () => clearInterval(interval);
  }, [fetchAgents]);

  const handleGlobalKeyDown = useCallback((e: Event) => {
    const keyEvent = e as unknown as KeyboardEvent;
    // Global keyboard shortcuts
    if (keyEvent.key === 'r' && (keyEvent.metaKey || keyEvent.ctrlKey)) {
      keyEvent.preventDefault();
      handleRefresh();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="space-y-4">
            <p className="text-6xl">🌳</p>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-grid-text">No Active Sub-Agents</h3>
              <p className="text-sm text-grid-text-muted">
                Sub-agents will appear here when they are spawned
              </p>
            </div>
            <Button onClick={handleRefresh} variant="secondary" size="sm">
              🔄 Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-medium">
            {agents.length} Active Agent{agents.length !== 1 ? 's' : ''}
          </h2>
          <Badge variant="outline" className="text-xs">
            Auto-refresh: 15s
          </Badge>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="secondary" 
          size="sm"
          disabled={refreshing}
        >
          {refreshing ? '🔄' : '↻'} Refresh
        </Button>
      </div>
      
      <div className="space-y-3" role="tree" aria-label="Agent hierarchy">
        {agents.map(agent => (
          <TreeNode 
            key={agent.sessionKey} 
            agent={agent} 
            isSelected={selectedAgent === agent.sessionKey}
            onSelect={() => setSelectedAgent(agent.sessionKey === selectedAgent ? null : agent.sessionKey)}
          />
        ))}
      </div>

      <div className="text-xs text-grid-text-muted text-center p-2 border-t border-grid-border">
        💡 Tip: Use Ctrl+R to refresh, arrow keys to navigate, Enter to select
      </div>
    </div>
  );
}
