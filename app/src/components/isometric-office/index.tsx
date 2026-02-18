'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AGENTS, FLOOR_W, FLOOR_H } from './types';
import type { ActivityItem, AgentCfg } from './types';
import { OFFICE_KEYFRAMES } from './office-keyframes';
import { AgentAvatar } from './agent-avatar';
import { useOfficeState } from './use-office-state';
import { AgentMessagePanel } from './agent-message-panel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { StatusDot } from '@/components/ui/status-dot';

/* ═══════════════════════════════════════════
   TOP-DOWN OFFICE — Branch/Habbo style
   ═══════════════════════════════════════════ */

const WALL = 6;          // wall thickness

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
        border: '1px solid var(--grid-border-bright)',
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
        background: active ? color : 'var(--grid-surface)',
        borderRadius: 1,
        border: `1px solid ${active ? color + '80' : 'var(--grid-border)'}`,
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
        background: 'var(--grid-surface)',
        borderRadius: 1,
        border: '1px solid var(--grid-border)',
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
        : 'radial-gradient(circle at 40% 40%, var(--grid-surface-hover), var(--grid-surface))',
      border: `1.5px solid ${occupied ? color + '60' : 'var(--grid-border)'}`,
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
      background: 'radial-gradient(circle at 35% 35%, var(--grid-success)30, var(--grid-success)20, var(--grid-success)10)',
      border: '2px solid var(--grid-success)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.3)',
      animation: 'plantSway 6s ease-in-out infinite',
    }}>
      {/* Highlight */}
      <div style={{
        position: 'absolute', top: 3, left: 4,
        width: size * 0.3, height: size * 0.25, borderRadius: '50%',
        background: 'var(--grid-success)15',
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
      border: '2px solid var(--grid-border-bright)',
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
      background: 'linear-gradient(135deg, var(--grid-info), var(--grid-purple))',
      borderRadius: isH ? '8px 8px 4px 4px' : '8px 4px 4px 8px',
      border: '1.5px solid var(--grid-info)',
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
            background: 'var(--grid-info)', borderRadius: 3,
            border: '1px solid var(--grid-info)40',
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
        background: 'linear-gradient(180deg, var(--grid-text-muted), var(--grid-text-secondary))',
        borderRadius: 3,
        border: '1px solid var(--grid-border-bright)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
      }}>
        <div style={{ width: 4, height: 4, background: 'var(--grid-error)', borderRadius: '50%', margin: '3px auto' }} />
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
      background: 'linear-gradient(90deg, var(--grid-text-faint), var(--grid-text-label))',
      border: '1px solid var(--grid-border-subtle)',
      borderRadius: 1,
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    }}>
      {text && <div style={{
        fontSize: 4, color: 'var(--grid-text)', padding: '1px 3px',
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
  const statusMap = {
    'active': 'active' as const,
    'recent': 'busy' as const, 
    'idle': 'idle' as const
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div onClick={onClick} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
            cursor: 'pointer', position: 'relative', zIndex: selected ? 30 : 15,
          }}>
            {/* Agent circle body */}
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, ${agent.color}, ${agent.colorDark || agent.color})`,
              border: `2px solid ${isActive ? 'var(--grid-text)' : agent.color + '80'}`,
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
            {/* Status dot */}
            <div style={{
              position: 'absolute', top: -3, right: -3,
            }}>
              <StatusDot 
                status={statusMap[status]} 
                size="sm"
                aria-label={`${agent.name} is ${status}`}
              />
            </div>
            {/* Name */}
            <div style={{
              fontSize: 7, fontFamily: 'monospace', fontWeight: 700,
              color: isActive ? 'var(--grid-text)' : 'var(--grid-text-dim)',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
              textAlign: 'center', whiteSpace: 'nowrap', letterSpacing: 0.5,
            }}>
              {agent.name}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          <div className="text-xs">
            <div className="font-semibold">{agent.emoji} {agent.name}</div>
            <div className="text-grid-text-dim">{agent.zone} • {status}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
          repeating-conic-gradient(var(--grid-surface-hover) 0% 25%, var(--grid-surface) 0% 50%) 0 0 / 20px 20px
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
        background: `linear-gradient(180deg, var(--grid-border-bright), var(--grid-border))`,
        borderRadius: '3px 3px 0 0',
      }} />
      {/* Bottom wall */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, width: w, height: WALL,
        background: `linear-gradient(0deg, var(--grid-border-bright), var(--grid-border))`,
        borderRadius: '0 0 3px 3px',
      }} />
      {/* Left wall */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: WALL, height: h,
        background: `linear-gradient(90deg, var(--grid-border-bright), var(--grid-border))`,
        borderRadius: '3px 0 0 3px',
      }} />
      {/* Right wall */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: WALL, height: h,
        background: `linear-gradient(270deg, var(--grid-border-bright), var(--grid-border))`,
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
        background: active ? `linear-gradient(90deg, ${agent.color}40, ${agent.color}20)` : 'var(--grid-border)',
        borderRadius: '2px 2px 0 0',
        boxShadow: active ? `0 0 4px ${agent.color}20` : 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 3, height: cubH - 12,
        background: 'var(--grid-border)', borderRadius: '2px 0 0 0',
      }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 3, height: cubH - 12,
        background: 'var(--grid-border-bright)', borderRadius: '0 2px 0 0',
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
        color: active ? agent.color : 'var(--grid-text-secondary)',
        background: 'var(--grid-bg)', padding: '0 3px',
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
            <div style={{ fontSize: 5, color: 'var(--grid-text-muted)', fontFamily: 'monospace', marginTop: 1 }}>away</div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Mobile zoom/pan controls ── */
function ZoomPanControls({ scale, onZoomIn, onZoomOut, onReset }: {
  scale: number; onZoomIn: () => void; onZoomOut: () => void; onReset: () => void;
}) {
  return (
    <div className="mobile-only fixed bottom-4 right-4 flex flex-col gap-2 bg-grid-surface border border-grid-border rounded-md p-2 z-50">
      <button
        onClick={onZoomIn}
        className="flex items-center justify-center w-10 h-10 bg-grid-surface-hover hover:bg-grid-border text-grid-text rounded transition-colors"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        onClick={onZoomOut}
        className="flex items-center justify-center w-10 h-10 bg-grid-surface-hover hover:bg-grid-border text-grid-text rounded transition-colors"
        aria-label="Zoom out"
      >
        −
      </button>
      <button
        onClick={onReset}
        className="flex items-center justify-center w-10 h-10 bg-grid-surface-hover hover:bg-grid-border text-grid-text rounded text-xs transition-colors"
        aria-label="Reset zoom"
      >
        ⌂
      </button>
      <div className="text-xs text-grid-text-dim text-center">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
}

/* ═══ MAIN COMPONENT ═══ */
export default function IsometricOffice() {
  const [activity, setActivity] = useState<Record<string, ActivityItem>>({});
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const officeRef = useRef<HTMLDivElement>(null);
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
      if (containerRef.current) {
        const newScale = Math.min(containerRef.current.offsetWidth / FLOOR_W, 1.15);
        setScale(newScale);
      }
    };
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    update();
    return () => ro.disconnect();
  }, []);

  // Mobile pan handling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (window.innerWidth <= 768) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && window.innerWidth <= 768) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setPanX(prev => prev + deltaX);
      setPanY(prev => prev + deltaY);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, lastPanPoint]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Touch handling for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      const touch = e.touches[0];
      setLastPanPoint({ x: touch.clientX, y: touch.clientY });
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isPanning && e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastPanPoint.x;
      const deltaY = touch.clientY - lastPanPoint.y;
      setPanX(prev => prev + deltaX);
      setPanY(prev => prev + deltaY);
      setLastPanPoint({ x: touch.clientX, y: touch.clientY });
    }
  }, [isPanning, lastPanPoint]);

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.2, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.2, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setScale(1);
    setPanX(0);
    setPanY(0);
  }, []);

  const getStatus = (id: string): 'active' | 'recent' | 'idle' => activity[id]?.status ?? 'idle';

  const agentsByZone: Record<string, AgentCfg[]> = {};
  AGENTS.forEach(a => { if (!agentsByZone[a.zone]) agentsByZone[a.zone] = []; agentsByZone[a.zone].push(a); });

  const activeCount = AGENTS.filter(a => getStatus(a.id) === 'active').length;
  const totalMessages = Object.values(activity).reduce((s, a) => s + (a.messageCount || 0), 0);
  const isMeeting = meetingState?.active;

  const canvasH = 700;

  return (
    <TooltipProvider>
      <div style={{ fontFamily: 'monospace' }}>
        <style>{OFFICE_KEYFRAMES}{`
          @keyframes agentPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
          @keyframes steamRise { 0% { opacity:0.3; transform:translateY(0); } 100% { opacity:0; transform:translateY(-10px); } }
          @keyframes plantSway { 0%,100% { transform:rotate(0deg); } 50% { transform:rotate(2deg); } }
          @keyframes neonFlicker { 0%,95%,100% { opacity:1; } 96% { opacity:0.8; } 97% { opacity:1; } 98% { opacity:0.7; } }
          @keyframes popIn { 0% { transform:translateX(-50%) scale(0); opacity:0; } 100% { transform:translateX(-50%) scale(1); opacity:1; } }
          @keyframes dustFloat { 0% { transform:translate(0,0); opacity:0.04; } 50% { opacity:0.08; } 100% { transform:translate(30px,-20px); opacity:0; } }

          /* Respect prefers-reduced-motion */
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}</style>

        {/* Stats bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 16, marginBottom: 10, fontSize: 12, color: 'var(--grid-text-dim)',
        }}>
          <span>● <span style={{ color: 'var(--grid-success)' }}>{activeCount} active</span></span>
          <span>💬 <span style={{ color: 'var(--grid-purple)' }}>{totalMessages}</span></span>
          <span>👥 {AGENTS.length} agents</span>
        </div>

        {/* Office Floor Plan */}
        <div 
          ref={containerRef} 
          style={{ width: '100%', maxWidth: 1100, margin: '0 auto', overflow: 'hidden' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            ref={officeRef}
            style={{
              position: 'relative', width: FLOOR_W, height: canvasH,
              transform: `scale(${scale}) translate(${panX / scale}px, ${panY / scale}px)`,
              transformOrigin: 'top left',
              marginBottom: canvasH * (scale - 1),
              background: 'var(--grid-bg)',
              borderRadius: 8,
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              overflow: 'hidden',
              cursor: window.innerWidth <= 768 && isPanning ? 'grabbing' : 
                      window.innerWidth <= 768 ? 'grab' : 'default',
            }}
          >
            {/* GRID HQ neon */}
            <div style={{
              position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
              fontSize: 16, fontWeight: 700, letterSpacing: 6, color: 'var(--grid-purple)',
              textShadow: '0 0 8px var(--grid-purple)80, 0 0 16px var(--grid-purple)40',
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
            <Room x={15} y={30} w={340} h={155} label="BOSS OFFICE" icon="🔴" accentColor="var(--grid-danger)">
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
            <Room x={370} y={30} w={575} h={155} label="LOUNGE" icon="☕" accentColor="var(--grid-success)">
              {/* Couches */}
              <CouchTopDown x={20} y={45} />
              <CouchTopDown x={20} y={85} />
              
              {/* Coffee machine */}
              <CoffeeMachineTop x={105} y={50} />
              
              {/* Vending machine */}
              <div style={{
                position: 'absolute', left: 105, top: 80,
                width: 20, height: 28,
                background: 'linear-gradient(180deg, var(--grid-info), var(--grid-purple))',
                border: '1px solid var(--grid-info)',
                borderRadius: 3,
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
              }}>
                {/* Display */}
                <div style={{
                  width: 14, height: 8, margin: '3px auto 0',
                  background: 'var(--grid-cyan)20',
                  border: '1px solid var(--grid-cyan)40',
                  borderRadius: 1,
                }} />
                {/* Buttons */}
                <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 3 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: 3, height: 3, borderRadius: '50%',
                      background: i === 0 ? 'var(--grid-success)' : 'var(--grid-text-muted)',
                      boxShadow: i === 0 ? '0 0 3px var(--grid-success)' : 'none',
                    }} />
                  ))}
                </div>
                {/* Slot */}
                <div style={{ width: 10, height: 4, background: 'var(--grid-bg)', margin: '3px auto 0', borderRadius: 1 }} />
              </div>

              {/* Game area omitted for brevity - would follow same pattern */}
              
              <Bush x={480} y={25} size={20} />
              <Bush x={520} y={100} size={14} />
            </Room>

            {/* Other rooms follow same pattern... */}
            {/* ═══ ENGINEERING ═══ */}
            <Room x={15} y={200} w={930} h={150} label="ENGINEERING" icon="⚡" accentColor="var(--grid-purple)">
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
            <Room x={15} y={365} w={320} h={150} label="CREATIVE" icon="🎨" accentColor="var(--grid-accent)">
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
            <Room x={350} y={365} w={280} h={150} label="STRATEGY" icon="📋" accentColor="var(--grid-orange)">
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
            <Room x={645} y={365} w={300} h={150} label={isMeeting ? `🔴 MEETING` : 'MEETING ROOM'} icon="🤝" accentColor={isMeeting ? 'var(--grid-danger)' : 'var(--grid-purple)'}>
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
                  <Chair color="var(--grid-purple)" occupied={isMeeting ? true : false} />
                </div>
              ))}
              {!isMeeting && (
                <div style={{
                  position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
                  fontSize: 7, color: 'var(--grid-text-muted)', fontFamily: 'monospace',
                }}>available</div>
              )}
              {isMeeting && (
                <div style={{
                  position: 'absolute', top: 8, right: 10,
                }}>
                  <StatusDot status="error" size="sm" aria-label="Meeting in progress" />
                </div>
              )}
            </Room>

            {/* ═══ LABS ═══ */}
            <Room x={15} y={530} w={580} h={150} label="LABS" icon="🧪" accentColor="var(--grid-cyan)">
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
            <Room x={610} y={530} w={335} h={150} label="SERVER ROOM" icon="🖥️" accentColor="var(--grid-text-dim)">
              {/* Server racks */}
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{
                  position: 'absolute', left: 20 + i * 70, top: 30,
                  width: 50, height: 90,
                  background: 'linear-gradient(180deg, var(--grid-surface-hover), var(--grid-surface))',
                  border: '1px solid var(--grid-border)',
                  borderRadius: 2,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                }}>
                  {/* LEDs */}
                  {[0, 1, 2, 3, 4].map(j => (
                    <div key={j}>
                      <StatusDot
                        status={j === 0 ? 'active' : 'offline'}
                        size="sm"
                        style={{ 
                          margin: '8px auto 0',
                          animation: j === 0 ? `neonFlicker ${3 + i}s ease-in-out infinite` : undefined,
                        }}
                        aria-label={`Server ${i + 1} status`}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </Room>

            {/* ═══ FLOATING AGENTS LAYER ═══ */}
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
                      background: 'var(--grid-surface-hover)', border: '1px solid var(--grid-border)',
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
              fontSize: 10, color: 'var(--grid-text-muted)', fontFamily: 'monospace', zIndex: 20,
            }}>
              {new Date().getHours().toString().padStart(2, '0')}:
              {new Date().getMinutes().toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Mobile zoom/pan controls */}
        <ZoomPanControls 
          scale={scale}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleResetZoom}
        />

        {/* ═══ STATUS PILLS — outside canvas ═══ */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6,
          justifyContent: 'center',
          marginTop: 14, padding: '10px 16px',
          borderTop: '1px solid var(--grid-border)',
        }}>
          {AGENTS.map(a => {
            const st = getStatus(a.id);
            const isSel = selectedAgent === a.id;
            const statusMap = {
              'active': 'active' as const,
              'recent': 'busy' as const, 
              'idle': 'idle' as const
            };
            
            return (
              <Tooltip key={a.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSelectedAgent(p => p === a.id ? null : a.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 16,
                      border: isSel ? `1px solid ${a.color}80` : '1px solid var(--grid-border)',
                      background: isSel ? `${a.color}15` : 'var(--grid-bg)',
                      cursor: 'pointer', fontFamily: 'monospace', fontSize: 10,
                      color: st === 'active' ? 'var(--grid-text)' : 'var(--grid-text-dim)',
                      outline: 'none', transition: 'all 0.2s',
                    }}
                  >
                    <StatusDot 
                      status={statusMap[st]} 
                      size="sm"
                      aria-label={`${a.name} is ${st}`}
                    />
                    <span style={{ fontWeight: 700 }}>{a.emoji} {a.name}</span>
                    {activity[a.id]?.messageCount ? (
                      <span style={{
                        background: `${a.color}25`, padding: '0 4px', borderRadius: 8,
                        fontSize: 9, color: a.color,
                      }}>{activity[a.id].messageCount}</span>
                    ) : null}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8}>
                  <div className="text-xs">
                    <div className="font-semibold">{a.emoji} {a.name}</div>
                    <div className="text-grid-text-dim capitalize">{a.zone} • {st}</div>
                    {activity[a.id]?.messageCount && (
                      <div className="text-grid-text-dim">{activity[a.id].messageCount} messages</div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
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
    </TooltipProvider>
  );
}