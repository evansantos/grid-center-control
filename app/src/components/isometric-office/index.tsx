'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AGENTS, FLOOR_W, FLOOR_H } from './types';
import type { ActivityItem, AgentCfg } from './types';
import { OFFICE_KEYFRAMES } from './office-keyframes';
import { AgentAvatar } from './agent-avatar';
import { useOfficeState } from './use-office-state';
import { AgentMessagePanel } from './agent-message-panel';

/* ═══════════════════════════════════════════
   TOP-DOWN OFFICE — Branch/Habbo style
   ═══════════════════════════════════════════ */

const WALL = 6;          // wall thickness
const WALL_COLOR = '#2a2a3a';
const WALL_ACCENT = '#3a3a4f';
const FLOOR_BASE = '#1a1a24';
const FLOOR_TILE = '#1e1e2a';

/* ── Top-down desk (monitor + keyboard + desk surface) ── */
function TopDesk({ color, active, facing = 'down' }: { color: string; active: boolean; facing?: 'up' | 'down' | 'left' | 'right' }) {
  const isVert = facing === 'up' || facing === 'down';
  return (
    <div style={{
      width: isVert ? 40 : 50, height: isVert ? 30 : 24,
      position: 'relative',
    }}>
      {/* Desk surface */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, #3d3529, #2e2720)',
        borderRadius: 3,
        border: '1px solid #4a3f35',
        boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
      }} />
      {/* Monitor */}
      <div style={{
        position: 'absolute',
        ...(facing === 'down' ? { top: 3, left: '50%', transform: 'translateX(-50%)' } :
            facing === 'up' ? { bottom: 3, left: '50%', transform: 'translateX(-50%)' } :
            facing === 'left' ? { right: 3, top: '50%', transform: 'translateY(-50%)' } :
            { left: 3, top: '50%', transform: 'translateY(-50%)' }),
        width: isVert ? 18 : 8, height: isVert ? 4 : 14,
        background: active ? color : '#252530',
        borderRadius: 1,
        border: `1px solid ${active ? color + '80' : '#333340'}`,
        boxShadow: active ? `0 0 8px ${color}50, 0 0 16px ${color}20` : 'none',
        transition: 'all 0.6s',
      }} />
      {/* Keyboard */}
      <div style={{
        position: 'absolute',
        ...(facing === 'down' ? { bottom: 4, left: '50%', transform: 'translateX(-50%)' } :
            facing === 'up' ? { top: 4, left: '50%', transform: 'translateX(-50%)' } :
            facing === 'left' ? { left: 4, top: '50%', transform: 'translateY(-50%)' } :
            { right: 4, top: '50%', transform: 'translateY(-50%)' }),
        width: isVert ? 14 : 5, height: isVert ? 5 : 10,
        background: '#1a1a22',
        borderRadius: 1,
        border: '1px solid #2a2a35',
      }} />
    </div>
  );
}

/* ── Office chair (top-down circle) ── */
function Chair({ color, occupied }: { color: string; occupied: boolean }) {
  return (
    <div style={{
      width: 16, height: 16, borderRadius: '50%',
      background: occupied
        ? `radial-gradient(circle at 40% 40%, ${color}50, ${color}30)`
        : 'radial-gradient(circle at 40% 40%, #2a2a35, #1e1e28)',
      border: `1.5px solid ${occupied ? color + '60' : '#333340'}`,
      boxShadow: occupied ? `0 0 6px ${color}20` : 'none',
      transition: 'all 0.5s',
    }} />
  );
}

/* ── Plant (top-down bush) ── */
function Bush({ x, y, size = 24 }: { x: number; y: number; size?: number }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: size, height: size, borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 35%, #2dd4bf30, #065f4620, #022c2210)',
      border: '2px solid #0d9488',
      boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.3)',
      animation: 'plantSway 6s ease-in-out infinite',
    }}>
      {/* Highlight */}
      <div style={{
        position: 'absolute', top: 3, left: 4,
        width: size * 0.3, height: size * 0.25, borderRadius: '50%',
        background: 'rgba(45, 212, 191, 0.15)',
      }} />
    </div>
  );
}

/* ── Conference table ── */
function ConferenceTable({ x, y }: { x: number; y: number }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: 80, height: 40, borderRadius: 20,
      background: 'linear-gradient(135deg, #3d3529, #2e2720)',
      border: '2px solid #4a3f35',
      boxShadow: '0 3px 8px rgba(0,0,0,0.5)',
    }} />
  );
}

