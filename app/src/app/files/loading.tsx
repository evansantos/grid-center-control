export default function FilesLoading() {
  return (
    <div className="flex h-[calc(100vh-60px)]" style={{ background: 'var(--grid-bg)' }}>
      <div className="w-72 border-r p-4 space-y-3" style={{ borderColor: 'var(--grid-border)', background: 'var(--grid-surface)' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-5 rounded animate-pulse" style={{ background: 'var(--grid-border)', width: `${60 + Math.random() * 30}%` }} />
        ))}
      </div>
      <div className="flex-1 p-6 space-y-4">
        <div className="h-6 w-48 rounded animate-pulse" style={{ background: 'var(--grid-border)' }} />
        <div className="h-4 w-32 rounded animate-pulse" style={{ background: 'var(--grid-border)' }} />
        <div className="h-[60vh] rounded animate-pulse" style={{ background: 'var(--grid-border)', opacity: 0.3 }} />
      </div>
    </div>
  );
}
