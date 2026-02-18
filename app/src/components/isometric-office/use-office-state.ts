'use client'

import { useState, useEffect, useCallback } from 'react'
import { ActivityItem, AgentPosition, MeetingState, AGENTS } from './types'

/* ── Hash for deterministic randomness ── */
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h);
}

/* ── Idle behaviors with weights ── */
type IdleBehavior = 'desk' | 'coffee' | 'lounge' | 'chat' | 'stretch' | 'wander';

const BEHAVIOR_WEIGHTS: { behavior: IdleBehavior; weight: number }[] = [
  { behavior: 'desk',    weight: 55 },  // Most time at desk
  { behavior: 'coffee',  weight: 12 },  // Coffee run
  { behavior: 'chat',    weight: 15 },  // Chat near someone's desk
  { behavior: 'lounge',  weight: 8 },   // Chill on couch
  { behavior: 'stretch', weight: 5 },   // Stand near desk stretching
  { behavior: 'wander',  weight: 5 },   // Walking around
];

const TOTAL_WEIGHT = BEHAVIOR_WEIGHTS.reduce((s, b) => s + b.weight, 0);

function pickBehavior(agentId: string, cycle: number): IdleBehavior {
  const roll = hash(agentId + ':' + cycle) % TOTAL_WEIGHT;
  let acc = 0;
  for (const { behavior, weight } of BEHAVIOR_WEIGHTS) {
    acc += weight;
    if (roll < acc) return behavior;
  }
  return 'desk';
}

/* ── Position generators per behavior ── */

// Coffee machine area (inside Lounge room: x=370, y=30, w=575, h=155)
const COFFEE_SPOTS = [
  { x: 480, y: 95 }, { x: 495, y: 105 }, { x: 470, y: 110 },
];

// Lounge couch spots (near couches in Lounge)
const LOUNGE_SPOTS = [
  { x: 410, y: 90 }, { x: 430, y: 90 }, { x: 450, y: 90 },
  { x: 410, y: 125 }, { x: 430, y: 125 }, { x: 450, y: 125 },
];

// Wander points (inside rooms, not hallways)
const WANDER_SPOTS = [
  { x: 250, y: 110 }, { x: 600, y: 100 }, { x: 750, y: 110 },
  { x: 200, y: 300 }, { x: 500, y: 300 }, { x: 700, y: 300 },
  { x: 200, y: 470 }, { x: 500, y: 470 },
];

function getIdlePosition(agentId: string, behavior: IdleBehavior, cycle: number): { x: number; y: number } {
  const agent = AGENTS.find(a => a.id === agentId);
  if (!agent) return { x: 100, y: 100 };
  
  const h = hash(agentId + ':pos:' + cycle);
  
  switch (behavior) {
    case 'desk':
    case 'stretch':
      // At or near their desk (stretch = standing next to desk)
      const deskPos = agent.deskPos;
      const offsetX = behavior === 'stretch' ? (h % 20) - 10 : 0;
      const offsetY = behavior === 'stretch' ? 15 + (h % 10) : 0;
      return { x: deskPos.x + offsetX, y: deskPos.y + offsetY };
    
    case 'coffee':
      return COFFEE_SPOTS[h % COFFEE_SPOTS.length];
    
    case 'lounge':
      return LOUNGE_SPOTS[h % LOUNGE_SPOTS.length];
    
    case 'chat': {
      // Go near another agent's desk
      const others = AGENTS.filter(a => a.id !== agentId);
      const target = others[h % others.length];
      return {
        x: target.deskPos.x + 25 + (h % 15),
        y: target.deskPos.y + 10 + (h % 10),
      };
    }
    
    case 'wander':
      return WANDER_SPOTS[h % WANDER_SPOTS.length];
    
    default:
      return agent.deskPos;
  }
}

/* ── Meeting detection ── */
// Brief standup when SPEC activates, then agents go back to their desks to work
const MEETING_DURATION_MS = 30_000; // 30 seconds standup
const BOSS_AGENTS = ['mcp']; // Bosses don't attend standups
let meetingStartedAt: number | null = null;
let lastSpecActive = false;

function detectMeeting(activity: Record<string, ActivityItem>): MeetingState | null {
  const spec = activity['spec'];
  const specActive = spec?.status === 'active';
  
  // SPEC just became active → start meeting timer
  if (specActive && !lastSpecActive) {
    meetingStartedAt = Date.now();
  }
  // SPEC no longer active → reset
  if (!specActive) {
    lastSpecActive = false;
    meetingStartedAt = null;
    return null;
  }
  lastSpecActive = specActive;
  
  // Meeting expired → agents go back to desks
  if (!meetingStartedAt || Date.now() - meetingStartedAt > MEETING_DURATION_MS) {
    return null;
  }
  
  // Only active workers (not bosses) join the standup
  const participants = Object.entries(activity)
    .filter(([id, item]) => item.status === 'active' && id !== 'spec' && !BOSS_AGENTS.includes(id) && AGENTS.some(a => a.id === id))
    .map(([id]) => id);
  
  if (participants.length === 0) return null;
  
  return {
    active: true,
    orchestrator: 'spec',
    participants,
    topic: spec?.task || 'Sprint Standup',
    startTime: meetingStartedAt,
  };
}

/* ── Behavior cycle: changes every 20-40 seconds per agent ── */
function getBehaviorCycle(agentId: string): number {
  // Each agent has a different cycle length (20-40s) so they don't all move at once
  const cycleLength = 20000 + (hash(agentId + ':cycle') % 20000);
  return Math.floor(Date.now() / cycleLength);
}

