'use client';

import { ConversationPanel } from '../conversation-panel';
import { VisitorIndicator } from '../visitor-indicator';
import { useOfficeTheme } from '@/hooks/use-office-theme';
import { AGENTS, AGENT_MAP, LOCATIONS, FLOOR_W, FLOOR_H } from './types';
import { AgentUnit } from './agent-unit';
import { CoffeeMachine, WaterCooler, Printer, Plant, Whiteboard, Bookshelf, Couch, ConferenceTable, GuitarStand, Amp, Door, Poster, WallClock } from './office-furniture';
import { SprintBoard } from './sprint-board';
import { NeonSign, NeonLine, FloorZone, GlassWall, InteractionLines, MetricsBar } from './office-layout';
import { OFFICE_KEYFRAMES } from './office-keyframes';
import { useLivingOfficeState } from './use-living-office-state';

export function LivingOffice() {
  const { theme } = useOfficeTheme();
  const {
    activity, selectedAgent, setSelectedAgent, scale, spawnAnimations,
    containerRef, isNight, ambient, getStatus, handleSelect, handleFloorClick,
  } = useLivingOfficeState();

  const activeIds = AGENTS.filter(a => getStatus(a.id) === 'active').map(a => a.id);

  return (
    <div style={{ fontFamily: 'monospace' }}>
      <style>{OFFICE_KEYFRAMES}</style>

      <MetricsBar activity={activity} />

      <div
        ref={containerRef}
        style={{
          width: '100%', maxWidth: '1200px',
          height: FLOOR_H * scale, margin: '0 auto', overflow: 'hidden',
        }}
      >
        <div
          data-floor="true"
          onClick={handleFloorClick}
          style={{
            position: 'relative', width: FLOOR_W, height: FLOOR_H,
            background: theme.floorBg, borderRadius: 12,
            border: `2px solid ${theme.floorBorder}`, overflow: 'hidden',
            transform: `perspective(1000px) rotateX(2deg) scale(${scale})`,
            transformOrigin: 'top left',
            boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          }}
        >
        <NeonLine x1={0} y1={1} x2={FLOOR_W} y2={1} />
        <NeonLine x1={1} y1={0} x2={1} y2={FLOOR_H} />
        <NeonLine x1={FLOOR_W - 1} y1={0} x2={FLOOR_W - 1} y2={FLOOR_H} />

        <FloorZone x={15} y={40} w={190} h={140} tint="#dc262610" label="🔴 Boss Office" dashed />
        <FloorZone x={220} y={40} w={250} h={140} tint="#64748b08" label="Conference" dashed />
        <FloorZone x={480} y={40} w={180} h={140} tint="#3b82f608" label="Kitchen" dashed />
        <FloorZone x={20} y={200} w={450} h={110} tint="#8b5cf610" label="⚡ Engineering" dashed />
        <FloorZone x={480} y={200} w={300} h={110} tint="#ec489910" label="🎨 Creative" dashed />
        <FloorZone x={20} y={335} w={290} h={110} tint="#f9731610" label="📋 Strategy" dashed />
        <FloorZone x={380} y={335} w={420} h={110} tint="#06b6d410" label="🧪 Labs" dashed />
        <FloorZone x={270} y={470} w={360} h={80} tint="#a78bfa08" label="☕ Break Area" />

        <GlassWall x={13} y={38} w={194} h={144} />
        <GlassWall x={218} y={38} w={254} h={144} />

        <NeonSign x={340} y={10} text="GRID HQ" />
        <WallClock x={840} y={12} />

        <ConferenceTable x={280} y={80} />
        <SprintBoard x={230} y={42} />

        <CoffeeMachine x={LOCATIONS.coffee.x} y={LOCATIONS.coffee.y} />
        <WaterCooler x={LOCATIONS.water.x} y={LOCATIONS.water.y} />
        <Plant x={630} y={60} />

        <Plant x={170} y={50} large />
        <Bookshelf x={15} y={100} />

        <Whiteboard x={750} y={205} label="Mood Board" />
        <Whiteboard x={250} y={340} label="Roadmap" />

        <GuitarStand x={600} y={348} />
        <Amp x={620} y={390} />

        <Bookshelf x={740} y={340} />
        <Bookshelf x={740} y={390} />

        <Couch x={400} y={486} />
        <Printer x={LOCATIONS.printer.x} y={LOCATIONS.printer.y} />

        <Plant x={440} y={195} />
        <Plant x={20} y={460} />
        <Plant x={820} y={460} large />
        <Poster x={680} y={10} text="🚀 SHIP IT" />
        <Poster x={120} y={10} text="LGTM ✅" />
        <Door x={80} y={520} />

        <InteractionLines activeIds={activeIds} />

        {AGENTS.map((agent, i) => (
          <AgentUnit
            key={agent.id}
            agent={agent}
            status={getStatus(agent.id)}
            animDelay={i * 2.5}
            selected={selectedAgent === agent.id}
            onClick={() => handleSelect(agent.id)}
            activityData={activity[agent.id]}
          />
        ))}

        {ambient.color !== 'transparent' && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundColor: ambient.color,
            pointerEvents: 'none', zIndex: 6,
            borderRadius: 12,
            transition: 'background-color 60s ease',
          }} />
        )}

        {isNight && AGENTS.map(a => {
          const st = getStatus(a.id);
          if (st !== 'idle') return null;
          return (
            <div key={`zzz-${a.id}`} style={{
              position: 'absolute',
              left: a.deskPos.x + 10,
              top: a.deskPos.y - 18,
              fontSize: 10,
              color: '#94a3b8',
              opacity: 0.5,
              animation: 'breathe 3s ease-in-out infinite',
              pointerEvents: 'none',
              zIndex: 12,
            }}>
              💤
            </div>
          );
        })}

        {spawnAnimations.map(anim => {
          const parent = AGENT_MAP[anim.parentId];
          const child = AGENT_MAP[anim.childId];
          if (!parent || !child) return null;
          const fx = parent.deskPos.x + 12, fy = parent.deskPos.y + 16;
          const tx = child.deskPos.x + 12, ty = child.deskPos.y + 16;
          const dx = tx - fx, dy = ty - fy;
          const len = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          return (
            <div key={anim.id}>
              <div style={{
                position: 'absolute', left: fx, top: fy,
                width: len, height: 0,
                borderTop: `1px dashed ${parent.color}`,
                transform: `rotate(${angle}deg)`, transformOrigin: '0 0',
                opacity: 0.6, pointerEvents: 'none', zIndex: 15,
              }} />
              <div style={{
                position: 'absolute',
                left: fx, top: fy - 3,
                width: 6, height: 6,
                borderRadius: '50%',
                backgroundColor: parent.color,
                opacity: 0.8,
                animation: `packetTravel-${anim.id} 2s ease-in-out infinite`,
                pointerEvents: 'none', zIndex: 16,
              }} />
              <style>{`
                @keyframes packetTravel-${anim.id} {
                  0% { transform: translate(0px, 0px); }
                  100% { transform: translate(${dx}px, ${dy}px); }
                }
              `}</style>
            </div>
          );
        })}

        <VisitorIndicator />

        <div style={{
          position: 'absolute', right: 8, bottom: 8,
          fontSize: 10, fontFamily: 'monospace', color: '#475569',
          pointerEvents: 'none', zIndex: 20,
        }}>
          {ambient.label} {new Date().getHours().toString().padStart(2, '0')}:{new Date().getMinutes().toString().padStart(2, '0')}
        </div>

        {selectedAgent && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            pointerEvents: 'none', zIndex: 8,
          }} />
        )}
        </div>
      </div>

      {/* Status pills */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6,
        justifyContent: 'center', marginTop: 12, padding: '6px 0',
      }}>
        {AGENTS.map(a => {
          const st = getStatus(a.id);
          const isWorking = st === 'active' || st === 'recent';
          const isSel = selectedAgent === a.id;
          return (
            <button
              key={a.id}
              onClick={() => handleSelect(a.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '3px 10px', borderRadius: 16,
                border: isSel ? `1px solid ${a.color}80` : '1px solid #1e293b',
                backgroundColor: isSel ? `${a.color}15` : '#0a0a0f',
                cursor: 'pointer', fontFamily: 'monospace', fontSize: 10,
                color: isWorking ? '#e2e8f0' : '#64748b',
                transition: 'all 0.2s', outline: 'none',
              }}
            >
              <span style={{
                width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
                backgroundColor: st === 'active' ? '#22c55e' : st === 'recent' ? '#eab308' : '#4b5563',
                boxShadow: st === 'active' ? '0 0 6px #22c55e' : undefined,
                animation: st === 'active' ? 'pulse 1.5s ease-in-out infinite' : undefined,
              }} />
              <span style={{ fontWeight: 'bold' }}>{a.name}</span>
              <span style={{ fontSize: 9, color: '#64748b' }}>
                {st === 'active' ? 'Working' : st === 'recent' ? 'Recent' : 'Idle'}
              </span>
            </button>
          );
        })}
      </div>

      {selectedAgent && AGENT_MAP[selectedAgent] && (
        <ConversationPanel
          agentId={selectedAgent}
          agent={{
            emoji: AGENT_MAP[selectedAgent].emoji,
            name: AGENT_MAP[selectedAgent].name,
            color: AGENT_MAP[selectedAgent].color,
            role: AGENT_MAP[selectedAgent].role,
          }}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}
