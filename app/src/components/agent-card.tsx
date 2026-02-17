'use client';

type AgentStatus = 'active' | 'idle' | 'busy' | 'error';

interface AgentCardProps {
  name: string;
  role: string;
  status: AgentStatus;
  activity?: string;
  onClick?: () => void;
}

const statusConfig: Record<AgentStatus, { color: string; label: string; className: string }> = {
  active: { color: 'var(--grid-success, #22c55e)', label: 'Active', className: 'status-dot active' },
  idle: { color: 'var(--grid-text-muted, #44445a)', label: 'Idle', className: 'status-dot idle' },
  busy: { color: 'var(--grid-warning, #f59e0b)', label: 'Busy', className: 'status-dot busy' },
  error: { color: 'var(--grid-error, #ef4444)', label: 'Error', className: 'status-dot error' },
};

export default function AgentCard({ name, role, status, activity, onClick }: AgentCardProps) {
  const cfg = statusConfig[status];

  return (
    <div
      onClick={onClick}
      className="grid-card p-4 flex items-center gap-3 cursor-pointer group transition-all duration-200 hover:scale-[1.02]"
      style={{
        borderLeft: `3px solid ${cfg.color}`,
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300"
        style={{
          background: `${cfg.color}22`,
          color: cfg.color,
          boxShadow: status === 'active' ? `0 0 12px ${cfg.color}44` : 'none',
        }}
      >
        {name.slice(0, 3)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm" style={{ color: 'var(--grid-text)' }}>{name}</div>
        <div className="text-xs truncate" style={{ color: 'var(--grid-text-dim)' }}>
          {activity || role}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <div className={cfg.className} />
        <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--grid-text-dim)' }}>
          {cfg.label}
        </span>
      </div>
    </div>
  );
}
