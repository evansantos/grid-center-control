'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AGENTS, FLOOR_W, FLOOR_H } from './types';
import type { ActivityItem } from './types';
import { OFFICE_KEYFRAMES } from './office-keyframes';
import { ZoneFloor, ZoneLabel, Plant, CoffeeMachine, Whiteboard, MetricsBar } from './iso-furniture';
import { AgentUnit } from './agent-unit';
import { AgentMessagePanel } from './agent-message-panel';

export default function IsometricOffice() {
  const [activity, setActivity] = useState<Record<string, ActivityItem>>({});
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch('/api/activity');
      const data = await res.json();
      const map: Record<string, ActivityItem> = {};
      for (const a of (data.activity ?? [])) {
        if (!map[a.agent] || a.status === 'active') map[a.agent] = a;
      }
      setActivity(map);
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    fetchActivity();
    const iv = setInterval(fetchActivity, 15000);
    return () => clearInterval(iv);
  }, [fetchActivity]);

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setScale(Math.min(w / FLOOR_W, 1.15));
      }
    };
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    update();
    return () => ro.disconnect();
  }, []);

  const getStatus = (id: string): 'active' | 'recent' | 'idle' => activity[id]?.status ?? 'idle';

  const handleFloorClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.floor) setSelectedAgent(null);
  };

  return (
    <div style={{ fontFamily: 'monospace' }}>
      <style>{OFFICE_KEYFRAMES}</style>

      <MetricsBar activity={activity} />

      <div ref={containerRef} style={{
        width: '100%',
        maxWidth: 1100,
        margin: '0 auto',
        height: FLOOR_H * scale,
        overflow: 'hidden',
      }}>
        <div
          data-floor="true"
          onClick={handleFloorClick}
          style={{
            position: 'relative',
            width: FLOOR_W,
            height: FLOOR_H,
            transform: `perspective(1200px) rotateX(8deg) scale(${scale})`,
            transformOrigin: 'top left',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 12px 60px rgba(0,0,0,0.7), 0 0 1px rgba(255,255,255,0.05)',
          }}>

          {/* Floor — isometric checkered */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-conic-gradient(#12121a 0% 25%, #0e0e16 0% 50%) 0 0 / 32px 32px',
            borderRadius: 14,
          }} />

          {/* Border glow */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 14,
            border: '1px solid #dc262630',
            boxShadow: 'inset 0 0 40px rgba(220,38,38,0.03)',
            pointerEvents: 'none',
          }} />

          {/* Title */}
          <div style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 22,
            fontWeight: 700,
            fontFamily: 'monospace',
            letterSpacing: 8,
            color: 'var(--grid-purple)',
            textShadow: '0 0 10px #8b5cf680, 0 0 20px #8b5cf640, 0 0 40px #8b5cf620',
            animation: 'isoNeonFlicker 6s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: 20,
          }}>
            GRID HQ
          </div>

          {/* Zone floors */}
          <ZoneFloor x={40} y={55} w={260} h={130} tint="rgba(220,38,38,0.06)" />
          <ZoneFloor x={20} y={200} w={530} h={120} tint="rgba(139,92,246,0.05)" />
          <ZoneFloor x={560} y={200} w={260} h={120} tint="rgba(236,72,153,0.05)" />
          <ZoneFloor x={40} y={350} w={280} h={120} tint="rgba(249,115,22,0.05)" />
          <ZoneFloor x={380} y={350} w={430} h={120} tint="rgba(6,182,212,0.05)" />

          {/* Zone labels */}
          <ZoneLabel x={50} y={60} label="BOSS OFFICE" icon="🔴" />
          <ZoneLabel x={30} y={205} label="ENGINEERING" icon="⚡" />
          <ZoneLabel x={570} y={205} label="CREATIVE" icon="🎨" />
          <ZoneLabel x={50} y={355} label="STRATEGY" icon="📋" />
          <ZoneLabel x={390} y={355} label="LABS" icon="🧪" />

          {/* Furniture */}
          <Plant x={320} y={70} size="lg" />
          <Plant x={540} y={80} />
          <Plant x={790} y={200} size="lg" />
          <Plant x={30} y={470} />
          <CoffeeMachine x={400} y={65} />
          <Whiteboard />

          {/* Agents */}
          {AGENTS.map((agent) => (
            <AgentUnit
              key={agent.id}
              agent={agent}
              status={getStatus(agent.id)}
              onClick={() => setSelectedAgent(prev => prev === agent.id ? null : agent.id)}
              selected={selectedAgent === agent.id}
            />
          ))}

          {/* Interaction lines between active agents */}
          {(() => {
            const activeAgents = AGENTS.filter(a => getStatus(a.id) === 'active');
            if (activeAgents.length < 2) return null;
            return activeAgents.slice(0, 4).flatMap((a, i) =>
              activeAgents.slice(i + 1, 4).map((b, j) => {
                const dx = b.pos.x - a.pos.x;
                const dy = b.pos.y - a.pos.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                return (
                  <div key={`line-${i}-${j}`} style={{
                    position: 'absolute',
                    left: a.pos.x,
                    top: a.pos.y,
                    width: len,
                    height: 1,
                    background: 'linear-gradient(90deg, #22c55e40, #22c55e80, #22c55e40)',
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: '0 0',
                    opacity: 0.3,
                    pointerEvents: 'none',
                    zIndex: 5,
                  }} />
                );
              })
            );
          })()}

          {/* Clock */}
          <div style={{
            position: 'absolute',
            right: 12,
            bottom: 10,
            fontSize: 10,
            fontFamily: 'monospace',
            color: 'var(--grid-text-muted)',
            pointerEvents: 'none',
            zIndex: 20,
          }}>
            {new Date().getHours().toString().padStart(2, '0')}:{new Date().getMinutes().toString().padStart(2, '0')}
          </div>

          {/* Dim overlay when selected */}
          {selectedAgent && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.25)',
              pointerEvents: 'none', zIndex: 8,
              borderRadius: 14,
            }} />
          )}
        </div>
      </div>

      {/* Status pills */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        justifyContent: 'center',
        marginTop: 14,
        padding: '8px 0',
      }}>
        {AGENTS.map(a => {
          const st = getStatus(a.id);
          const isSel = selectedAgent === a.id;
          return (
            <button
              key={a.id}
              onClick={() => setSelectedAgent(prev => prev === a.id ? null : a.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 16,
                border: isSel ? `1px solid ${a.color}80` : '1px solid var(--grid-border)',
                background: isSel ? `${a.color}15` : '#0a0a0f',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: 10,
                color: st === 'active' ? 'var(--grid-text)' : 'var(--grid-text-secondary)',
                outline: 'none',
                transition: 'all 0.2s',
              }}
            >
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                display: 'inline-block',
                background: st === 'active' ? 'var(--grid-success)' : st === 'recent' ? 'var(--grid-yellow)' : 'var(--grid-text-muted)',
                boxShadow: st === 'active' ? '0 0 6px var(--grid-success)' : undefined,
              }} />
              <span style={{ fontWeight: 700 }}>{a.name}</span>
            </button>
          );
        })}
      </div>

      {/* Agent message panel */}
      {selectedAgent && (() => {
        const agentCfg = AGENTS.find(a => a.id === selectedAgent);
        if (!agentCfg) return null;
        return (
          <AgentMessagePanel
            agent={agentCfg}
            onClose={() => setSelectedAgent(null)}
          />
        );
      })()}
    </div>
  );
}
