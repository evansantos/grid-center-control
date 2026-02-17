'use client';

import { useState, useEffect, useCallback } from 'react';

interface ActivityItem {
  agent: string;
  status: 'active' | 'recent' | 'idle';
  timestamp: string;
  messageCount: number;
}

interface AgentDef {
  id: string;
  name: string;
  emoji: string;
  role: string;
  abbr: string;
  color: string;
  skills: string[];
}

interface Department {
  name: string;
  emoji: string;
  color: string;
  agents: AgentDef[];
}

const AGENTS: Record<string, AgentDef> = {
  grid:     { id: 'grid',     name: 'GRID',     emoji: '⚡', role: 'Senior Engineer',   abbr: 'GR', color: 'var(--grid-purple)', skills: ['FULL-STACK DEV', 'CODE REVIEW'] },
  bug:      { id: 'bug',      name: 'BUG',      emoji: '🪲', role: 'QA Engineer',        abbr: 'BG', color: 'var(--grid-success)', skills: ['QA TESTING', 'CODE REVIEW'] },
  sentinel: { id: 'sentinel', name: 'SENTINEL', emoji: '🛡️', role: 'Security Engineer',  abbr: 'SN', color: 'var(--grid-info)', skills: ['SECURITY AUDIT', 'MONITORING'] },
  po:       { id: 'po',       name: 'SPEC',     emoji: '📋', role: 'Product Owner',      abbr: 'SP', color: 'var(--grid-orange)', skills: ['PRODUCT STRATEGY', 'SPRINT PLANNING'] },
  atlas:    { id: 'atlas',    name: 'ATLAS',    emoji: '📊', role: 'Analytics Lead',     abbr: 'AT', color: '#06b6d4', skills: ['ANALYTICS', 'RESEARCH'] },
  sage:     { id: 'sage',     name: 'SAGE',     emoji: '🧠', role: 'Senior Advisor',     abbr: 'SA', color: 'var(--grid-yellow)', skills: ['CAREER STRATEGY', 'ADVISORY'] },
  scribe:   { id: 'scribe',   name: 'SCRIBE',   emoji: '✍️', role: 'Content Writer',     abbr: 'SC', color: '#ec4899', skills: ['CONTENT CREATION', 'TECHNICAL WRITING'] },
  pixel:    { id: 'pixel',    name: 'PIXEL',    emoji: '🎨', role: 'Designer',           abbr: 'PX', color: '#f43f5e', skills: ['DESIGN CONCEPTS', 'UI/UX'] },
  riff:     { id: 'riff',     name: 'RIFF',     emoji: '🎸', role: 'Music Tech',         abbr: 'RF', color: 'var(--grid-danger)', skills: ['MUSIC TECH', 'AUDIO PROCESSING'] },
  vault:    { id: 'vault',    name: 'VAULT',    emoji: '📚', role: 'Knowledge Base',     abbr: 'VT', color: '#10b981', skills: ['KNOWLEDGE BASE', 'DOCUMENTATION'] },
};

const DEPARTMENTS: Department[] = [
  { name: 'ENGINEERING', emoji: '⚙️', color: 'var(--grid-purple)', agents: [AGENTS.grid, AGENTS.bug, AGENTS.sentinel] },
  { name: 'PRODUCT',     emoji: '📋', color: 'var(--grid-orange)', agents: [AGENTS.po] },
  { name: 'RESEARCH',    emoji: '🔬', color: '#06b6d4', agents: [AGENTS.atlas, AGENTS.sage] },
  { name: 'CREATIVE',    emoji: '🎨', color: '#ec4899', agents: [AGENTS.scribe, AGENTS.pixel] },
  { name: 'SPECIALIST',  emoji: '🎸', color: 'var(--grid-danger)', agents: [AGENTS.riff] },
  { name: 'KNOWLEDGE',   emoji: '📚', color: '#10b981', agents: [AGENTS.vault] },
];

interface OrgChartProps {
  onSelectAgent: (agentId: string) => void;
  selectedAgent: string | null;
}

