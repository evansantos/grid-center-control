import type { ActivityItem } from './types';
import { AGENTS } from './types';

/* ── Isometric Desk ── */
export function IsoDesk({ active }: { active: boolean }) {
  return (
    <div style={{
      width: 50,
      height: 16,
      position: 'relative',
      marginTop: 2,
    }}>
      <div style={{
        width: 50,
        height: 8,
        background: active
          ? 'linear-gradient(90deg, #92400e, #78350f)'
          : 'linear-gradient(90deg, #57534e, #44403c)',
        borderRadius: 3,
        border: '1px solid #78350f',
        transform: 'perspective(100px) rotateX(15deg)',
      }} />
      <div style={{
        position: 'absolute',
        top: -12,
        left: 14,
        width: 22,
        height: 14,
        background: active ? 'var(--grid-bg)' : '#1a1a2e',
        borderRadius: 2,
        border: `1px solid ${active ? '#22c55e30' : '#27272a'}`,
        boxShadow: active ? '0 0 8px #22c55e20' : undefined,
      }}>
        {active && (
          <div style={{
            position: 'absolute',
            bottom: 2,
            left: 3,
            display: 'flex',
            gap: 2,
          }}>
            {['#22c55e', '#3b82f6', '#f97316'].map((cl, i) => (
              <div key={i} style={{ width: 2, height: 3 + i, background: cl, borderRadius: 1 }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Zone Label ── */
export function ZoneLabel({ x, y, label, icon }: { x: number; y: number; label: string; icon: string }) {
  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      fontSize: 10,
      fontFamily: 'monospace',
      color: 'var(--grid-text-muted)',
      letterSpacing: 2,
      textTransform: 'uppercase',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    }}>
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

/* ── Zone Floor ── */
export function ZoneFloor({ x, y, w, h, tint }: { x: number; y: number; w: number; h: number; tint: string }) {
  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      background: tint,
      borderRadius: 8,
      border: '1px dashed rgba(255,255,255,0.04)',
      pointerEvents: 'none',
    }} />
  );
}

/* ── Decorative Furniture ── */
export function Plant({ x, y, size = 'sm' }: { x: number; y: number; size?: 'sm' | 'lg' }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, pointerEvents: 'none',
      fontSize: size === 'lg' ? 18 : 12,
    }}>
      🌿
    </div>
  );
}

export function CoffeeMachine({ x, y }: { x: number; y: number }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, pointerEvents: 'none',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 16 }}>☕</div>
      <div style={{ fontSize: 7, fontFamily: 'monospace', color: 'var(--grid-text-secondary)', marginTop: 1 }}>COFFEE</div>
    </div>
  );
}

/* ── Whiteboard ── */
export function Whiteboard() {
  return (
    <>
      <div style={{
        position: 'absolute',
        left: 700,
        top: 210,
        width: 70,
        height: 45,
        background: '#e5e7eb',
        borderRadius: 3,
        border: '2px solid #cbd5e1',
        padding: 4,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        pointerEvents: 'none',
      }}>
        {['#fef08a','#fbcfe8','#a5f3fc','#bbf7d0','#fecaca'].map((c, i) => (
          <div key={i} style={{ width: 8, height: 8, background: c, borderRadius: 1 }} />
        ))}
      </div>
      <div style={{
        position: 'absolute', left: 705, top: 258,
        fontSize: 7, fontFamily: 'monospace', color: 'var(--grid-text-secondary)', pointerEvents: 'none',
      }}>Mood Board</div>
    </>
  );
}

/* ── Metrics Bar ── */
export function MetricsBar({ activity }: { activity: Record<string, ActivityItem> }) {
  const items = Object.values(activity);
  const activeCount = items.filter(a => a.status === 'active').length;
  const totalMessages = items.reduce((sum, a) => sum + (a.messageCount || 0), 0);

  return (
    <div style={{
      display: 'flex',
      gap: 20,
      justifyContent: 'center',
      padding: '8px 16px',
      marginBottom: 12,
      fontFamily: 'monospace',
      fontSize: 12,
      color: 'var(--grid-text-label)',
    }}>
      <span>
        <span style={{ color: 'var(--grid-success)', fontWeight: 700 }}>● {activeCount}</span> active
      </span>
      <span>
        <span style={{ color: 'var(--grid-purple)', fontWeight: 700 }}>💬 {totalMessages}</span> messages
      </span>
      <span>
        <span style={{ color: 'var(--grid-text-secondary)' }}>{AGENTS.length}</span> agents
      </span>
    </div>
  );
}
