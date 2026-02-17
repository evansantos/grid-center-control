'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ConversationPanel } from './conversation-panel';
import { VisitorIndicator } from './visitor-indicator';
import { playSpawn } from '../lib/sound-effects';
import { AchievementBadges } from './achievement-badges';
import { useSprintData } from '@/hooks/use-sprint-data';
import { useOfficeTheme } from '@/hooks/use-office-theme';

/* ── Types ── */
interface ActivityItem {
  agent: string;
  status: 'active' | 'recent' | 'idle';
  timestamp: string;
  messageCount: number;
  task?: string;
}

interface Message {
  role: string;
  content: string;
  timestamp?: string;
}

/* ── Agent config ── */
interface AgentCfg {
  id: string;
  name: string;
  emoji: string;
  color: string;
  accent: string;
  role: string;
  zone: 'boss' | 'engineering' | 'creative' | 'strategy' | 'labs';
  deskPos: { x: number; y: number };
  idleRoutine: 'coffee' | 'water' | 'printer' | 'patrol' | 'inplace';
  accessory: 'tie' | 'hoodie' | 'magnifier' | 'epaulettes' | 'clipboard' | 'glasses' | 'teacup' | 'pen' | 'beret' | 'guitar' | 'readglasses' | 'none';
  monitors: number;
}

/* Positions from PIXEL's design spec (900×600 viewport) */
const AGENTS: AgentCfg[] = [
  { id: 'mcp',      name: 'MCP',      emoji: '🔴', color: '#dc2626', accent: '#991b1b', role: 'Orchestrator',   zone: 'boss',        deskPos: { x: 70, y: 75 },   idleRoutine: 'inplace', accessory: 'tie',         monitors: 2 },
  { id: 'ceo',      name: 'CEO',      emoji: '👔', color: '#d97706', accent: '#b45309', role: 'CEO',            zone: 'boss',        deskPos: { x: 140, y: 75 },  idleRoutine: 'inplace', accessory: 'tie',         monitors: 2 },
  { id: 'grid',     name: 'GRID',     emoji: '⚡', color: '#8b5cf6', accent: '#6d28d9', role: 'Frontend',       zone: 'engineering',  deskPos: { x: 30, y: 230 },  idleRoutine: 'coffee',  accessory: 'hoodie',      monitors: 3 },
  { id: 'sentinel', name: 'SENTINEL', emoji: '🛡️', color: '#3b82f6', accent: '#1d4ed8', role: 'Security',       zone: 'engineering',  deskPos: { x: 130, y: 230 }, idleRoutine: 'patrol',  accessory: 'epaulettes',  monitors: 1 },
  { id: 'bug',      name: 'BUG',      emoji: '🪲',  color: '#22c55e', accent: '#15803d', role: 'QA Engineer',    zone: 'engineering',  deskPos: { x: 230, y: 230 }, idleRoutine: 'water',   accessory: 'magnifier',   monitors: 2 },
  { id: 'arch',     name: 'ARCH',     emoji: '🏛️', color: '#7c3aed', accent: '#5b21b6', role: 'Architect',      zone: 'engineering',  deskPos: { x: 330, y: 230 }, idleRoutine: 'inplace', accessory: 'glasses',     monitors: 2 },
  { id: 'dev',      name: 'DEV',      emoji: '🔧', color: '#0ea5e9', accent: '#0284c7', role: 'Engineer',       zone: 'engineering',  deskPos: { x: 430, y: 230 }, idleRoutine: 'coffee',  accessory: 'hoodie',      monitors: 2 },
  { id: 'pixel',    name: 'PIXEL',    emoji: '🎨', color: '#f43f5e', accent: '#e11d48', role: 'Designer',       zone: 'creative',     deskPos: { x: 510, y: 230 }, idleRoutine: 'coffee',  accessory: 'beret',       monitors: 1 },
  { id: 'scribe',   name: 'SCRIBE',   emoji: '✍️',  color: '#ec4899', accent: '#be185d', role: 'Writer',         zone: 'creative',     deskPos: { x: 640, y: 230 }, idleRoutine: 'water',   accessory: 'pen',         monitors: 1 },
  { id: 'spec',     name: 'SPEC',     emoji: '📋', color: '#f97316', accent: '#c2410c', role: 'Product',        zone: 'strategy',     deskPos: { x: 50, y: 365 },  idleRoutine: 'water',   accessory: 'clipboard',   monitors: 1 },
  { id: 'sage',     name: 'SAGE',     emoji: '🧠', color: '#eab308', accent: '#a16207', role: 'Strategist',     zone: 'strategy',     deskPos: { x: 180, y: 365 }, idleRoutine: 'inplace', accessory: 'teacup',      monitors: 1 },
  { id: 'atlas',    name: 'ATLAS',    emoji: '📊', color: '#06b6d4', accent: '#0891b2', role: 'Research',       zone: 'labs',         deskPos: { x: 410, y: 365 }, idleRoutine: 'printer', accessory: 'glasses',     monitors: 3 },
  { id: 'riff',     name: 'RIFF',     emoji: '🎸', color: '#ef4444', accent: '#b91c1c', role: 'Audio',          zone: 'labs',         deskPos: { x: 540, y: 365 }, idleRoutine: 'inplace', accessory: 'guitar',      monitors: 1 },
  { id: 'vault',    name: 'VAULT',    emoji: '📚', color: '#10b981', accent: '#047857', role: 'Knowledge',      zone: 'labs',         deskPos: { x: 670, y: 365 }, idleRoutine: 'inplace', accessory: 'readglasses', monitors: 1 },
];