/* ── Couch (top-down) ── */
function CouchTopDown({ x, y, orientation = 'horizontal' }: { x: number; y: number; orientation?: 'horizontal' | 'vertical' }) {
  const isH = orientation === 'horizontal';
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: isH ? 56 : 20, height: isH ? 20 : 56,
      background: 'linear-gradient(135deg, #4338ca, #3730a3)',
      borderRadius: isH ? '8px 8px 4px 4px' : '8px 4px 4px 8px',
      border: '1.5px solid #6366f1',
      boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
    }}>
      {/* Cushions */}
      <div style={{
        display: 'flex', flexDirection: isH ? 'row' : 'column',
        gap: 2, padding: 3,
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: isH ? 15 : 12, height: isH ? 12 : 15,
            background: '#4f46e5', borderRadius: 3,
            border: '1px solid #6366f140',
          }} />
        ))}
      </div>
    </div>
  );
}

/* ── Coffee machine ── */
function CoffeeMachineTop({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y }}>
      <div style={{
        width: 16, height: 20,
        background: 'linear-gradient(180deg, #525252, #3f3f46)',
        borderRadius: 3,
        border: '1px solid #6b7280',
        boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
      }}>
        <div style={{ width: 4, height: 4, background: '#ef4444', borderRadius: '50%', margin: '3px auto' }} />
      </div>
      {/* Steam */}
      {[0, 1].map(i => (
        <div key={i} style={{
          position: 'absolute', top: -6 - i * 5, left: 4 + i * 3,
          width: 4, height: 4, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          animation: `steamRise 2.5s ease-out ${i * 0.8}s infinite`,
        }} />
      ))}
    </div>
  );
}

/* ── Whiteboard ── */
function WhiteboardTop({ x, y, text }: { x: number; y: number; text?: string }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: 60, height: 8,
      background: 'linear-gradient(90deg, #e2e8f0, #f1f5f9)',
      border: '1px solid #94a3b8',
      borderRadius: 1,
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    }}>
      {text && <div style={{
        fontSize: 4, color: '#334155', padding: '1px 3px',
        fontFamily: 'monospace', overflow: 'hidden', whiteSpace: 'nowrap',
        textOverflow: 'ellipsis', maxWidth: 54,
      }}>{text.slice(0, 20)}</div>}
    </div>
  );
}

