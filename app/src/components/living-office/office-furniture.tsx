'use client';

import { useState, useEffect } from 'react';

export function CoffeeMachine({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
      <div style={{
        width: 22, height: 28, backgroundColor: '#4a4a4a',
        borderRadius: 3, border: '1px solid #666', position: 'relative',
      }}>
        <div style={{
          width: 14, height: 8, backgroundColor: '#2a2a2a',
          borderRadius: 1, position: 'absolute', top: 3, left: 4,
        }} />
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          backgroundColor: '#dc2626', position: 'absolute',
          bottom: 4, left: 8,
          animation: 'ledBlink 3s ease-in-out infinite',
        }} />
      </div>
      <div style={{
        position: 'absolute', top: -10, left: 6,
        fontSize: 12, color: '#ffffff20',
        animation: 'steamRise 3s ease-in-out infinite',
      }}>☁</div>
      <div style={{ fontSize: 7, fontFamily: 'monospace', color: '#64748b', textAlign: 'center', marginTop: 2 }}>☕ COFFEE</div>
    </div>
  );
}

export function WaterCooler({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
      <div style={{
        width: 14, height: 22, backgroundColor: '#7dd3fc',
        borderRadius: '6px 6px 3px 3px', border: '1px solid #38bdf8', opacity: 0.8,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', bottom: 2, left: 4,
          width: 3, height: 3, borderRadius: '50%',
          backgroundColor: '#bae6fd', opacity: 0.6,
          animation: 'bubbleRise 4s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: 2, left: 8,
          width: 2, height: 2, borderRadius: '50%',
          backgroundColor: '#bae6fd', opacity: 0.4,
          animation: 'bubbleRise 4s ease-in-out 1.5s infinite',
        }} />
      </div>
      <div style={{ width: 20, height: 16, backgroundColor: '#e2e8f0', borderRadius: 2, marginTop: 1 }} />
      <div style={{ fontSize: 7, fontFamily: 'monospace', color: '#64748b', textAlign: 'center', marginTop: 2 }}>💧 WATER</div>
    </div>
  );
}

export function Printer({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
      <div style={{
        width: 30, height: 20, backgroundColor: '#64748b',
        borderRadius: 2, border: '1px solid #94a3b8', position: 'relative',
      }}>
        <div style={{
          width: 22, height: 3, backgroundColor: '#f1f5f9',
          position: 'absolute', top: -2, left: 4, borderRadius: 1,
        }} />
        <div style={{
          width: 5, height: 5, borderRadius: '50%',
          backgroundColor: '#22c55e', position: 'absolute',
          top: 6, right: 4,
          animation: 'ledBlink 4s ease-in-out infinite',
        }} />
      </div>
      <div style={{ fontSize: 7, fontFamily: 'monospace', color: '#64748b', textAlign: 'center', marginTop: 2 }}>🖨️ PRINT</div>
    </div>
  );
}

export function Plant({ x, y, large }: { x: number; y: number; large?: boolean }) {
  if (large) {
    return (
      <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#15803d', position: 'absolute', left: 0, top: 0 }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#166534', position: 'absolute', left: 8, top: -3 }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#14532d', position: 'absolute', left: 4, top: 4 }} />
          <div style={{ width: 10, height: 10, backgroundColor: '#78350f', borderRadius: 2, position: 'absolute', left: 3, top: 14 }} />
        </div>
      </div>
    );
  }
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#15803d', boxShadow: '0 0 4px #15803d40' }} />
      <div style={{ width: 4, height: 6, backgroundColor: '#78350f', borderRadius: '0 0 2px 2px', marginLeft: 3, marginTop: -1 }} />
    </div>
  );
}

export function Whiteboard({ x, y, label }: { x: number; y: number; label?: string }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
      <div style={{
        width: 60, height: 40, backgroundColor: '#e5e7eb',
        borderRadius: 2, border: '2px solid #cbd5e1',
        padding: 4, display: 'flex', flexWrap: 'wrap', gap: 2,
      }}>
        {['#fef08a','#fbcfe8','#a5f3fc','#bbf7d0','#fecaca','#fde68a'].map((c, i) => (
          <div key={i} style={{ width: 8, height: 8, backgroundColor: c, borderRadius: 1 }} />
        ))}
      </div>
      {label && <div style={{ fontSize: 6, fontFamily: 'monospace', color: '#94a3b8', textAlign: 'center', marginTop: 1 }}>{label}</div>}
    </div>
  );
}