const AGENT_MAP = Object.fromEntries(AGENTS.map(a => [a.id, a]));

/* ── Shared locations ── */
const LOCATIONS = {
  coffee:  { x: 520, y: 85 },
  water:   { x: 580, y: 85 },
  printer: { x: 340, y: 500 },
  patrol1: { x: 50, y: 500 },
  patrol2: { x: 800, y: 500 },
};

const FLOOR_W = 900;
const FLOOR_H = 580;

/* ── Pixel Character (CSS box-shadow, 6×8 grid per PIXEL's spec) ── */
function PixelCharacter({
  agent,
  status,
  animDelay,
}: {
  agent: AgentCfg;
  status: 'active' | 'recent' | 'idle';
  animDelay: number;
}) {
  const s = 4; // pixel size
  const skin = '#fbbf24';
  const dark = '#334155';
  const c = agent.color;
  const acc = agent.accent;

  // Base template: 6 wide × 8 tall
  const pixels: [number, number, string][] = [
    // Head (rows 0-1, cols 2-3)
    [2,0,skin],[3,0,skin],
    [2,1,skin],[3,1,skin],
    // Torso (rows 2-3, cols 1-4)
    [1,2,c],[2,2,c],[3,2,c],[4,2,c],
    [1,3,c],[2,3,c],[3,3,c],[4,3,c],
    // Waist (row 4, cols 2-3)
    [2,4,c],[3,4,c],
    // Arms (rows 2-3, cols 0 and 5)
    [0,2,c],[0,3,skin],
    [5,2,c],[5,3,skin],
    // Legs (row 5-6, cols 2 and 3)
    [2,5,dark],[3,5,dark],
    [2,6,dark],[3,6,dark],
  ];

  // Per-agent accessories (from PIXEL's design spec)
  switch (agent.accessory) {
    case 'tie':
      pixels.push([3,2,acc],[3,3,acc]); // tie stripe
      break;
    case 'hoodie':
      pixels.push([1,0,acc],[2,0,acc],[3,0,acc],[4,0,acc]); // hood
      pixels.push([5,1,acc]); // headphone ear
      break;
    case 'magnifier':
      pixels.push([6,3,'#854d0e'],[6,4,'#854d0e'],[7,3,'#b45309']); // magnifying glass
      break;
    case 'epaulettes':
      pixels.push([-1,2,acc],[6,2,acc]); // wider shoulders
      break;
    case 'clipboard':
      pixels.push([-1,2,'#9a3412'],[-1,3,'#9a3412'],[-1,4,'#9a3412'],[-1,5,'#b45309']); // clipboard
      break;
    case 'glasses':
      pixels.push([1,0,'#164e63'],[4,0,'#164e63']); // glasses frames
      break;
    case 'teacup':
      // teacup is rendered on desk, not on character
      break;
    case 'pen':
      pixels.push([6,3,'#831843'],[6,4,'#831843']); // pen
      break;
    case 'beret':
      pixels.push([1,-1,acc],[2,-1,acc],[3,-1,acc],[4,-1,acc]); // beret!
      break;
    case 'guitar':
      pixels.push([6,2,'#78350f'],[6,3,'#78350f'],[6,4,'#b45309'],[7,3,'#b45309']); // guitar
      break;
    case 'readglasses':
      pixels.push([1,0,'#1c3d2e'],[4,0,'#1c3d2e']); // reading glasses
      break;
  }

  // Offset: some pixels have negative coords, find min
  const minX = Math.min(...pixels.map(p => p[0]));
  const minY = Math.min(...pixels.map(p => p[1]));

  const shadow = pixels
    .map(([x, y, col]) => `${(x - minX) * s}px ${(y - minY) * s}px 0 0 ${col}`)
    .join(', ');

  const totalW = (Math.max(...pixels.map(p => p[0])) - minX + 1) * s;
  const totalH = (Math.max(...pixels.map(p => p[1])) - minY + 1) * s;

  const bounceAnim = status === 'active'
    ? 'pixelBounce 0.6s ease-in-out infinite alternate'
    : status === 'idle'
      ? `breathe 3.5s ease-in-out ${animDelay * 0.7}s infinite`
      : status === 'recent'
        ? `leanBack 4s ease-in-out ${animDelay}s infinite`
        : undefined;

  return (
    <div style={{
      width: s,
      height: s,
      boxShadow: shadow,
      marginRight: totalW - s,
      marginBottom: totalH - s,
      animation: bounceAnim,
    }} />
  );
}

