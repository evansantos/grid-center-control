import type { AgentCfg } from './types';
import { AGENT_MAP } from './types';

/* ── Neon Sign ── */
export function NeonSign({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, pointerEvents: 'none',
      fontSize: 18, fontFamily: 'monospace', fontWeight: 'bold',
      color: '#dc2626', letterSpacing: 6,
      textShadow: '0 0 7px #dc2626, 0 0 10px #dc2626, 0 0 21px #dc2626, 0 0 42px #ff000080, 0 0 82px #ff000040',
      animation: 'neonFlicker 5s ease-in-out infinite',
    }}>
      {text}
    </div>
  );
}

/* ── Neon accent line ── */
export function NeonLine({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  return (
    <div style={{
      position: 'absolute', left: x1, top: y1,
      width: len, height: 2,
      backgroundColor: '#dc2626',
      boxShadow: '0 0 6px #dc262680, 0 0 12px #dc262640',
      transform: `rotate(${angle}deg)`, transformOrigin: '0 0',
      opacity: 0.5, pointerEvents: 'none',
    }} />
  );
}

/* ── Zone floor ── */
export function FloorZone({ x, y, w, h, tint, label, dashed }: { x: number; y: number; w: number; h: number; tint: string; label: string; dashed?: boolean }) {
  return (
    <>
      <div style={{
        position: 'absolute', left: x, top: y, width: w, height: h,
        backgroundColor: tint, borderRadius: 6,
        border: dashed ? '1px dashed #ffffff08' : undefined,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', left: x + 6, top: y + 4,
        fontSize: 8, fontFamily: 'monospace', color: '#475569',
        letterSpacing: 1, textTransform: 'uppercase', pointerEvents: 'none',
      }}>{label}</div>
    </>
  );
}

/* ── Glass wall ── */
export function GlassWall({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h,
      border: '1px solid #3b82f618', borderRadius: 4,
      pointerEvents: 'none',
    }} />
  );
}

/* ── Interaction Lines between active agents ── */
export function InteractionLines({ activeIds }: { activeIds: string[] }) {
  if (activeIds.length < 2) return null;
  const lines: { from: AgentCfg; to: AgentCfg }[] = [];
  for (let i = 0; i < activeIds.length && i < 4; i++) {
    for (let j = i + 1; j < activeIds.length && j < 4; j++) {
      const a = AGENT_MAP[activeIds[i]];
      const b = AGENT_MAP[activeIds[j]];
      if (a && b) lines.push({ from: a, to: b });
    }
  }
  const opacity = lines.length > 5 ? 0.15 : 0.3;
  return (
    <>
      {lines.map((line, i) => {
        const fx = line.from.deskPos.x + 12, fy = line.from.deskPos.y + 16;
        const tx = line.to.deskPos.x + 12, ty = line.to.deskPos.y + 16;
        const dx = tx - fx, dy = ty - fy;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <div key={i} style={{
            position: 'absolute', left: fx, top: fy,
            width: len, height: 1,
            background: `linear-gradient(90deg, #22c55e40, #22c55e80, #22c55e40)`,
            transform: `rotate(${angle}deg)`, transformOrigin: '0 0',
            opacity,
            animation: 'linePulse 2s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: 5,
          }} />
        );
      })}
    </>
  );
}

/* ── Global Metrics Bar ── */
export function MetricsBar({ activity }: { activity: Record<string, import('./types').ActivityItem> }) {
  const items = Object.values(activity);
  const activeCount = items.filter(a => a.status === 'active').length;
  const totalMessages = items.reduce((sum, a) => sum + (a.messageCount || 0), 0);
  const lastActive = items
    .filter(a => a.timestamp)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div style={{
      display: 'flex', gap: 16, justifyContent: 'center',
      padding: '6px 12px', marginBottom: 8,
      fontFamily: 'monospace', fontSize: 11,
      color: '#94a3b8',
    }}>
      <span>
        <span style={{ color: '#22c55e', fontWeight: 'bold' }}>🟢 {activeCount}</span> active
      </span>
      <span>
        <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>💬 {totalMessages}</span> messages today
      </span>
      {lastActive && (
        <span>
          Last: <span style={{ color: '#64748b' }}>{timeAgo(lastActive.timestamp)}</span>
        </span>
      )}
      {activeCount === 0 && (
        <span style={{ color: '#475569' }}>All quiet 😴</span>
      )}
    </div>
  );
}
