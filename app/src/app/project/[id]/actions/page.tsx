import { QuickActions } from '@/components/quick-actions';

export default async function ActionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--grid-text)' }}>
        Actions — Project {id}
      </h1>
      <QuickActions />
    </div>
  );
}
