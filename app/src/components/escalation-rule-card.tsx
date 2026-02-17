'use client';

import { useState } from 'react';

export interface EscalationRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  enabled: boolean;
}

interface Props {
  rule: EscalationRule;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function EscalationRuleCard({ rule, onToggle, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div
      style={{
        background: 'var(--grid-surface)',
        border: '1px solid var(--grid-border)',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        opacity: rule.enabled ? 1 : 0.5,
      }}
    >
      <button
        onClick={() => onToggle(rule.id)}
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          border: 'none',
          background: rule.enabled ? 'var(--grid-accent)' : 'var(--grid-border)',
          cursor: 'pointer',
          position: 'relative',
          flexShrink: 0,
          transition: 'background 0.2s',
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#fff',
            position: 'absolute',
            top: 3,
            left: rule.enabled ? 21 : 3,
            transition: 'left 0.2s',
          }}
        />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{rule.name}</div>
        <div style={{ fontSize: '12px', color: 'var(--grid-text-dim)' }}>
          <span>If: {rule.condition}</span>
          <span style={{ margin: '0 8px' }}>→</span>
          <span>{rule.action}</span>
        </div>
      </div>
      {confirming ? (
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => onDelete(rule.id)}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '4px 8px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            Confirm
          </button>
          <button
            onClick={() => setConfirming(false)}
            style={{
              background: 'var(--grid-border)',
              color: 'var(--grid-text)',
              border: 'none',
              borderRadius: 4,
              padding: '4px 8px',
              fontSize: '11px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--grid-text-dim)',
            cursor: 'pointer',
            fontSize: '16px',
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
