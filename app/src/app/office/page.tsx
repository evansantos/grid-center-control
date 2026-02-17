import OfficeZone from '../../components/office-zone';

const zones = [
  {
    name: 'Engineering',
    icon: '⚡',
    description: 'Design, build, test, and fix — the core dev loop.',
    accentColor: '#3b82f6',
    agents: [
      { name: 'SPEC', role: 'Specification & design', status: 'active' as const },
      { name: 'DEV', role: 'Implementation', status: 'busy' as const },
      { name: 'QA', role: 'Quality assurance & testing', status: 'active' as const },
      { name: 'BUG', role: 'Bug triage & fixing', status: 'idle' as const },
    ],
  },
  {
    name: 'Operations',
    icon: '⚙️',
    description: 'Infrastructure, deployments, and runtime reliability.',
    accentColor: '#f59e0b',
    agents: [
      { name: 'OPS', role: 'Day-to-day operations', status: 'active' as const },
      { name: 'DEVOPS', role: 'CI/CD & automation', status: 'busy' as const },
      { name: 'INFRA', role: 'Infrastructure management', status: 'idle' as const },
    ],
  },
  {
    name: 'Management',
    icon: '🎯',
    description: 'Strategy, planning, and coordination across all teams.',
    accentColor: '#a855f7',
    agents: [
      { name: 'CEO', role: 'Strategic direction', status: 'active' as const },
      { name: 'PM', role: 'Project management', status: 'busy' as const },
      { name: 'PO', role: 'Product ownership', status: 'active' as const },
    ],
  },
  {
    name: 'Creative',
    icon: '🎨',
    description: 'Design, content, and visual identity.',
    accentColor: '#ec4899',
    agents: [
      { name: 'PIXEL', role: 'Lead Designer — UI/UX', status: 'busy' as const },
      { name: 'WRITER', role: 'Content & documentation', status: 'idle' as const },
    ],
  },
  {
    name: 'Support',
    icon: '🛡️',
    description: 'Research, intelligence, and security.',
    accentColor: '#10b981',
    agents: [
      { name: 'SCOUT', role: 'Research & discovery', status: 'active' as const },
      { name: 'GUARD', role: 'Security & compliance', status: 'idle' as const },
    ],
  },
];

export default function OfficePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--grid-text)' }}>
          🏢 Office Zones
        </h1>
        <p className="text-sm" style={{ color: 'var(--grid-text-dim)' }}>
          14 agents organized by department — the MCP <span style={{ color: 'var(--grid-accent)' }}>🔴</span> team.
        </p>
      </div>
      <div className="flex flex-col gap-6">
        {zones.map((zone) => (
          <OfficeZone key={zone.name} {...zone} />
        ))}
      </div>
    </div>
  );
}
