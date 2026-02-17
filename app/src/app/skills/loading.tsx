export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-wide" style={{ color: 'var(--grid-text)' }}>⚙ Skills Manager</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="rounded-lg p-4 animate-pulse" style={{ background: 'var(--grid-surface)', border: '1px solid var(--grid-border)', height: 140 }} />
        ))}
      </div>
    </div>
  );
}
