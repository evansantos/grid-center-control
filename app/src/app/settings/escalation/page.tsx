'use client';

import { useState, useEffect } from 'react';
import EscalationRuleCard, { type EscalationRule } from '@/components/escalation-rule-card';
import EscalationRuleForm from '@/components/escalation-rule-form';

const STORAGE_KEY = 'grid-escalation-rules';

const defaultRules: EscalationRule[] = [
  { id: '1', name: 'Error Timeout', condition: 'Agent in error state > 5 min', action: 'Send notification', enabled: true },
  { id: '2', name: 'High Cost Alert', condition: 'Daily cost > $50', action: 'Send alert', enabled: true },
  { id: '3', name: 'Idle Agent', condition: 'Agent idle > 30 min', action: 'Log warning', enabled: false },
  { id: '4', name: 'Task Failure', condition: 'Task fails 3 times', action: 'Pause agent', enabled: true },
];

function loadRules(): EscalationRule[] {
  if (typeof window === 'undefined') return defaultRules;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultRules;
  } catch {
    return defaultRules;
  }
}

export default function EscalationPage() {
  const [rules, setRules] = useState<EscalationRule[]>(defaultRules);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setRules(loadRules());
  }, []);

  const persist = (updated: EscalationRule[]) => {
    setRules(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const toggle = (id: string) => {
    persist(rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const remove = (id: string) => {
    persist(rules.filter((r) => r.id !== id));
  };

  const add = (data: { name: string; condition: string; action: string }) => {
    persist([...rules, { ...data, id: Date.now().toString(), enabled: true }]);
    setShowForm(false);
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>⚡ Escalation Rules</h1>
      <p style={{ color: 'var(--grid-text-dim)', fontSize: '14px', marginBottom: '24px' }}>
        Auto-escalation rules for agent monitoring.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        {rules.map((rule) => (
          <EscalationRuleCard key={rule.id} rule={rule} onToggle={toggle} onDelete={remove} />
        ))}
      </div>
      {showForm ? (
        <EscalationRuleForm onSave={add} onCancel={() => setShowForm(false)} />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: 'var(--grid-surface)',
            border: '1px dashed var(--grid-border)',
            borderRadius: 8,
            padding: '12px',
            color: 'var(--grid-text-dim)',
            cursor: 'pointer',
            width: '100%',
            fontSize: 13,
            fontFamily: 'inherit',
          }}
        >
          + Add Rule
        </button>
      )}

      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--grid-border)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>🎨 Office Theme</h2>
        <p style={{ color: 'var(--grid-text-dim)', fontSize: '13px', marginBottom: '12px' }}>
          Choose a visual theme for the Living Office floor.
        </p>
      </div>

      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--grid-border)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>🔊 Sound Effects</h2>
      </div>

      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--grid-border)' }}>
        <button
          onClick={() => { window.location.href = '/'; }}
          style={{
            background: 'var(--grid-surface)',
            border: '1px solid var(--grid-border)',
            borderRadius: 8,
            padding: '10px 16px',
            color: 'var(--grid-text-dim)',
            cursor: 'pointer',
            fontSize: 13,
            fontFamily: 'inherit',
          }}
        >
          🎓 Replay Onboarding Tour
        </button>
      </div>
    </div>
  );
}
