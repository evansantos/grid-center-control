'use client';

export function VisitorIndicator() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        right: 24,
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      {/* Avatar with green dot */}
      <div style={{ position: 'relative', fontSize: 20, lineHeight: 1 }}>
        👤
        {/* Green online dot */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: -2,
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#22c55e',
            border: '2px solid #0e0e14',
            boxShadow: '0 0 6px #22c55e',
          }}
        />
      </div>
      {/* Label */}
      <div
        style={{
          fontSize: 7,
          fontFamily: 'monospace',
          color: '#94a3b8',
          marginTop: 2,
          textShadow: '0 1px 3px rgba(0,0,0,0.9)',
        }}
      >
        You
      </div>
    </div>
  );
}