export function Bookshelf({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
      <div style={{
        width: 38, height: 42, backgroundColor: '#78350f',
        borderRadius: 2, border: '1px solid #92400e',
        padding: 3, display: 'flex', flexDirection: 'column', gap: 3,
      }}>
        {[0, 1, 2].map(row => (
          <div key={row} style={{ display: 'flex', gap: 1 }}>
            {['#dc2626','#3b82f6','#22c55e','#eab308','#8b5cf6'].map((c, i) => (
              <div key={i} style={{ width: 5, height: 9, backgroundColor: c, borderRadius: 1, opacity: 0.8 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Couch({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
      <div style={{
        width: 80, height: 20, backgroundColor: '#374151',
        borderRadius: '6px 6px 2px 2px', border: '1px solid #4b5563',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', gap: 4, position: 'absolute', top: 3, left: 6 }}>
          <div style={{ width: 30, height: 14, backgroundColor: '#4b5563', borderRadius: 4 }} />
          <div style={{ width: 30, height: 14, backgroundColor: '#4b5563', borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
}

export function ConferenceTable({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
      <div style={{
        width: 80, height: 40, borderRadius: '50%',
        backgroundColor: '#8B7355', border: '2px solid #6b5a3e',
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: -36, padding: '0 6px', position: 'relative', top: -8 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#27272a', border: '1px solid #3f3f46' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0 6px', position: 'relative', top: 2 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#27272a', border: '1px solid #3f3f46' }} />
        ))}
      </div>
      <div style={{ fontSize: 7, fontFamily: 'monospace', color: '#475569', textAlign: 'center', marginTop: 4 }}>CONFERENCE</div>
    </div>
  );
}

export function GuitarStand({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
      <div style={{ width: 10, height: 14, backgroundColor: '#92400e', borderRadius: '50%', border: '1px solid #b45309' }} />
      <div style={{ width: 3, height: 20, backgroundColor: '#78350f', marginLeft: 3, marginTop: -2, borderRadius: 1 }} />
    </div>
  );
}

export function Amp({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
      <div style={{
        width: 20, height: 18, backgroundColor: '#1e293b',
        borderRadius: 2, border: '1px solid #334155', position: 'relative',
      }}>
        <div style={{
          width: 4, height: 4, borderRadius: '50%',
          backgroundColor: '#dc2626', position: 'absolute',
          top: 3, right: 3, animation: 'ledBlink 2s ease-in-out infinite',
        }} />
        <div style={{
          width: 12, height: 8, backgroundColor: '#0f172a',
          borderRadius: 1, margin: '6px auto 0',
        }} />
      </div>
    </div>
  );
}

export function Door({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
      <div style={{
        width: 28, height: 40, backgroundColor: '#78350f',
        borderRadius: '4px 4px 0 0', border: '2px solid #92400e',
        position: 'relative',
      }}>
        <div style={{
          width: 5, height: 5, borderRadius: '50%',
          backgroundColor: '#eab308', position: 'absolute',
          right: 5, top: 18,
        }} />
      </div>
      <div style={{ fontSize: 7, fontFamily: 'monospace', color: '#64748b', textAlign: 'center', marginTop: 1 }}>🚪 ENTRY</div>
    </div>
  );
}

export function Poster({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, pointerEvents: 'none',
      width: 56, height: 36, backgroundColor: '#1a1a2e',
      border: '2px solid #dc262660', borderRadius: 3,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{
        fontSize: 8, fontFamily: 'monospace', fontWeight: 'bold',
        color: '#dc2626', letterSpacing: 1,
        textShadow: '0 0 4px #dc262680',
      }}>{text}</span>
    </div>
  );
}

export function WallClock({ x, y }: { x: number; y: number }) {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    };
    update();
    const iv = setInterval(update, 30000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{
      position: 'absolute', left: x, top: y, pointerEvents: 'none',
      width: 40, height: 18, borderRadius: 3,
      backgroundColor: '#0a0a0f', border: '1px solid #27272a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{
        fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold',
        color: '#dc2626',
        animation: 'colonBlink 1s step-end infinite',
      }}>{time}</span>
    </div>
  );
}
