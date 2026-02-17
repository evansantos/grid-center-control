import type { AgentCfg } from './types';

/* ── 3D Isometric Character ── */
export function IsoCharacter({ agent, status }: { agent: AgentCfg; status: 'active' | 'recent' | 'idle' }) {
  const isActive = status === 'active';
  const isIdle = status === 'idle';
  const opacity = isIdle ? 0.45 : status === 'recent' ? 0.75 : 1;
  const c = agent.color;

  const darken = (hex: string, amt: number) => {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, (n >> 16) - amt);
    const g = Math.max(0, ((n >> 8) & 0xff) - amt);
    const b = Math.max(0, (n & 0xff) - amt);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  };
  const cDark = darken(c, 40);
  const cDarker = darken(c, 70);
  const skin = '#fcd34d';
  const skinDark = '#f59e0b';

  const bounce = isActive
    ? 'isoCharBounce 0.8s ease-in-out infinite alternate'
    : isIdle
    ? 'isoCharBreathe 4s ease-in-out infinite'
    : 'isoCharBreathe 5s ease-in-out infinite';

  return (
    <div style={{
      position: 'relative',
      width: 40,
      height: 60,
      opacity,
      animation: bounce,
      filter: isIdle ? 'saturate(0.4)' : undefined,
      transition: 'opacity 0.5s, filter 0.5s',
    }}>
      {/* Shadow */}
      <div style={{
        position: 'absolute',
        bottom: -4,
        left: 4,
        width: 32,
        height: 10,
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.35)',
        filter: 'blur(3px)',
      }} />

      {/* Body — isometric cube */}
      <div style={{
        position: 'absolute',
        bottom: 4,
        left: 4,
        width: 32,
        height: 28,
        transformStyle: 'preserve-3d',
        transform: 'perspective(200px) rotateX(-5deg)',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${c}, ${cDark})`,
          borderRadius: '4px 4px 2px 2px',
          border: `1px solid ${cDarker}`,
        }} />
        <div style={{
          position: 'absolute',
          top: -4,
          left: 2,
          width: 28,
          height: 8,
          background: c,
          borderRadius: '3px 3px 0 0',
          transform: 'perspective(100px) rotateX(25deg)',
          opacity: 0.7,
        }} />
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: 6,
          height: '100%',
          background: cDarker,
          borderRadius: '0 4px 2px 0',
          opacity: 0.5,
        }} />
      </div>

      {/* Head */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        left: 8,
        width: 24,
        height: 22,
        transformStyle: 'preserve-3d',
        transform: 'perspective(200px) rotateX(-3deg)',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${skin}, ${skinDark})`,
          borderRadius: 6,
          border: '1px solid #d97706',
        }} />
        <div style={{
          position: 'absolute',
          top: 8,
          left: 5,
          display: 'flex',
          gap: 6,
        }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#1e293b' }} />
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#1e293b' }} />
        </div>
      </div>

      {/* Accessory */}
      <div style={{
        position: 'absolute',
        top: -4,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 14,
        filter: isIdle ? 'grayscale(0.5)' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
      }}>
        {agent.accessory}
      </div>

      {/* Active glow ring */}
      {isActive && (
        <div style={{
          position: 'absolute',
          bottom: -6,
          left: -2,
          width: 44,
          height: 14,
          borderRadius: '50%',
          border: `2px solid ${c}`,
          boxShadow: `0 0 12px ${c}80, 0 0 24px ${c}40`,
          animation: 'isoGlowPulse 1.5s ease-in-out infinite',
        }} />
      )}

      {/* Active typing dots */}
      {isActive && (
        <div style={{
          position: 'absolute',
          top: -18,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 3,
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: 'var(--grid-success)',
              animation: `isoTypingDot 1s ease-in-out ${i * 0.15}s infinite`,
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
