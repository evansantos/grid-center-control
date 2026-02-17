'use client';

type AgentStatus = 'active' | 'idle' | 'busy';

interface AgentCardProps {
  name: string;
  role: string;
  status: AgentStatus;
}

const statusColors: Record<AgentStatus, string> = {
  active: '#22c55e',
  idle: '#eab308',
  busy: '#ef4444',
};

export default function AgentCard({ name, role, status }: AgentCardProps) {
  return (
    <div
      style={{
        background: 'var(--grid-surface)',
        border: '1px solid var(--grid-border)',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'var(--grid-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 700,
          color: 'var(--grid-text)',
          flexShrink: 0,
        }}
      >
        {name}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '14px' }}>{name}</div>
        <div style={{ fontSize: '12px', color: 'var(--grid-text-dim)' }}>{role}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: statusColors[status],
          }}
        />
        <span style={{ fontSize: '11px', color: 'var(--grid-text-dim)', textTransform: 'capitalize' }}>
          {status}
        </span>
      </div>
    </div>
  );
}
