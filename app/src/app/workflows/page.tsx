import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const WorkflowsClient = dynamic(
  () => import('./client').then(mod => ({ default: mod.WorkflowsClient })),
  { 
    loading: () => <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-64 w-full" />
    </div>
  }
);

export default function WorkflowsPage() {
  return <WorkflowsClient />;
}