'use client';

import { useState } from 'react';

interface Props {
  onSave: (rule: { name: string; condition: string; action: string }) => void;
  onCancel: () => void;
}

const conditionTypes = ['Error Duration', 'Cost Threshold', 'Idle Duration', 'Failure Count'];
const actionTypes = ['Notify', 'Alert', 'Log', 'Pause Agent'];

const inputStyle: React.CSSProperties = {
  background: 'var(--grid-bg)',
  border: '1px solid var(--grid-border)',
  borderRadius: 6,
  padding: '8px 10px',
  color: 'var(--grid-text)',
  fontSize: '13px',
  fontFamily: 'inherit',
  width: '100%',
};

export default function EscalationRuleForm({ onSave, onCancel }: Props) {
  const [name, setName] = useState('');
  const [conditionType, setConditionType] = useState(conditionTypes[0]);
  const [threshold, setThreshold] = useState('');
  const [actionType, setActionType] = useState(actionTypes[0]);

  const handleSave = () => {
    if (!name.trim() || !threshold.trim()) return;
    onSave({
      name: name.trim(),
      condition: `${conditionType} > ${threshold}`,
      action: actionType,
    });
  };

  return (
    <div
      style={{
        background: 'var(--grid-surface)',
        border: '1px solid var(--grid-accent)',
        borderRadius: 8,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>New Escalation Rule</div>
      <input placeholder="Rule name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <select value={conditionType} onChange={(e) => setConditionType(e.target.value)} style={inputStyle}>
          {conditionTypes.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input placeholder="Threshold" value={threshold} onChange={(e) => setThreshold(e.target.value)} style={inputStyle} />
      </div>
      <select value={actionType} onChange={(e) => setActionType(e.target.value)} style={inputStyle}>
        {actionTypes.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{
            background: 'var(--grid-border)',
            color: 'var(--grid-text)',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            background: 'var(--grid-accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
