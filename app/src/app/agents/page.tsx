import Link from 'next/link';

const SAMPLE_AGENTS = [
  { name: 'po', role: 'Project Orchestrator' },
  { name: 'dev', role: 'Developer' },
  { name: 'qa', role: 'Quality Assurance' },
  { name: 'ui', role: 'UI Designer' },
];

export default function AgentsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-wide mb-2" style={{ color: 'var(--grid-text)' }}>
          Agents
        </h1>
        <p className="text-sm" style={{ color: 'var(--grid-text-dim)' }}>
          Manage your development agents and their configurations
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_AGENTS.map((agent) => (
          <div
            key={agent.name}
            className="p-6 rounded-lg border"
            style={{
              background: 'var(--grid-surface)',
              borderColor: 'var(--grid-border)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg" style={{ color: 'var(--grid-text)' }}>
                  {agent.name}
                </h3>
                <p className="text-sm" style={{ color: 'var(--grid-text-dim)' }}>
                  {agent.role}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" 
                style={{ 
                  background: 'var(--grid-accent)20',
                  color: 'var(--grid-accent)'
                }}>
                {agent.name.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div className="space-y-2">
              <Link
                href={`/agents/${agent.name}/config`}
                className="block w-full text-center py-2 px-4 text-sm rounded border hover:opacity-80 transition-opacity"
                style={{
                  borderColor: 'var(--grid-border)',
                  color: 'var(--grid-text)',
                }}
              >
                Configure
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div 
        className="p-4 rounded-lg border-dashed"
        style={{ 
          borderColor: 'var(--grid-border)',
          background: 'var(--grid-surface)20'
        }}
      >
        <p className="text-center text-sm" style={{ color: 'var(--grid-text-dim)' }}>
          <strong>Note:</strong> This is a demo page showing sample agents. In a real implementation, 
          this would dynamically list agents from your OpenClaw configuration.
        </p>
      </div>
    </div>
  );
}