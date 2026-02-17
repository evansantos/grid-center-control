import OfficeZone from '../../components/office-zone';

const zones = [
  {
    name: 'Engineering',
    icon: '🔧',
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
    icon: '📊',
    description: 'Strategy, planning, and coordination.',
    accentColor: '#a855f7',
    agents: [
      { name: 'CEO', role: 'Strategic direction', status: 'active' as const },
      { name: 'PM', role: 'Project management', status: 'busy' as const },
      { name: 'PO', role: 'Product ownership', status: 'active' as const },
    ],
  },
];

export default function OfficePage() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>🏢 Office</h1>
      <p style={{ color: 'var(--grid-text-dim)', fontSize: '14px', marginBottom: '32px' }}>
        Agents organized by department and function.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {zones.map((zone) => (
          <OfficeZone key={zone.name} {...zone} />
        ))}
      </div>
    </div>
  );
}
