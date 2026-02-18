'use client';

import Link from 'next/link';
import { PhaseBadge } from '@/components/phase-badge';

interface ProjectRow {
  id: string;
  name: string;
  phase: string;
  repo_path: string;
  updated_at: string;
  stats: { total: number; approved: number };
}

export function ProjectsWidget({ projects }: { projects: ProjectRow[] }) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-8">
        <p style={{ color: 'var(--grid-text-dim)' }}>No projects yet.</p>
        <p className="text-sm mt-2" style={{ color: 'var(--grid-text-dim)' }}>
          Create one with: <code style={{ color: 'var(--grid-accent)' }}>grid project create --name &quot;...&quot;</code>
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {projects.map((p) => (
        <Link
          key={p.id}
          href={`/project/${p.id}`}
          className="block rounded-lg p-4 transition-colors"
          style={{
            border: '1px solid var(--grid-border)',
            background: 'var(--grid-surface)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--grid-accent)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--grid-border)')}
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold" style={{ color: 'var(--grid-text)' }}>{p.name}</h3>
            <PhaseBadge phase={p.phase} />
          </div>
          <div className="flex gap-4 text-sm" style={{ color: 'var(--grid-text-dim)' }}>
            <span>📁 {p.repo_path}</span>
            {p.stats.total > 0 && <span>✅ {p.stats.approved + (p.stats.in_progress || 0) + (p.stats.review || 0)}/{p.stats.total} tasks</span>}
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--grid-text-dim)', opacity: 0.7 }}>
            Updated {new Date(p.updated_at).toLocaleString()}
          </p>
        </Link>
      ))}
    </div>
  );
}
