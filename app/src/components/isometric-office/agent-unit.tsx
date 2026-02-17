import type { AgentCfg } from './types';
import { IsoCharacter } from './iso-character';
import { IsoDesk } from './iso-furniture';

/* ── Agent Unit (character + desk + nameplate) ── */
export function AgentUnit({
  agent, status, onClick, selected,
}: {
  agent: AgentCfg;
  status: 'active' | 'recent' | 'idle';
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        left: agent.pos.x - 20,
        top: agent.pos.y - 60,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        outline: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: selected ? 50 : 10,
        padding: 0,
      }}
    >
      {selected && (
        <div style={{
          position: 'absolute',
          inset: -6,
          borderRadius: 8,
          border: `2px solid ${agent.color}80`,
          boxShadow: `0 0 16px ${agent.color}30`,
          pointerEvents: 'none',
        }} />
      )}

      <IsoCharacter agent={agent} status={status} />
      <IsoDesk active={status === 'active'} />

      <div style={{
        marginTop: 2,
        fontSize: 8,
        fontFamily: 'monospace',
        fontWeight: 700,
        color: status === 'active' ? agent.color : 'var(--grid-text-secondary)',
        textShadow: status === 'active' ? `0 0 6px ${agent.color}60` : undefined,
        whiteSpace: 'nowrap',
        textAlign: 'center',
      }}>
        {agent.emoji} {agent.name}
      </div>

      <div style={{
        fontSize: 7,
        fontFamily: 'monospace',
        color: 'var(--grid-text-muted)',
        whiteSpace: 'nowrap',
      }}>
        {agent.role}
      </div>
    </button>
  );
}