/* ── Chat bubble text ── */
const CHAT_BUBBLES = ['💬', '😄', '🤔', '👍', '☕', '💡', '😂', '🎯', '✨', '🔥'];

function getChatBubble(agentId: string, cycle: number): string {
  return CHAT_BUBBLES[hash(agentId + ':bubble:' + cycle) % CHAT_BUBBLES.length];
}

/* ═══ MAIN HOOK ═══ */
export function useOfficeState(activity: Record<string, ActivityItem>) {
  const [agentStates, setAgentStates] = useState<Record<string, {
    position: { x: number; y: number; state?: string; activity?: string };
    behavior: IdleBehavior;
    chatBubble?: string;
    chatTarget?: string;
  }>>({});
  const [meetingState, setMeetingState] = useState<MeetingState | null>(null);

  // Initialize all agents at their desks
  useEffect(() => {
    const initial: typeof agentStates = {};
    AGENTS.forEach(agent => {
      initial[agent.id] = {
        position: { x: agent.deskPos.x, y: agent.deskPos.y, state: 'idle' },
        behavior: 'desk',
      };
    });
    setAgentStates(initial);
  }, []);

  // Update positions based on activity + idle behavior cycle
  const updatePositions = useCallback(() => {
    const meeting = detectMeeting(activity);
    setMeetingState(meeting);

    setAgentStates(prev => {
      const next = { ...prev };
      
      AGENTS.forEach(agent => {
        const activityItem = activity[agent.id];
        const isActive = activityItem?.status === 'active';
        const isRecent = activityItem?.status === 'recent';
        const inMeeting = meeting?.active && 
          (meeting.orchestrator === agent.id || meeting.participants.includes(agent.id));
        
        // Active agents go to their desk
        if (isActive && !inMeeting) {
          next[agent.id] = {
            position: { x: agent.deskPos.x, y: agent.deskPos.y, state: 'active' },
            behavior: 'desk',
          };
          return;
        }
        
        // Recent agents stay at desk
        if (isRecent) {
          next[agent.id] = {
            position: { x: agent.deskPos.x, y: agent.deskPos.y, state: 'recent' },
            behavior: 'desk',
          };
          return;
        }
        
        // Meeting agents go to meeting room
        if (inMeeting) {
          const meetingChairs = [
            // Around table — 2 rows
            { x: 720, y: 400 }, { x: 755, y: 400 }, { x: 790, y: 400 }, { x: 825, y: 400 },
            { x: 720, y: 460 }, { x: 755, y: 460 }, { x: 790, y: 460 }, { x: 825, y: 460 },
            // Sides
            { x: 860, y: 420 }, { x: 860, y: 450 },
            // Standing room
            { x: 700, y: 420 }, { x: 700, y: 450 },
            { x: 740, y: 480 }, { x: 800, y: 480 },
          ];
          const isPresenter = agent.id === meeting!.orchestrator;
          const idx = isPresenter ? -1 : meeting!.participants.indexOf(agent.id);
          const pos = isPresenter
            ? { x: 760, y: 385 }  // SPEC at the whiteboard
            : meetingChairs[idx % meetingChairs.length];
          
          next[agent.id] = {
            position: { x: pos.x, y: pos.y, state: 'meeting' },
            behavior: 'desk',
          };
          return;
        }
        
        // Idle agents: pick behavior based on cycle
        const cycle = getBehaviorCycle(agent.id);
        const prevBehavior = prev[agent.id]?.behavior || 'desk';
        const newBehavior = pickBehavior(agent.id, cycle);
        const targetPos = getIdlePosition(agent.id, newBehavior, cycle);
        
        const prevPos = prev[agent.id]?.position;
        const moved = prevPos && (Math.abs(prevPos.x - targetPos.x) > 15 || Math.abs(prevPos.y - targetPos.y) > 15);
        
        // Chat bubble when chatting
        const chatBubble = newBehavior === 'chat' ? getChatBubble(agent.id, cycle) : undefined;
        const chatTarget = newBehavior === 'chat'
          ? AGENTS.filter(a => a.id !== agent.id)[hash(agent.id + ':pos:' + cycle) % (AGENTS.length - 1)]?.id
          : undefined;
        
        next[agent.id] = {
          position: {
            x: targetPos.x,
            y: targetPos.y,
            state: moved && prevBehavior !== newBehavior ? 'walking' : 'idle',
            activity: newBehavior,
          },
          behavior: newBehavior,
          chatBubble,
          chatTarget,
        };
        
        // After walking, settle into position
        if (moved && prevBehavior !== newBehavior) {
          setTimeout(() => {
            setAgentStates(p => ({
              ...p,
              [agent.id]: {
                ...p[agent.id],
                position: { ...p[agent.id].position, state: 'idle' },
              },
            }));
          }, 1500);
        }
      });
      
      return next;
    });
  }, [activity]);

  // Run on activity change
  useEffect(() => {
    updatePositions();
  }, [updatePositions]);

  // Behavior cycle tick (every 5s check if any agent's cycle changed)
  useEffect(() => {
    const iv = setInterval(updatePositions, 5000);
    return () => clearInterval(iv);
  }, [updatePositions]);

  // Build agentPositions map for backward compat
  const agentPositions: Record<string, { x: number; y: number; state?: string; activity?: string }> = {};
  Object.entries(agentStates).forEach(([id, state]) => {
    agentPositions[id] = state.position;
  });

  return {
    agentPositions,
    agentStates,
    meetingState,
  };
}
