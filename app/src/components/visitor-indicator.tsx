'use client';

export function VisitorIndicator() {
  return (
    <div
      style={{
        position: 'absolute',
        left: 750,
        top: 50,
        zIndex: 20,
        pointerEvents: 'auto',
        cursor: 'default',
        animation: 'visitorBob 3s ease-in-out infinite',
      }}
      title="You (Online)"
    >
      {/* Avatar */}
      <div
        style={{
          fontSize: 20,
          lineHeight: 1,
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))',
        }}
      >
        👤
      </div>

      {/* Green online dot */}
      <div
        style={{
          position: 'absolute',
          right: -2,
          bottom: -2,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#22c55e',
          border: '1.5px solid #0a0a0f',
          boxShadow: '0 0 6px #22c55e80',
        }}
      />

      <style>{`
        @keyframes visitorBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}
