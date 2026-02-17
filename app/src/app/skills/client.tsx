'use client';

import { useState, useEffect } from 'react';

interface SkillInfo {
  name: string;
  description: string;
  path: string;
  source: 'global' | 'agent';
  agent?: string;
  enabled: boolean;
}

export function SkillsManager() {
  const [skills, setSkills] = useState<SkillInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [toggleState, setToggleState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/skills')
      .then(r => r.json())
      .then(data => {
        const s = data.skills || [];
        setSkills(s);
        const initial: Record<string, boolean> = {};
        s.forEach((sk: SkillInfo) => { initial[sk.path] = sk.enabled; });
        setToggleState(initial);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = skills.filter(s =>
    s.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-xl font-bold tracking-wide" style={{ color: 'var(--grid-text)' }}>
          ⚙ Skills Manager
        </h1>
        <input
          type="text"
          placeholder="Filter skills..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-md outline-none w-56"
          style={{
            background: 'var(--grid-surface)',
            border: '1px solid var(--grid-border)',
            color: 'var(--grid-text)',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--grid-border-bright)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--grid-border)'; }}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-lg p-4 animate-pulse" style={{ background: 'var(--grid-surface)', border: '1px solid var(--grid-border)', height: 140 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--grid-text-muted)' }}>
          <div className="text-3xl mb-2">⚙</div>
          <div className="text-sm">
            {filter ? 'No skills match your filter.' : 'No skills found.'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(skill => {
            const enabled = toggleState[skill.path] ?? true;
            return (
              <div
                key={skill.path}
                className="rounded-lg p-4 transition-colors"
                style={{
                  background: 'var(--grid-surface)',
                  border: '1px solid var(--grid-border)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--grid-border-bright)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--grid-border)'; }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-semibold text-sm" style={{ color: 'var(--grid-text)' }}>
                    {skill.name}
                  </div>
                  <button
                    onClick={() => setToggleState(prev => ({ ...prev, [skill.path]: !enabled }))}
                    className="shrink-0 w-8 h-4 rounded-full relative transition-colors"
                    style={{
                      background: enabled ? 'var(--grid-accent)' : 'var(--grid-border)',
                    }}
                    title={enabled ? 'Enabled' : 'Disabled'}
                  >
                    <span
                      className="absolute top-0.5 w-3 h-3 rounded-full transition-all"
                      style={{
                        background: 'var(--grid-text)',
                        left: enabled ? 16 : 2,
                      }}
                    />
                  </button>
                </div>
                <div className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--grid-text-dim)' }}>
                  {skill.description}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider"
                    style={{
                      background: skill.source === 'global' ? 'var(--grid-accent)' : 'var(--grid-border-bright)',
                      color: skill.source === 'global' ? 'var(--grid-surface)' : 'var(--grid-text-dim)',
                    }}
                  >
                    {skill.source}
                  </span>
                  {skill.agent && (
                    <span className="text-[10px]" style={{ color: 'var(--grid-text-muted)' }}>
                      {skill.agent}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
