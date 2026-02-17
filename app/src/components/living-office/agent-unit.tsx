import { AchievementBadges } from '../achievement-badges';
import type { AgentCfg } from './types';
import { LOCATIONS } from './types';
import { PixelCharacter } from './pixel-character';
import { DeskUnit } from './desk-unit';

/* ── Character + Desk combined, with walking ── */
export function AgentUnit({
  agent, status, animDelay, selected, onClick, activityData,
}: {
  agent: AgentCfg; status: 'active' | 'recent' | 'idle';
  animDelay: number; selected: boolean; onClick: () => void;
  activityData?: { status?: 'active' | 'recent' | 'idle'; messageCount?: number; task?: string };
}) {
  const { deskPos, idleRoutine, id } = agent;
  const routineId = `walk-${id}`;

  const dest = idleRoutine !== 'inplace'
    ? (idleRoutine === 'patrol'
      ? LOCATIONS.patrol2
      : LOCATIONS[idleRoutine as keyof typeof LOCATIONS])
    : null;
  const isMoving = status === 'idle' && dest != null;
  const isPatrol = idleRoutine === 'patrol' && status === 'idle';

  return (
    <>
      {isMoving && !isPatrol && (
        <style>{`
          @keyframes ${routineId} {
            0%, 10% { transform: translate(${deskPos.x}px, ${deskPos.y}px); }
            25% { transform: translate(${dest.x}px, ${dest.y}px); }
            40% { transform: translate(${dest.x}px, ${dest.y}px); }
            55% { transform: translate(${deskPos.x}px, ${deskPos.y}px); }
            100% { transform: translate(${deskPos.x}px, ${deskPos.y}px); }
          }
        `}</style>
      )}
      {isPatrol && (
        <style>{`
          @keyframes ${routineId} {
            0%, 8% { transform: translate(${deskPos.x}px, ${deskPos.y}px); }
            20% { transform: translate(${LOCATIONS.patrol1.x}px, ${LOCATIONS.patrol1.y}px); }
            35% { transform: translate(${LOCATIONS.patrol2.x}px, ${LOCATIONS.patrol2.y}px); }
            50% { transform: translate(${LOCATIONS.patrol2.x}px, ${LOCATIONS.patrol2.y}px); }
            70% { transform: translate(${deskPos.x}px, ${deskPos.y}px); }
            100% { transform: translate(${deskPos.x}px, ${deskPos.y}px); }
          }
        `}</style>
      )}

      <button
        onClick={onClick}
        aria-label={`${agent.name} — ${agent.role} — ${status}`}
        style={{
          position: 'absolute',
          left: 0, top: 0,
          transform: `translate(${deskPos.x}px, ${deskPos.y}px)`,
          animation: isMoving || isPatrol
            ? `${routineId} ${22 + animDelay * 3}s ease-in-out ${animDelay}s infinite`
            : undefined,
          zIndex: selected ? 50 : 10,
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          padding: 0,
          outline: 'none',
        }}
      >
        {status === 'active' && (
          <div style={{
            position: 'absolute',
            width: 44, height: 44,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${agent.color}35, transparent 70%)`,
            top: -10, left: -10,
            animation: 'pulseGlow 2s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
        )}

        {status === 'active' && (
          <div style={{
            position: 'absolute', top: -14, left: 0, right: 0,
            display: 'flex', gap: 2, justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 3, height: 3, borderRadius: '50%',
                backgroundColor: '#22c55e',
                animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        )}

        {selected && (
          <div style={{
            position: 'absolute',
            width: 34, height: 38,
            borderRadius: 6,
            border: `2px solid ${agent.color}`,
            top: -5, left: -5,
            boxShadow: `0 0 10px ${agent.color}50`,
            pointerEvents: 'none',
          }} />
        )}

        <PixelCharacter agent={agent} status={status} animDelay={animDelay} />

        <div style={{
          fontSize: 7, fontFamily: 'monospace', fontWeight: 'bold',
          color: agent.color, textAlign: 'center', marginTop: 1,
          textShadow: '0 1px 3px rgba(0,0,0,0.9)',
          whiteSpace: 'nowrap',
        }}>
          {agent.emoji} {agent.name}
        </div>

        <AchievementBadges agentId={agent.id} activity={activityData ?? { status, messageCount: 0 }} />
      </button>

      <DeskUnit
        x={deskPos.x}
        y={deskPos.y}
        monitors={agent.monitors}
        active={status === 'active'}
        nameplate={agent.id === 'mcp' ? 'MCP 🔴' : undefined}
        teacup={agent.accessory === 'teacup'}
        energyDrink={agent.id === 'grid'}
        stickyNotes={agent.id === 'bug'}
        paintSplats={agent.id === 'pixel'}
        bookStacks={agent.id === 'vault'}
      />
    </>
  );
}
