export default function KanbanLoading() {
  return (
    <div style={{ padding: '2rem' }}>
      <div
        style={{
          height: 32,
          width: 200,
          borderRadius: 6,
          background: 'var(--grid-surface-hover)',
          marginBottom: '1.5rem',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {Array.from({ length: 4 }).map((_, col) => (
          <div key={col}>
            <div
              style={{
                height: 24,
                width: 120,
                borderRadius: 4,
                background: 'var(--grid-surface-hover)',
                marginBottom: '0.75rem',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
            {Array.from({ length: 3 }).map((_, row) => (
              <div
                key={row}
                style={{
                  height: 80,
                  borderRadius: 8,
                  background: 'var(--grid-surface)',
                  border: '1px solid var(--grid-border)',
                  marginBottom: '0.5rem',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
