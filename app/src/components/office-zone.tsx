'use client';

import AgentCard from './agent-card';
import { useIsMobile } from '@/lib/useMediaQuery';

interface Agent {
  name: string;
  role: string;
  status: 'active' | 'idle' | 'busy';
}

interface OfficeZoneProps {
  name: string;
  icon: string;
  description: string;
  agents: Agent[];
  accentColor: string;
}

export default function OfficeZone({ name, icon, description, agents, accentColor }: OfficeZoneProps) {
  const isMobile = useIsMobile();
  
  return (
    <section
      style={{
        background: `${accentColor}08`,
        border: `1px solid ${accentColor}22`,
        borderRadius: '12px',
        padding: '24px',
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '20px' }}>{icon}</span>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{name}</h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--grid-text-dim)', margin: 0 }}>{description}</p>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '12px',
        }}
      >
        {agents.map((agent) => (
          <AgentCard key={agent.name} {...agent} />
        ))}
      </div>
    </section>
  );
}