/* ── Mini avatar for top-down view ── */
function MiniAgent({ agent, status, onClick, selected }: {
  agent: AgentCfg; status: 'active' | 'recent' | 'idle';
  onClick: () => void; selected: boolean;
}) {
  const isActive = status === 'active';
  return (
    <div onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
      cursor: 'pointer', position: 'relative', zIndex: selected ? 30 : 15,
    }}>
      {/* Agent circle body */}
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${agent.color}, ${agent.colorDark || agent.color})`,
        border: `2px solid ${isActive ? '#fff' : agent.color + '80'}`,
        boxShadow: isActive
          ? `0 0 8px ${agent.color}60, 0 0 16px ${agent.color}30`
          : selected ? `0 0 6px ${agent.color}40` : '0 1px 3px rgba(0,0,0,0.5)',
        transition: 'all 0.3s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10,
        animation: isActive ? 'agentPulse 2s ease-in-out infinite' : undefined,
      }}>
        {agent.emoji}
      </div>
      {/* Status ring */}
      {isActive && (
        <div style={{
          position: 'absolute', top: -3, right: -3,
          width: 8, height: 8, borderRadius: '50%',
          background: '#22c55e',
          border: '1.5px solid #0a0a12',
          boxShadow: '0 0 4px #22c55e',
        }} />
      )}
      {/* Name */}
      <div style={{
        fontSize: 7, fontFamily: 'monospace', fontWeight: 700,
        color: isActive ? '#e2e8f0' : '#64748b',
        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
        textAlign: 'center', whiteSpace: 'nowrap', letterSpacing: 0.5,
      }}>
        {agent.name}
      </div>
    </div>
  );
}

/* ── Room zone with walls ── */
function Room({ x, y, w, h, label, icon, accentColor, children }: {
  x: number; y: number; w: number; h: number;
  label: string; icon: string; accentColor: string;
  children?: React.ReactNode;
}) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h,
    }}>
      {/* Floor */}
      <div style={{
        position: 'absolute', inset: WALL,
        background: `
          repeating-conic-gradient(${FLOOR_TILE} 0% 25%, ${FLOOR_BASE} 0% 50%) 0 0 / 20px 20px
        `,
        borderRadius: 2,
      }} />
      {/* Floor ambient glow */}
      <div style={{
        position: 'absolute', inset: WALL,
        background: `radial-gradient(ellipse at 30% 40%, ${accentColor}08, transparent 60%)`,
        borderRadius: 2, pointerEvents: 'none',
      }} />

      {/* Walls */}
      {/* Top wall */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: w, height: WALL,
        background: `linear-gradient(180deg, ${WALL_ACCENT}, ${WALL_COLOR})`,
        borderRadius: '3px 3px 0 0',
      }} />
      {/* Bottom wall */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, width: w, height: WALL,
        background: `linear-gradient(0deg, ${WALL_ACCENT}, ${WALL_COLOR})`,
        borderRadius: '0 0 3px 3px',
      }} />
      {/* Left wall */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: WALL, height: h,
        background: `linear-gradient(90deg, ${WALL_ACCENT}, ${WALL_COLOR})`,
        borderRadius: '3px 0 0 3px',
      }} />
      {/* Right wall */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: WALL, height: h,
        background: `linear-gradient(270deg, ${WALL_ACCENT}, ${WALL_COLOR})`,
        borderRadius: '0 3px 3px 0',
      }} />

      {/* Accent strip on top wall */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: w, height: 2,
        background: accentColor,
        opacity: 0.6,
        borderRadius: '3px 3px 0 0',
        boxShadow: `0 0 8px ${accentColor}40`,
      }} />

      {/* Room label */}
      <div style={{
        position: 'absolute', top: WALL + 4, left: WALL + 8,
        fontSize: 9, fontFamily: 'monospace', fontWeight: 700,
        letterSpacing: 1.5, color: accentColor,
        textShadow: `0 0 6px ${accentColor}30`,
        display: 'flex', alignItems: 'center', gap: 4,
        zIndex: 5,
      }}>
        <span style={{ fontSize: 10 }}>{icon}</span>
        {label}
      </div>

      {/* Children (furniture + agents) */}
      <div style={{ position: 'absolute', inset: WALL, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

/* ── Cubicle: partitioned workspace per agent ── */
function Cubicle({ agent, active, atDesk, selected, onClick }: {
  agent: AgentCfg; active: boolean; atDesk: boolean;
  selected: boolean; onClick: () => void;
}) {
  const cubW = 56;
  const cubH = 62;
  return (
    <div style={{
      width: cubW, height: cubH,
      position: 'relative',
    }}>
      {/* Partition walls (3 sides — open at front) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: cubW, height: 3,
        background: active ? `linear-gradient(90deg, ${agent.color}40, ${agent.color}20)` : '#2a2a3a',
        borderRadius: '2px 2px 0 0',
        boxShadow: active ? `0 0 4px ${agent.color}20` : 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 3, height: cubH - 12,
        background: '#2a2a3a', borderRadius: '2px 0 0 0',
      }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 3, height: cubH - 12,
        background: '#252535', borderRadius: '0 2px 0 0',
      }} />
      
      {/* Floor highlight */}
      {atDesk && <div style={{
        position: 'absolute', inset: 3, background: `${agent.color}06`, borderRadius: 1,
      }} />}

      {/* Desk */}
      <div style={{ position: 'absolute', top: 6, left: 8 }}>
        <TopDesk color={agent.color} active={active} facing="down" />
      </div>

      {/* Name plate */}
      <div style={{
        position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)',
        fontSize: 6, fontFamily: 'monospace', fontWeight: 700,
        color: active ? agent.color : '#4a5568',
        background: '#0d0d14', padding: '0 3px',
        whiteSpace: 'nowrap', letterSpacing: 0.5,
      }}>
        {agent.emoji} {agent.name}
      </div>

      {/* Personal item */}
      <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 6, opacity: 0.5 }}>
        {agent.accessory !== agent.emoji ? agent.accessory : '📎'}
      </div>

      {/* Agent avatar OR empty chair — centered at bottom of cubicle */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        {atDesk ? (
          <div onClick={onClick} style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
            <MiniAgent agent={agent} status={active ? 'active' : 'idle'}
              onClick={onClick} selected={selected} />
          </div>
        ) : (
          <>
            <Chair color={agent.color} occupied={false} />
            <div style={{ fontSize: 5, color: '#374151', fontFamily: 'monospace', marginTop: 1 }}>away</div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══ MAIN COMPONENT ═══ */
export default function IsometricOffice() {
  const [activity, setActivity] = useState<Record<string, ActivityItem>>({});
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const { agentPositions, agentStates, meetingState } = useOfficeState(activity);

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
      if (containerRef.current) setScale(Math.min(containerRef.current.offsetWidth / FLOOR_W, 1.15));
    };
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    update();
    return () => ro.disconnect();
  }, []);

  const getStatus = (id: string): 'active' | 'recent' | 'idle' => activity[id]?.status ?? 'idle';

  const agentsByZone: Record<string, AgentCfg[]> = {};
  AGENTS.forEach(a => { if (!agentsByZone[a.zone]) agentsByZone[a.zone] = []; agentsByZone[a.zone].push(a); });

  const activeCount = AGENTS.filter(a => getStatus(a.id) === 'active').length;
  const totalMessages = Object.values(activity).reduce((s, a) => s + (a.messageCount || 0), 0);
  const isMeeting = meetingState?.active;

  const canvasH = 700;

  return (
    <div style={{ fontFamily: 'monospace' }}>
      <style>{OFFICE_KEYFRAMES}{`
        @keyframes agentPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes steamRise { 0% { opacity:0.3; transform:translateY(0); } 100% { opacity:0; transform:translateY(-10px); } }
        @keyframes plantSway { 0%,100% { transform:rotate(0deg); } 50% { transform:rotate(2deg); } }
        @keyframes neonFlicker { 0%,95%,100% { opacity:1; } 96% { opacity:0.8; } 97% { opacity:1; } 98% { opacity:0.7; } }
        @keyframes popIn { 0% { transform:translateX(-50%) scale(0); opacity:0; } 100% { transform:translateX(-50%) scale(1); opacity:1; } }
        @keyframes dustFloat { 0% { transform:translate(0,0); opacity:0.04; } 50% { opacity:0.08; } 100% { transform:translate(30px,-20px); opacity:0; } }
      `}</style>

      {/* Stats bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 16, marginBottom: 10, fontSize: 12, color: '#64748b',
      }}>
        <span>● <span style={{ color: '#22c55e' }}>{activeCount} active</span></span>
        <span>💬 <span style={{ color: '#a78bfa' }}>{totalMessages}</span></span>
        <span>👥 {AGENTS.length} agents</span>
      </div>

      {/* Office Floor Plan */}
      <div ref={containerRef} style={{ width: '100%', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          position: 'relative', width: FLOOR_W, height: canvasH,
          transform: `scale(${scale})`, transformOrigin: 'top left',
          marginBottom: canvasH * (scale - 1),
          background: '#0d0d14',
          borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}>
          {/* GRID HQ neon */}
          <div style={{
            position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
            fontSize: 16, fontWeight: 700, letterSpacing: 6, color: '#8b5cf6',
            textShadow: '0 0 8px #8b5cf680, 0 0 16px #8b5cf640',
            animation: 'neonFlicker 6s ease-in-out infinite', zIndex: 20,
          }}>G R I D &nbsp; H Q</div>

          {/* Ambient dust */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${(i * 41 + 17) % 100}%`, top: `${(i * 29 + 11) % 100}%`,
              width: 1.5, height: 1.5, borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              animation: `dustFloat ${10 + (i % 3) * 3}s linear ${i * 1.2}s infinite`,
              pointerEvents: 'none', zIndex: 1,
            }} />
          ))}

          {/* ═══ BOSS OFFICE ═══ */}
          <Room x={15} y={30} w={340} h={155} label="BOSS OFFICE" icon="🔴" accentColor="#dc2626">
            <div style={{ display: 'flex', gap: 30, padding: '30px 30px 10px' }}>
              {agentsByZone.boss?.map(agent => (
                <Cubicle key={agent.id} agent={agent}
                  active={getStatus(agent.id) === 'active'}
                  atDesk={agentStates[agent.id]?.behavior === 'desk' || getStatus(agent.id) !== 'idle'}
                  selected={selectedAgent === agent.id} onClick={() => setSelectedAgent(agent.id)} />
              ))}
            </div>
            <Bush x={270} y={25} size={18} />
          </Room>

          {/* ═══ LOUNGE ═══ */}
          <Room x={370} y={30} w={575} h={155} label="LOUNGE" icon="☕" accentColor="#22c55e">
            {/* Couches */}
            <CouchTopDown x={20} y={45} />
            <CouchTopDown x={20} y={85} />
            
            {/* Coffee machine */}
            <CoffeeMachineTop x={105} y={50} />
            
            {/* Vending machine */}
            <div style={{
              position: 'absolute', left: 105, top: 80,
              width: 20, height: 28,
              background: 'linear-gradient(180deg, #1e40af, #1e3a8a)',
              border: '1px solid #3b82f6',
              borderRadius: 3,
              boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
            }}>
              {/* Display */}
              <div style={{
                width: 14, height: 8, margin: '3px auto 0',
                background: '#22d3ee20',
                border: '1px solid #22d3ee40',
                borderRadius: 1,
              }} />
              {/* Buttons */}
              <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 3 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 3, height: 3, borderRadius: '50%',
                    background: i === 0 ? '#22c55e' : '#475569',
                    boxShadow: i === 0 ? '0 0 3px #22c55e' : 'none',
                  }} />
                ))}
              </div>
              {/* Slot */}
              <div style={{ width: 10, height: 4, background: '#0f172a', margin: '3px auto 0', borderRadius: 1 }} />
            </div>

            {/* Arcade / Game console */}
            <div style={{
              position: 'absolute', left: 150, top: 40,
            }}>
              {/* TV / Monitor */}
              <div style={{
                width: 34, height: 22,
                background: '#0f172a',
                border: '2px solid #334155',
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                overflow: 'hidden',
              }}>
                {/* Screen glow — game running */}
                <div style={{
                  width: '100%', height: '100%',
                  background: 'linear-gradient(135deg, #7c3aed20, #ec489920, #22c55e20)',
                  animation: 'screenGlow 3s ease-in-out infinite',
                }} />
              </div>
              {/* TV stand */}
              <div style={{ width: 4, height: 4, background: '#334155', margin: '0 auto' }} />
              <div style={{ width: 16, height: 3, background: '#1e293b', margin: '0 auto', borderRadius: 1 }} />
              {/* Console */}
              <div style={{
                width: 18, height: 6, margin: '2px auto 0',
                background: 'linear-gradient(180deg, #1e293b, #0f172a)',
                borderRadius: 2,
                border: '1px solid #334155',
              }}>
                <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#3b82f6', margin: '1px 2px',
                  boxShadow: '0 0 4px #3b82f6', animation: 'agentPulse 2s ease-in-out infinite' }} />
              </div>
              {/* Controllers */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 3 }}>
                {[0,1].map(i => (
                  <div key={i} style={{
                    width: 10, height: 7, borderRadius: 3,
                    background: i === 0 ? '#6366f1' : '#ef4444',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }} />
                ))}
              </div>
              {/* Label */}
              <div style={{ fontSize: 5, color: '#6366f180', textAlign: 'center', marginTop: 2, fontFamily: 'monospace' }}>
                🎮 GAME
              </div>
            </div>

            {/* Bean bag chairs near TV */}
            {[0,1].map(i => (
              <div key={i} style={{
                position: 'absolute', left: 155 + i * 25, top: 100,
                width: 16, height: 14,
                background: i === 0 ? 'radial-gradient(circle, #7c3aed40, #7c3aed20)' : 'radial-gradient(circle, #ef444440, #ef444420)',
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                border: `1px solid ${i === 0 ? '#7c3aed' : '#ef4444'}40`,
              }} />
            ))}

            <Bush x={480} y={25} size={20} />
            <Bush x={520} y={100} size={14} />
          </Room>

          {/* ═══ ENGINEERING ═══ */}
          <Room x={15} y={200} w={930} h={150} label="ENGINEERING" icon="⚡" accentColor="#7c3aed">
            <div style={{ display: 'flex', gap: 16, padding: '30px 20px 10px' }}>
              {agentsByZone.engineering?.map(agent => (
                <Cubicle key={agent.id} agent={agent}
                  active={getStatus(agent.id) === 'active'}
                  atDesk={agentStates[agent.id]?.behavior === 'desk' || getStatus(agent.id) !== 'idle'}
                  selected={selectedAgent === agent.id} onClick={() => setSelectedAgent(agent.id)} />
              ))}
            </div>
            <Bush x={820} y={25} size={20} />
            <Bush x={860} y={95} size={14} />
          </Room>

          {/* ═══ CREATIVE ═══ */}
          <Room x={15} y={365} w={320} h={150} label="CREATIVE" icon="🎨" accentColor="#f43f5e">
            <div style={{ display: 'flex', gap: 24, padding: '30px 30px 10px' }}>
              {agentsByZone.creative?.map(agent => (
                <Cubicle key={agent.id} agent={agent}
                  active={getStatus(agent.id) === 'active'}
                  atDesk={agentStates[agent.id]?.behavior === 'desk' || getStatus(agent.id) !== 'idle'}
                  selected={selectedAgent === agent.id} onClick={() => setSelectedAgent(agent.id)} />
              ))}
            </div>
            <Bush x={255} y={100} size={16} />
          </Room>

          {/* ═══ STRATEGY ═══ */}
          <Room x={350} y={365} w={280} h={150} label="STRATEGY" icon="📋" accentColor="#f97316">
            <div style={{ display: 'flex', gap: 24, padding: '30px 30px 10px' }}>
              {agentsByZone.strategy?.map(agent => (
                <Cubicle key={agent.id} agent={agent}
                  active={getStatus(agent.id) === 'active'}
                  atDesk={agentStates[agent.id]?.behavior === 'desk' || getStatus(agent.id) !== 'idle'}
                  selected={selectedAgent === agent.id} onClick={() => setSelectedAgent(agent.id)} />
              ))}
            </div>
          </Room>

          {/* ═══ MEETING ROOM ═══ */}
          <Room x={645} y={365} w={300} h={150} label={isMeeting ? `🔴 MEETING` : 'MEETING ROOM'} icon="🤝" accentColor={isMeeting ? '#dc2626' : '#a855f7'}>
            <WhiteboardTop x={20} y={22} text={meetingState?.task || 'Sprint Board'} />
            <ConferenceTable x={90} y={55} />
            {/* Static chairs around table */}
            {[
              { x: 95, y: 42 }, { x: 130, y: 42 }, { x: 165, y: 42 }, { x: 200, y: 42 },
              { x: 95, y: 100 }, { x: 130, y: 100 }, { x: 165, y: 100 }, { x: 200, y: 100 },
              { x: 230, y: 60 }, { x: 230, y: 85 },
              { x: 75, y: 60 }, { x: 75, y: 85 },
            ].map((pos, i) => (
              <div key={i} style={{ position: 'absolute', left: pos.x, top: pos.y }}>
                <Chair color="#a855f7" occupied={isMeeting ? true : false} />
              </div>
            ))}
            {!isMeeting && (
              <div style={{
                position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
                fontSize: 7, color: '#6b21a860', fontFamily: 'monospace',
              }}>available</div>
            )}
            {isMeeting && (
              <div style={{
                position: 'absolute', top: 8, right: 10,
                width: 8, height: 8, borderRadius: '50%',
                background: '#dc2626',
                boxShadow: '0 0 6px #dc2626',
                animation: 'agentPulse 1s ease-in-out infinite',
              }} />
            )}
          </Room>

          {/* ═══ LABS ═══ */}
          <Room x={15} y={530} w={580} h={150} label="LABS" icon="🧪" accentColor="#06b6d4">
            <div style={{ display: 'flex', gap: 24, padding: '30px 30px 10px' }}>
              {agentsByZone.labs?.map(agent => (
                <Cubicle key={agent.id} agent={agent}
                  active={getStatus(agent.id) === 'active'}
                  atDesk={agentStates[agent.id]?.behavior === 'desk' || getStatus(agent.id) !== 'idle'}
                  selected={selectedAgent === agent.id} onClick={() => setSelectedAgent(agent.id)} />
              ))}
            </div>
            <Bush x={460} y={30} size={18} />
            <Bush x={500} y={100} size={14} />
          </Room>

          {/* ═══ SERVER ROOM (decoration) ═══ */}
          <Room x={610} y={530} w={335} h={150} label="SERVER ROOM" icon="🖥️" accentColor="#64748b">
            {/* Server racks */}
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                position: 'absolute', left: 20 + i * 70, top: 30,
                width: 50, height: 90,
                background: 'linear-gradient(180deg, #1e293b, #0f172a)',
                border: '1px solid #334155',
                borderRadius: 2,
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
              }}>
                {/* LEDs */}
                {[0, 1, 2, 3, 4].map(j => (
                  <div key={j} style={{
                    width: 3, height: 3, borderRadius: '50%',
                    background: j === 0 ? '#22c55e' : '#334155',
                    boxShadow: j === 0 ? '0 0 4px #22c55e' : 'none',
                    margin: '8px auto 0',
                    animation: j === 0 ? `neonFlicker ${3 + i}s ease-in-out infinite` : undefined,
                  }} />
                ))}
              </div>
            ))}
          </Room>

          {/* ═══ FLOATING AGENTS LAYER ═══ */}
          {/* Only agents NOT at their desk float (coffee, chat, lounge, wander, meeting) */}
          {AGENTS.map(agent => {
            const state = agentStates[agent.id];
            if (!state) return null;
            const pos = state.position;
            const st = getStatus(agent.id);
            const isWalking = pos.state === 'walking';
            const behavior = state.behavior;
            
            // Agents at their cubicle are rendered inside Cubicle component — skip floating
            const atDesk = behavior === 'desk' || behavior === 'stretch' || st === 'active' || st === 'recent';
            if (atDesk && pos.state !== 'meeting') return null;

            return (
              <div key={agent.id} style={{
                position: 'absolute',
                left: pos.x - 11,
                top: pos.y - 11,
                transition: isWalking
                  ? 'left 1.5s ease-in-out, top 1.5s ease-in-out'
                  : 'left 0.3s ease, top 0.3s ease',
                zIndex: selectedAgent === agent.id ? 30 : 15,
                pointerEvents: 'auto',
              }}>
                <MiniAgent agent={agent} status={st}
                  onClick={() => setSelectedAgent(agent.id)}
                  selected={selectedAgent === agent.id} />
                
                {/* Chat bubble when chatting */}
                {behavior === 'chat' && state.chatBubble && (
                  <div style={{
                    position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
                    background: '#1e293b', border: '1px solid #334155',
                    borderRadius: 8, padding: '1px 4px',
                    fontSize: 9, animation: 'popIn 0.3s ease-out',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  }}>
                    {state.chatBubble}
                  </div>
                )}

                {/* Coffee cup when at coffee machine */}
                {behavior === 'coffee' && (
                  <div style={{
                    position: 'absolute', top: -12, right: -6,
                    fontSize: 8, animation: 'popIn 0.3s ease-out',
                  }}>☕</div>
                )}

                {/* Walking indicator */}
                {isWalking && (
                  <div style={{
                    position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
                    width: 3, height: 3, borderRadius: '50%',
                    background: agent.color + '40',
                    animation: 'agentPulse 0.5s ease-in-out infinite',
                  }} />
                )}
              </div>
            );
          })}

          {/* Clock */}
          <div style={{
            position: 'absolute', top: 10, right: 16,
            fontSize: 10, color: '#475569', fontFamily: 'monospace', zIndex: 20,
          }}>
            {new Date().getHours().toString().padStart(2, '0')}:
            {new Date().getMinutes().toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* ═══ STATUS PILLS — outside canvas ═══ */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6,
        justifyContent: 'center',
        marginTop: 14, padding: '10px 16px',
        borderTop: '1px solid #1e293b',
      }}>
        {AGENTS.map(a => {
          const st = getStatus(a.id);
          const isSel = selectedAgent === a.id;
          return (
            <button key={a.id}
              onClick={() => setSelectedAgent(p => p === a.id ? null : a.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 16,
                border: isSel ? `1px solid ${a.color}80` : '1px solid #1e293b',
                background: isSel ? `${a.color}15` : '#0a0a12',
                cursor: 'pointer', fontFamily: 'monospace', fontSize: 10,
                color: st === 'active' ? '#e2e8f0' : '#64748b',
                outline: 'none', transition: 'all 0.2s',
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: '50%', display: 'inline-block',
                background: st === 'active' ? '#22c55e' : st === 'recent' ? '#eab308' : '#475569',
                boxShadow: st === 'active' ? '0 0 6px #22c55e' : 'none',
              }} />
              <span style={{ fontWeight: 700 }}>{a.emoji} {a.name}</span>
              {activity[a.id]?.messageCount ? (
                <span style={{
                  background: `${a.color}25`, padding: '0 4px', borderRadius: 8,
                  fontSize: 9, color: a.color,
                }}>{activity[a.id].messageCount}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Agent panel */}
      {selectedAgent && (() => {
        const ac = AGENTS.find(a => a.id === selectedAgent);
        if (!ac) return null;
        return <AgentMessagePanel agent={ac} onClose={() => setSelectedAgent(null)} />;
      })()}
    </div>
  );
}
