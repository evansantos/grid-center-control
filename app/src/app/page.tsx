import { listProjects, taskStats } from '@/lib/queries';
import { DashboardStats } from '@/components/dashboard-stats';
import { ActivityFeed } from '@/components/activity-feed';
import { DashboardGrid } from '@/components/dashboard-grid';
import { ProjectsWidget } from '@/components/widgets/projects-widget';
import { QuickStatsWidget } from '@/components/widgets/quick-stats-widget';
import { RecentActivityWidget } from '@/components/widgets/recent-activity-widget';

export const dynamic = 'force-dynamic';

export default function Home() {
  const projects = listProjects();
  const projectRows = projects.map((p) => ({
    id: p.id,
    name: p.name,
    phase: p.phase,
    repo_path: p.repo_path,
    updated_at: p.updated_at,
    stats: taskStats(p.id),
  }));

  return (
    <div>
      <DashboardStats />
      <DashboardGrid>
        {{
          'projects': <ProjectsWidget projects={projectRows} />,
          'quick-stats': <QuickStatsWidget projectCount={projects.length} />,
          'recent-activity': <RecentActivityWidget />,
        }}
      </DashboardGrid>
    </div>
  );
}