export function OrgChart({ onSelectAgent, selectedAgent }: OrgChartProps) {
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch('/api/activity');
      const data = await res.json();
      setActivity(data.activity ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 5000);
    return () => clearInterval(interval);
  }, [fetchActivity]);

  const statusMap: Record<string, 'active' | 'recent' | 'idle'> = {};
  for (const item of activity) {
    if (item.agent && !statusMap[item.agent]) {
      statusMap[item.agent] = item.status;
    }
  }

  const statusDot = (agentId: string) => {
    const s = statusMap[agentId];
    if (s === 'active') return { bg: 'var(--grid-success)', pulse: true };
    if (s === 'recent') return { bg: 'var(--grid-yellow)', pulse: false };
    return { bg: 'var(--grid-text-faint)', pulse: false };
  };

  return (
    <div style={{ padding: '24px 16px', minHeight: '100%', overflow: 'auto' }}>
      {/* CEO card */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 0 }}>
        <div style={{
          background: 'var(--grid-surface)',
          border: '1px solid var(--grid-border-subtle)',
          borderRadius: 12,
          padding: '16px 32px',
          textAlign: 'center',
          minWidth: 160,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'linear-gradient(135deg, #dc2626, #991b1b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 8px', fontSize: 18, fontWeight: 700, color: '#fff',
          }}>EC</div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--grid-text)' }}>Evan</div>
          <div style={{ fontSize: 11, color: 'var(--grid-text-secondary)', marginTop: 2 }}>CEO</div>
        </div>
      </div>

      {/* Vertical line CEO → MCP */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 1, height: 32, background: 'var(--grid-border-subtle)' }} />
      </div>

      {/* MCP card */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 0 }}>
        <div style={{
          background: 'var(--grid-surface)',
          border: '1px solid var(--grid-border-subtle)',
          borderTop: '2px solid var(--grid-danger)',
          borderRadius: 12,
          padding: '16px 28px',
          textAlign: 'center',
          minWidth: 220,
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 10, right: 10,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--grid-success)',
            boxShadow: '0 0 6px var(--grid-success)',
            animation: 'pulse-dot 1.5s infinite',
          }} />
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, #dc2626, #7f1d1d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 8px', fontSize: 22,
          }}>🔴</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--grid-text)' }}>MCP</div>
          <div style={{ fontSize: 11, color: 'var(--grid-text-label)', marginTop: 2 }}>Chief Strategy Officer</div>
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
            {['STRATEGIC PLANNING', 'TASK ORCHESTRATION'].map(s => (
              <span key={s} style={{
                fontSize: 9, padding: '2px 6px', borderRadius: 4,
                background: 'rgba(220,38,38,0.15)', color: 'var(--grid-error)',
                fontWeight: 600, letterSpacing: 0.3,
              }}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Vertical line MCP → departments */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 1, height: 32, background: 'var(--grid-border-subtle)' }} />
      </div>

      {/* Horizontal connector line */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 0 }}>
        <div style={{ width: '80%', maxWidth: 700, height: 1, background: 'var(--grid-border-subtle)' }} />
      </div>

      {/* Vertical stubs from horizontal line to each department column */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 0,
        maxWidth: 780,
        margin: '0 auto',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 1, height: 24, background: 'var(--grid-border-subtle)' }} />
          </div>
        ))}
      </div>

      {/* Departments grid — 3 columns, 2 rows */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        maxWidth: 780,
        margin: '0 auto',
      }}>
        {DEPARTMENTS.map(dept => (
          <div key={dept.name} style={{
            background: 'var(--grid-surface)',
            border: '1px solid var(--grid-border)',
            borderTop: `2px solid ${dept.color}`,
            borderRadius: 10,
            padding: 12,
          }}>
            {/* Department header */}
            <div style={{
              fontSize: 11, fontWeight: 700, color: dept.color,
              marginBottom: 10, letterSpacing: 1, fontFamily: 'monospace',
            }}>
              {dept.emoji} {dept.name}
            </div>

            {/* Agent cards inside department */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dept.agents.map(agent => {
                const dot = statusDot(agent.id);
                const isSelected = selectedAgent === agent.id;
                return (
                  <div
                    key={agent.id}
                    onClick={() => onSelectAgent(agent.id)}
                    style={{
                      background: isSelected ? '#1a1a1a' : '#111',
                      border: `1px solid ${isSelected ? agent.color : '#1e1e1e'}`,
                      borderRadius: 8,
                      padding: '10px 12px',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = agent.color + '80';
                      (e.currentTarget as HTMLDivElement).style.background = '#161616';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = isSelected ? agent.color : '#1e1e1e';
                      (e.currentTarget as HTMLDivElement).style.background = isSelected ? '#1a1a1a' : '#111';
                    }}
                  >
                    {/* Status dot */}
                    <div style={{
                      position: 'absolute', top: 8, right: 8,
                      width: 7, height: 7, borderRadius: '50%',
                      background: dot.bg,
                      ...(dot.pulse ? { boxShadow: `0 0 6px ${dot.bg}`, animation: 'pulse-dot 1.5s infinite' } : {}),
                    }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Avatar circle */}
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${agent.color}, ${agent.color}88)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 800, color: '#fff',
                        flexShrink: 0, letterSpacing: 0.5,
                      }}>{agent.abbr}</div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--grid-text)' }}>{agent.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--grid-text-secondary)', marginTop: 1 }}>{agent.role}</div>
                      </div>
                    </div>

                    {/* Skill tags */}
                    <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                      {agent.skills.map(s => (
                        <span key={s} style={{
                          fontSize: 8, padding: '1px 5px', borderRadius: 3,
                          background: `${agent.color}18`, color: `${agent.color}`,
                          fontWeight: 600, letterSpacing: 0.3,
                        }}>{s}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