/* ── Desk (SVG-style but in divs) ── */
function DeskUnit({
  x, y, monitors, active, nameplate, teacup, energyDrink, stickyNotes, paintSplats, bookStacks,
}: {
  x: number; y: number; monitors: number; active: boolean;
  nameplate?: string; teacup?: boolean; energyDrink?: boolean;
  stickyNotes?: boolean; paintSplats?: boolean; bookStacks?: boolean;
}) {
  return (
    <div style={{ position: 'absolute', left: x - 15, top: y + 34, pointerEvents: 'none' }}>
      {/* Monitors */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 2, justifyContent: 'center' }}>
        {Array.from({ length: monitors }).map((_, i) => (
          <div key={i} style={{
            width: monitors > 2 ? 11 : 14,
            height: 10,
            borderRadius: 2,
            backgroundColor: active ? '#0a1f0a' : '#1a1a2e',
            border: `1px solid ${active ? '#22c55e40' : '#27272a'}`,
            boxShadow: active ? '0 0 6px #22c55e30' : undefined,
            position: 'relative',
          }}>
            {/* Chart lines on ATLAS monitors */}
            {active && monitors >= 3 && (
              <div style={{ position: 'absolute', bottom: 2, left: 2, display: 'flex', gap: 1 }}>
                {['#22c55e','#3b82f6','#f97316'].slice(0, 2).map((c, j) => (
                  <div key={j} style={{ width: 1, height: 3 + j * 2, backgroundColor: c }} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Desk surface */}
      <div style={{
        width: Math.max(monitors * 16, 40),
        height: 8,
        borderRadius: 2,
        backgroundColor: '#8B7355',
        border: '1px solid #5c4d3a',
        position: 'relative',
      }}>
        {/* Coffee cup when active */}
        {active && (
          <div style={{
            position: 'absolute', right: -10, top: -6,
            width: 6, height: 7,
            backgroundColor: '#78350f', borderRadius: '0 0 2px 2px',
            border: '1px solid #92400e',
          }}>
            <div style={{
              position: 'absolute', top: -5, left: 1,
              fontSize: 6, color: '#a8a29e',
              animation: 'steamRise 2s ease-in-out infinite',
            }}>~</div>
          </div>
        )}
        {/* Teacup (SAGE) */}
        {teacup && (
          <div style={{
            position: 'absolute', right: -8, top: -4,
            width: 7, height: 5,
            backgroundColor: '#d4a574', borderRadius: '0 0 3px 3px',
            border: '1px solid #a16207',
          }} />
        )}
        {/* Energy drink (GRID) */}
        {energyDrink && (
          <div style={{
            position: 'absolute', left: -8, top: -6,
            width: 4, height: 8,
            backgroundColor: '#22d3ee', borderRadius: 1,
            border: '1px solid #06b6d4',
          }} />
        )}
        {/* Sticky notes (BUG) */}
        {stickyNotes && (
          <div style={{ position: 'absolute', right: -14, top: -10, display: 'flex', flexWrap: 'wrap', gap: 1, width: 12 }}>
            {['#fef08a','#fbcfe8','#a5f3fc'].map((c,i) => (
              <div key={i} style={{ width: 5, height: 5, backgroundColor: c, borderRadius: 1 }} />
            ))}
          </div>
        )}
        {/* Paint splatters (PIXEL) */}
        {paintSplats && (
          <div style={{ position: 'absolute', top: -2, left: 2, display: 'flex', gap: 3 }}>
            {['#dc2626','#3b82f6','#eab308','#22c55e'].map((c,i) => (
              <div key={i} style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: c, opacity: 0.7 }} />
            ))}
          </div>
        )}
        {/* Book stacks (VAULT) */}
        {bookStacks && (
          <>
            <div style={{ position: 'absolute', left: -12, top: -14, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['#dc2626','#3b82f6','#eab308'].map((c,i) => (
                <div key={i} style={{ width: 8, height: 3, backgroundColor: c, borderRadius: 1, opacity: 0.8 }} />
              ))}
            </div>
            <div style={{ position: 'absolute', right: -12, top: -10, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['#8b5cf6','#22c55e'].map((c,i) => (
                <div key={i} style={{ width: 8, height: 3, backgroundColor: c, borderRadius: 1, opacity: 0.8 }} />
              ))}
            </div>
          </>
        )}
      </div>
      {/* Nameplate */}
      {nameplate && (
        <div style={{
          fontSize: 6, fontFamily: 'monospace', color: '#a8a29e',
          textAlign: 'center', marginTop: 1,
        }}>{nameplate}</div>
      )}
    </div>
  );
}

/* ── Character + Desk combined, with walking ── */
function AgentUnit({
  agent, status, animDelay, selected, onClick, activityData,
}: {
  agent: AgentCfg; status: 'active' | 'recent' | 'idle';
  animDelay: number; selected: boolean; onClick: () => void;
  activityData?: { status?: 'active' | 'recent' | 'idle'; messageCount?: number; task?: string };
}) {
  const { deskPos, idleRoutine, id } = agent;
  const routineId = `walk-${id}`;

  // Only walk if idle and has a destination
  const dest = idleRoutine !== 'inplace'
    ? (idleRoutine === 'patrol'
      ? LOCATIONS.patrol2
      : LOCATIONS[idleRoutine as keyof typeof LOCATIONS])
    : null;
  const isMoving = status === 'idle' && dest != null;

  // Patrol is special: goes to patrol1 then patrol2 then back
  const isPatrol = idleRoutine === 'patrol' && status === 'idle';

  return (
    <>
      {/* Walking keyframes */}
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

      {/* The agent container */}
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
        {/* Active glow */}
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

        {/* Working indicator (typing dots) */}
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

        {/* Selection ring */}
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

        {/* Pixel character */}
        <PixelCharacter agent={agent} status={status} animDelay={animDelay} />

        {/* Name tag */}
        <div style={{
          fontSize: 7, fontFamily: 'monospace', fontWeight: 'bold',
          color: agent.color, textAlign: 'center', marginTop: 1,
          textShadow: '0 1px 3px rgba(0,0,0,0.9)',
          whiteSpace: 'nowrap',
        }}>
          {agent.emoji} {agent.name}
        </div>

        {/* Achievement badges */}
        <AchievementBadges agentId={agent.id} activity={activityData ?? { status, messageCount: 0 }} />
      </button>

      {/* Desk furniture (stays at desk position always) */}
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

/* ── Office Furniture ── */
function CoffeeMachine({ x, y }: { x: number; y: number }) {
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

function WaterCooler({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
      <div style={{
        width: 14, height: 22, backgroundColor: '#7dd3fc',
        borderRadius: '6px 6px 3px 3px', border: '1px solid #38bdf8', opacity: 0.8,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Bubbles */}
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

function Printer({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
      <div style={{
        width: 30, height: 20, backgroundColor: '#64748b',
        borderRadius: 2, border: '1px solid #94a3b8', position: 'relative',
      }}>
        {/* Paper tray */}
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

function Plant({ x, y, large }: { x: number; y: number; large?: boolean }) {
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

function Whiteboard({ x, y, label }: { x: number; y: number; label?: string }) {
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

function SprintBoard({ x, y }: { x: number; y: number }) {
  const { data, loading, error } = useSprintData();
  const [hoveredTask, setHoveredTask] = useState<any>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  // Fallback to static whiteboard look if data is loading/error
  if (loading || error || !data) {
    return (
      <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
        <div style={{
          width: 90, height: 65, backgroundColor: '#e5e7eb',
          borderRadius: 2, border: '2px solid #cbd5e1',
          padding: 4, display: 'flex', flexWrap: 'wrap', gap: 2,
        }}>
          {['#fef08a','#fbcfe8','#a5f3fc','#bbf7d0','#fecaca','#fde68a'].map((c, i) => (
            <div key={i} style={{ width: 8, height: 8, backgroundColor: c, borderRadius: 1 }} />
          ))}
        </div>
        <div style={{ fontSize: 6, fontFamily: 'monospace', color: '#94a3b8', textAlign: 'center', marginTop: 1 }}>
          Sprint Board{loading ? ' (loading...)' : error ? ' (error)' : ''}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return '#22c55e';
      case 'in-progress': return '#fbbf24';
      default: return '#9ca3af';
    }
  };

  const handleTaskHover = (task: any, event: React.MouseEvent) => {
    setHoveredTask(task);
    setHoverPosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <>
      <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'auto' }}>
        {/* Progress bar at top */}
        <div style={{
          width: 90, height: 4, backgroundColor: '#e5e7eb',
          borderRadius: 2, marginBottom: 2, overflow: 'hidden',
        }}>
          <div style={{
            width: `${(data.summary.done / data.summary.total) * 100}%`,
            height: '100%', backgroundColor: '#22c55e',
            transition: 'width 0.3s ease',
          }} />
        </div>
        
        {/* Progress text */}
        <div style={{ fontSize: 6, fontFamily: 'monospace', color: '#374151', textAlign: 'center', marginBottom: 2 }}>
          {data.summary.done}/{data.summary.total} done
        </div>
        
        {/* Sprint board container */}
        <div style={{
          width: 90, height: 65, backgroundColor: '#e5e7eb',
          borderRadius: 2, border: '2px solid #cbd5e1',
          padding: 4, display: 'flex', flexWrap: 'wrap', gap: 2,
          position: 'relative',
        }}>
          {data.tasks.slice(0, 12).map((task) => (
            <div
              key={task.id}
              style={{
                width: 12, height: 8, borderRadius: 1,
                backgroundColor: getStatusColor(task.status),
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 6, fontWeight: 'bold', color: '#fff',
                transition: 'background-color 0.2s ease, transform 0.1s ease',
                transform: hoveredTask?.id === task.id ? 'scale(1.1)' : 'scale(1)',
              }}
              onMouseEnter={(e) => handleTaskHover(task, e)}
              onMouseLeave={() => setHoveredTask(null)}
            >
              {task.status === 'done' && '✓'}
            </div>
          ))}
        </div>
        
        <div style={{ fontSize: 6, fontFamily: 'monospace', color: '#94a3b8', textAlign: 'center', marginTop: 1 }}>
          Sprint Board
        </div>
      </div>

      {/* Tooltip */}
      {hoveredTask && (
        <div style={{
          position: 'fixed',
          left: hoverPosition.x + 10,
          top: hoverPosition.y - 10,
          backgroundColor: '#1f2937',
          color: '#fff',
          padding: '6px 8px',
          borderRadius: 4,
          fontSize: 8,
          fontFamily: 'monospace',
          maxWidth: 200,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          pointerEvents: 'none',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: 2 }}>
            #{hoveredTask.task_number}: {hoveredTask.title}
          </div>
          <div style={{ color: '#d1d5db', fontSize: 7, marginBottom: 2 }}>
            Status: {hoveredTask.status}
          </div>
          <div style={{ color: '#d1d5db', fontSize: 7 }}>
            {hoveredTask.description}
          </div>
        </div>
      )}
    </>
  );
}

function Bookshelf({ x, y }: { x: number; y: number }) {
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

function Couch({ x, y }: { x: number; y: number }) {
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

function ConferenceTable({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
      <div style={{
        width: 80, height: 40, borderRadius: '50%',
        backgroundColor: '#8B7355', border: '2px solid #6b5a3e',
      }} />
      {/* Chairs around */}
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

function GuitarStand({ x, y }: { x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}>
      <div style={{ width: 10, height: 14, backgroundColor: '#92400e', borderRadius: '50%', border: '1px solid #b45309' }} />
      <div style={{ width: 3, height: 20, backgroundColor: '#78350f', marginLeft: 3, marginTop: -2, borderRadius: 1 }} />
    </div>
  );
}

function Amp({ x, y }: { x: number; y: number }) {
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

function Door({ x, y }: { x: number; y: number }) {
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

function Poster({ x, y, text }: { x: number; y: number; text: string }) {
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

function WallClock({ x, y }: { x: number; y: number }) {
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

/* ── Neon Sign ── */
function NeonSign({ x, y, text }: { x: number; y: number; text: string }) {
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
function NeonLine({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
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
function FloorZone({ x, y, w, h, tint, label, dashed }: { x: number; y: number; w: number; h: number; tint: string; label: string; dashed?: boolean }) {
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
function GlassWall({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h,
      border: '1px solid #3b82f618', borderRadius: 4,
      pointerEvents: 'none',
    }} />
  );
}

/* ── Interaction Lines between active agents ── */
function InteractionLines({ activeIds }: { activeIds: string[] }) {
  if (activeIds.length < 2) return null;
  const lines: { from: AgentCfg; to: AgentCfg }[] = [];
  for (let i = 0; i < activeIds.length && i < 4; i++) {
    for (let j = i + 1; j < activeIds.length && j < 4; j++) {
      const a = AGENT_MAP[activeIds[i]];
      const b = AGENT_MAP[activeIds[j]];
      if (a && b) lines.push({ from: a, to: b });
    }
  }
  // Limit lines to avoid visual noise (per SPEC: reduce opacity when >5)
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

/* ── Global Metrics Bar (per SPEC §4.1) ── */
function MetricsBar({ activity }: { activity: Record<string, ActivityItem> }) {
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

/* ── Conversation Panel (extracted to conversation-panel.tsx) ── */

/* ══════════════════════════════════════════
   ██  MAIN COMPONENT
   ══════════════════════════════════════════ */
export function LivingOffice() {
  const { theme } = useOfficeTheme();
  const [activity, setActivity] = useState<Record<string, ActivityItem>>({});
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [spawnAnimations, setSpawnAnimations] = useState<Array<{ id: string; parentId: string; childId: string; reverse: boolean; startTime: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iv = setInterval(() => setCurrentHour(new Date().getHours()), 60_000);
    return () => clearInterval(iv);
  }, []);

  const getAmbientOverlay = () => {
    const h = currentHour;
    if (h >= 6 && h < 9) return { color: 'rgba(251, 146, 60, 0.1)', label: '🌅' };
    if (h >= 9 && h < 17) return { color: 'transparent', label: '☀️' };
    if (h >= 17 && h < 20) return { color: 'rgba(245, 158, 11, 0.15)', label: '🌇' };
    return { color: 'rgba(30, 58, 138, 0.2)', label: '🌙' };
  };
  const isNight = currentHour >= 20 || currentHour < 6;
  const ambient = getAmbientOverlay();

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch('/api/activity');
      const data = await res.json();
      const map: Record<string, ActivityItem> = {};
      const statusPriority = { active: 3, recent: 2, idle: 1 };
      (data.activity ?? []).forEach((a: ActivityItem) => {
        const existing = map[a.agent];
        // Keep the entry with the best status (active > recent > idle)
        if (!existing || (statusPriority[a.status] ?? 0) > (statusPriority[existing.status] ?? 0)) {
          map[a.agent] = a;
        }
      });
      setActivity(map);
    } catch { /* noop */ }
  }, []);

  // ResizeObserver to handle fluid width scaling
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newScale = Math.min(containerWidth / FLOOR_W, 1.2); // cap at 120% to avoid getting too large
        setScale(newScale);
      }
    };

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(containerRef.current);
    
    // Initial scale calculation
    updateScale();
    
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    fetchActivity();
    
    // Reduce polling frequency to 30s (SSE is now primary)
    const iv = setInterval(fetchActivity, 30000);
    
    // Add SSE subscription to /api/stream
    const eventSource = new EventSource('/api/stream');
    
    const handleSSEReconnect = () => {
      console.log('[SSE] Reconnecting...');
      // Re-fetch activity on reconnection to ensure consistency
      fetchActivity();
    };
    
    eventSource.addEventListener('activity', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.agent && data.status) {
          // Immediately update the agent status map
          setActivity(prev => ({
            ...prev,
            [data.agent]: {
              ...prev[data.agent],
              agent: data.agent,
              status: data.status,
              timestamp: data.timestamp,
              // Keep other fields from existing activity or use defaults
              task: prev[data.agent]?.task ?? '',
              messageCount: prev[data.agent]?.messageCount ?? 0,
            }
          }));
        }
        // Detect spawn events for animation
        if (data.type === 'spawn' && data.parentAgent && data.agent) {
          const animId = `spawn-${Date.now()}`;
          setSpawnAnimations(prev => [...prev, {
            id: animId, parentId: data.parentAgent, childId: data.agent, reverse: false, startTime: Date.now()
          }]);
          playSpawn();
          setTimeout(() => setSpawnAnimations(prev => prev.filter(a => a.id !== animId)), 10000);
        }
      } catch (err) {
        console.warn('[SSE] Failed to parse activity event:', err);
      }
    });
    
    eventSource.addEventListener('connected', handleSSEReconnect);
    eventSource.addEventListener('ping', () => { /* keep alive */ });
    
    eventSource.addEventListener('error', (event) => {
      console.warn('[SSE] Connection error, will retry');
    });
    
    return () => {
      clearInterval(iv);
      eventSource.close();
    };
  }, [fetchActivity]);

  const getStatus = (id: string): 'active' | 'recent' | 'idle' => activity[id]?.status ?? 'idle';

  const handleSelect = (id: string) => {
    setSelectedAgent(prev => prev === id ? null : id);
  };

  // Click outside office to deselect
  const handleFloorClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.floor) {
      setSelectedAgent(null);
    }
  };

  const activeIds = AGENTS.filter(a => getStatus(a.id) === 'active').map(a => a.id);

  return (
    <div style={{ fontFamily: 'monospace' }}>
      {/* ── GLOBAL KEYFRAMES ── */}
      <style>{`
        @keyframes pixelBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes breathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
        }
        @keyframes leanBack {
          0%, 85%, 100% { transform: translateX(0); }
          90% { transform: translateX(2px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes typingDot {
          0%, 80%, 100% { opacity: 0.2; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }
        @keyframes typeLeft {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-2px) rotate(-5deg); }
        }
        @keyframes typeRight {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-2px) rotate(5deg); }
        }
        @keyframes strum {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(8deg); }
          75% { transform: rotate(-8deg); }
        }
        @keyframes steamRise {
          0% { transform: translateY(0); opacity: 0.4; }
          100% { transform: translateY(-8px); opacity: 0; }
        }
        @keyframes bubbleRise {
          0% { transform: translateY(0); opacity: 0.6; }
          100% { transform: translateY(-14px); opacity: 0; }
        }
        @keyframes ledBlink {
          0%, 45%, 55%, 100% { opacity: 1; }
          50% { opacity: 0.15; }
        }
        @keyframes neonFlicker {
          0%, 93%, 95%, 97%, 100% { opacity: 1; }
          94% { opacity: 0.8; }
          96% { opacity: 0.95; }
          98% { opacity: 0.85; }
        }
        @keyframes colonBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0.3; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes linePulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* ── METRICS BAR ── */}
      <MetricsBar activity={activity} />

      {/* ── OFFICE FLOOR CONTAINER ── */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          maxWidth: '1200px',
          height: FLOOR_H * scale,
          margin: '0 auto',
          overflow: 'hidden',
        }}
      >
        <div
          data-floor="true"
          onClick={handleFloorClick}
          style={{
            position: 'relative',
            width: FLOOR_W,
            height: FLOOR_H,
            background: theme.floorBg,
            borderRadius: 12,
            border: `2px solid ${theme.floorBorder}`,
            overflow: 'hidden',
            transform: `perspective(1000px) rotateX(2deg) scale(${scale})`,
            transformOrigin: 'top left',
            boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          }}
        >
        {/* Neon accent lines (ceiling/walls) */}
        <NeonLine x1={0} y1={1} x2={FLOOR_W} y2={1} />
        <NeonLine x1={1} y1={0} x2={1} y2={FLOOR_H} />
        <NeonLine x1={FLOOR_W - 1} y1={0} x2={FLOOR_W - 1} y2={FLOOR_H} />

        {/* ── FLOOR ZONES ── */}
        <FloorZone x={15} y={40} w={190} h={140} tint="#dc262610" label="🔴 Boss Office" dashed />
        <FloorZone x={220} y={40} w={250} h={140} tint="#64748b08" label="Conference" dashed />
        <FloorZone x={480} y={40} w={180} h={140} tint="#3b82f608" label="Kitchen" dashed />
        <FloorZone x={20} y={200} w={450} h={110} tint="#8b5cf610" label="⚡ Engineering" dashed />
        <FloorZone x={480} y={200} w={300} h={110} tint="#ec489910" label="🎨 Creative" dashed />
        <FloorZone x={20} y={335} w={290} h={110} tint="#f9731610" label="📋 Strategy" dashed />
        <FloorZone x={380} y={335} w={420} h={110} tint="#06b6d410" label="🧪 Labs" dashed />
        <FloorZone x={270} y={470} w={360} h={80} tint="#a78bfa08" label="☕ Break Area" />

        {/* Glass walls (MCP office + strategy room) */}
        <GlassWall x={13} y={38} w={194} h={144} />
        <GlassWall x={218} y={38} w={254} h={144} />

        {/* ── NEON SIGN + CLOCK ── */}
        <NeonSign x={340} y={10} text="GRID HQ" />
        <WallClock x={840} y={12} />

        {/* ── CONFERENCE ROOM ── */}
        <ConferenceTable x={280} y={80} />
        <SprintBoard x={230} y={42} />

        {/* ── KITCHEN ── */}
        <CoffeeMachine x={LOCATIONS.coffee.x} y={LOCATIONS.coffee.y} />
        <WaterCooler x={LOCATIONS.water.x} y={LOCATIONS.water.y} />
        <Plant x={630} y={60} />

        {/* ── MCP OFFICE EXTRAS ── */}
        <Plant x={170} y={50} large />
        <Bookshelf x={15} y={100} />

        {/* ── CREATIVE NOOK EXTRAS ── */}
        <Whiteboard x={750} y={205} label="Mood Board" />

        {/* ── STRATEGY ROOM EXTRAS ── */}
        <Whiteboard x={250} y={340} label="Roadmap" />

        {/* ── MUSIC LAB / RIFF EXTRAS ── */}
        <GuitarStand x={600} y={348} />
        <Amp x={620} y={390} />

        {/* ── LIBRARY / VAULT EXTRAS ── */}
        <Bookshelf x={740} y={340} />
        <Bookshelf x={740} y={390} />

        {/* ── BREAK AREA ── */}
        <Couch x={400} y={486} />
        <Printer x={LOCATIONS.printer.x} y={LOCATIONS.printer.y} />

        {/* ── SCATTERED DECORATIONS ── */}
        <Plant x={440} y={195} />
        <Plant x={20} y={460} />
        <Plant x={820} y={460} large />
        <Poster x={680} y={10} text="🚀 SHIP IT" />
        <Poster x={120} y={10} text="LGTM ✅" />
        <Door x={80} y={520} />

        {/* ── INTERACTION LINES ── */}
        <InteractionLines activeIds={activeIds} />

        {/* ── AGENTS ── */}
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

        {/* Day/Night ambient overlay */}
          {ambient.color !== 'transparent' && (
            <div style={{
              position: 'absolute', inset: 0,
              backgroundColor: ambient.color,
              pointerEvents: 'none', zIndex: 6,
              borderRadius: 12,
              transition: 'background-color 60s ease',
            }} />
          )}

          {/* Night Zzz for idle agents */}
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

          {/* Spawn connection animations */}
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

          {/* Visitor indicator */}
          <VisitorIndicator />

          {/* Clock in corner */}
          <div style={{
            position: 'absolute', right: 8, bottom: 8,
            fontSize: 10, fontFamily: 'monospace', color: '#475569',
            pointerEvents: 'none', zIndex: 20,
          }}>
            {ambient.label} {new Date().getHours().toString().padStart(2, '0')}:{new Date().getMinutes().toString().padStart(2, '0')}
          </div>

        {/* Dim overlay when agent selected */}
        {selectedAgent && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            pointerEvents: 'none', zIndex: 8,
          }} />
        )}
        </div>
      </div>

      {/* ── STATUS PILLS ── */}
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

      {/* ── CONVERSATION PANEL ── */}
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
