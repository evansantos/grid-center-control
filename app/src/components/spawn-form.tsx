'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface AgentOption {
  id: string;
  emoji: string;
  name: string;
}

interface SpawnResult {
  sessionKey: string;
  agentId: string;
  model: string;
  status: string;
  timestamp: string;
}

interface FormErrors {
  agentId?: string;
  model?: string;
  task?: string;
  timeout?: string;
}

const MODELS = [
  { id: 'default', label: 'Default' },
  { id: 'opus', label: 'Claude Opus' },
  { id: 'sonnet', label: 'Claude Sonnet' },
  { id: 'gpt4o', label: 'GPT-4o' },
];

export function SpawnForm() {
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [agentId, setAgentId] = useState('');
  const [model, setModel] = useState('default');
  const [task, setTask] = useState('');
  const [timeout, setTimeout_] = useState(300);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<SpawnResult | null>(null);
  const [recentSpawns, setRecentSpawns] = useState<SpawnResult[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    fetch('/api/spawn').then(r => r.json()).then(d => {
      setAgents(d.agents || []);
      if (d.agents?.length) setAgentId(d.agents[0].id);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    try {
      const stored = localStorage.getItem('grid-recent-spawns');
      if (stored) setRecentSpawns(JSON.parse(stored));
    } catch {}
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!agentId.trim()) {
      newErrors.agentId = 'Please select an agent';
    }

    if (!model.trim()) {
      newErrors.model = 'Please select a model';
    }

    if (!task.trim()) {
      newErrors.task = 'Please provide a task description';
    } else if (task.trim().length < 10) {
      newErrors.task = 'Task description must be at least 10 characters';
    }

    if (timeout < 30) {
      newErrors.timeout = 'Timeout must be at least 30 seconds';
    } else if (timeout > 3600) {
      newErrors.timeout = 'Timeout cannot exceed 3600 seconds';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setResult(null);
    setErrors({});

    try {
      const res = await fetch('/api/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, model, task, timeoutSeconds: timeout }),
      });
      
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await res.json();
      
      if (data.error) {
        setErrors({ task: data.error });
        return;
      }

      setResult(data);

      const updated = [data, ...recentSpawns].slice(0, 10);
      setRecentSpawns(updated);
      localStorage.setItem('grid-recent-spawns', JSON.stringify(updated));
      setTask('');
    } catch {
      setErrors({ task: 'Failed to spawn agent. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAgent = agents.find(a => a.id === agentId);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🚀 Spawn Agent Session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="flex items-end gap-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-40" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🚀 Spawn Agent Session</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="agent-select" className="text-sm font-medium">
                  Agent
                </label>
                <Select 
                  value={agentId} 
                  onValueChange={setAgentId}
                >
                  <SelectTrigger 
                    id="agent-select"
                    error={errors.agentId}
                    aria-describedby={errors.agentId ? "agent-error" : undefined}
                  >
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.emoji} {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="model-select" className="text-sm font-medium">
                  Model
                </label>
                <Select 
                  value={model} 
                  onValueChange={setModel}
                >
                  <SelectTrigger 
                    id="model-select"
                    error={errors.model}
                    aria-describedby={errors.model ? "model-error" : undefined}
                  >
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS.map(m => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="task-input" className="text-sm font-medium">
                Task Description
              </label>
              <Textarea
                id="task-input"
                value={task}
                onChange={e => setTask(e.target.value)}
                placeholder="Describe the task for the agent..."
                rows={4}
                error={errors.task}
                aria-describedby={errors.task ? "task-error" : undefined}
              />
            </div>

            <div className="flex items-end gap-4">
              <div className="space-y-2">
                <label htmlFor="timeout-input" className="text-sm font-medium">
                  Timeout (seconds)
                </label>
                <Input
                  id="timeout-input"
                  type="number"
                  value={timeout}
                  onChange={e => setTimeout_(Number(e.target.value))}
                  min={30}
                  max={3600}
                  className="w-32"
                  error={errors.timeout}
                  aria-describedby={errors.timeout ? "timeout-error" : undefined}
                />
              </div>
              
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? '⏳ Spawning...' : `🚀 Spawn ${selectedAgent?.name || 'Agent'}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-grid-accent/30 bg-grid-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-grid-accent">
              ✅ Agent Spawned Successfully
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-grid-text-muted">Session Key</span>
                <span className="text-grid-text font-mono block">
                  {result.sessionKey.slice(-20)}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-grid-text-muted">Agent</span>
                <span className="text-grid-text block">{result.agentId}</span>
              </div>
              <div className="space-y-1">
                <span className="text-grid-text-muted">Model</span>
                <span className="text-grid-text block">{result.model}</span>
              </div>
              <div className="space-y-1">
                <span className="text-grid-text-muted">Status</span>
                <span className="text-grid-text block">{result.status}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {recentSpawns.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Recent Spawns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentSpawns.map((spawn, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-3 rounded-md bg-grid-surface border border-grid-border"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-grid-text">
                    {spawn.agentId}
                  </span>
                  <span className="text-xs font-mono text-grid-text-muted">
                    {spawn.sessionKey.slice(-12)}
                  </span>
                </div>
                <span className="text-xs text-grid-text-muted">
                  {new Date(spawn.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
