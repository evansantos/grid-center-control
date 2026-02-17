export default function Loading() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-wide" style={{ color: 'var(--grid-text)' }}>✎ Soul Editor</h1>
      <div className="animate-pulse rounded-lg" style={{ background: 'var(--grid-surface)', border: '1px solid var(--grid-border)', height: 500 }} />
    </div>
  );
}
