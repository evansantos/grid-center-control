'use client';

import AgentCard from './agent-card';

interface Agent {
  name: string;
  role: string;
  status: 'active' | 'idle' | 'busy' | 'error';
  activity?: string;
}

interface OfficeZoneProps {
  name: string;
  icon: string;
  description: string;
  agents: Agent[];
  accentColor: string;
}

export default function OfficeZone({ name, icon, description, agents, accentColor }: OfficeZoneProps) {
  return (
    <section
      className="rounded-xl p-6 transition-colors duration-200"
      style={{
        background: `${accentColor}06`,
        border: `1px solid ${accentColor}18`,
      }}
    >
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{icon}</span>
          <h2 className="text-lg font-bold" style={{ color: 'var(--grid-text)' }}>{name}</h2>
          <span
            className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-semibold"
            style={{
              background: `${accentColor}18`,
              color: accentColor,
            }}
          >
            {agents.length} agents
          </span>
        </div>
        <p className="text-xs" style={{ color: 'var(--grid-text-dim)' }}>{description}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {agents.map((agent) => (
          <AgentCard key={agent.name} {...agent} />
        ))}
      </div>
    </section>
  );
}
