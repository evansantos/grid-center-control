# Office Redesign Brief — "Living Office"

## Vision
Transform the current static isometric office into an **animated, living workspace** — think Habbo Hotel meets a cozy indie game office sim. The office should feel alive, fun, and tell a story about what the team is doing.

## Current State
- `src/components/isometric-office/` — 7 files, ~1100 lines
- CSS-in-JS (inline styles), no external animation lib
- 14 agents in 5 zones (Boss, Engineering, Creative, Strategy, Labs)
- Characters are blocky cube-people with emoji accessories
- Minimal animations: bounce (active), breathe (idle), typing dots
- Static positions — agents never move

## Design Goals

### 1. Humanized Avatars
- Replace current cube-people with **small humanoid pixel-art avatars** (think RPG/Habbo style)
- Each agent should have a **unique look**: hair style, outfit color matching their team color, accessories
- Proportions: ~48×64px sprites, chibi/cute style
- CSS-only (no sprite sheets needed) — build from div layers: legs, torso, head, hair, accessories

### 2. State-Based Animations
Agents have 3 states from the API: `active`, `recent`, `idle`

**Active (working):**
- Agent sits at their desk, facing a small monitor/laptop
- Typing animation (hands moving on keyboard)
- Screen glows with their team color
- Small code/text particles floating up from screen
- Status bubble: "coding..." / "reviewing..." / "designing..."

**Idle (no work):**
- Agent walks to the **Common Area** (center of office — coffee machine, couch, plants)
- Idle animations cycle: drinking coffee ☕, chatting with other idle agents, reading, stretching
- Gentle bobbing/breathing animation
- Thought bubbles with random emojis

**Meeting (SPEC orchestrating):**
- When SPEC is active, all agents assigned to that task move to the **Meeting Room**
- Meeting room has a table, whiteboard, chairs
- SPEC stands at the whiteboard
- Other agents sit around the table
- Whiteboard shows task name/project name
- Subtle "discussion" animation (speech bubbles alternating)

### 3. Room Layout
```
┌─────────────────────────────────────────────────┐
│  🔴 BOSS OFFICE     │    ☕ COMMON AREA         │
│  [MCP] [CEO]        │  [couch] [coffee] [plant] │
│                      │  (idle agents hang here)   │
├──────────────────────┴──────────────────────────│
│  ⚡ ENGINEERING          │  🎨 CREATIVE          │
│  [desks with monitors]   │  [easel] [drawing tab] │
│                          │                        │
├──────────────────────────┴────────────────────── │
│  📋 MEETING ROOM    │  🧪 LABS                   │
│  [table] [chairs]   │  [desks] [equipment]       │
│  [whiteboard]        │                            │
└─────────────────────────────────────────────────┘
```

### 4. Furniture & Props (all CSS/div-based)
- **Desks**: L-shaped or simple, with monitor showing colored screen
- **Chairs**: Small office chairs (swivel implied)
- **Coffee machine**: Animated steam when agents near
- **Couch**: For idle agents to sit on
- **Plants**: Subtle leaf sway animation
- **Whiteboard**: Shows current project/sprint name
- **Meeting table**: Oval/round, appears in meeting room
- **Books/shelves** in Labs
- **Drawing tablet/easel** in Creative

### 5. Transitions & Movement
- Agents should **smoothly walk** between positions (CSS transition on left/top, 1-2s)
- When status changes: idle→active = walk from common area to desk
- When status changes: active→idle = walk from desk to common area
- Walking animation: alternating leg movement (translateY oscillation)
- Arrival: small "pop" or sit-down animation

### 6. Ambient Life
- Floating particles: small dots drifting slowly (like dust motes)
- Clock shows real time
- Day/night cycle: subtle background tint based on hour (warm during day, cool at night)
- Random events every 30-60s: plant leaf falls, coffee steam puff, agent stretches
- Neon "GRID HQ" sign flickers subtly

### 7. Interaction
- Click agent → panel slides in (existing feature, keep it)
- Hover agent → tooltip with name, role, current status
- Click zone → zoom slightly into that area

## Tech Constraints
- **Pure CSS animations** — no Framer Motion, GSAP, etc. (keep bundle small)
- **Inline styles + CSS keyframes** (existing pattern)
- **No sprite sheets/images** — all characters built from CSS divs
- **Next.js 16 + React 19** (existing stack)
- **Must remain performant** — requestAnimationFrame only if needed
- Keep polling from `/api/activity` (15s interval)
- Mobile: hide office or show simplified version

## File Structure (proposed)
```
src/components/isometric-office/
  index.tsx              — main orchestrator (routing, state, layout)
  types.ts               — types, agent configs, positions
  office-keyframes.ts    — all CSS keyframe definitions  
  office-floor.tsx       — floor, zones, ambient elements
  agent-avatar.tsx       — NEW: humanized CSS avatar component
  agent-desk.tsx         — desk + monitor + chair unit
  common-area.tsx        — coffee machine, couch, idle zone
  meeting-room.tsx       — meeting table, whiteboard, chairs
  furniture.tsx          — reusable furniture components
  use-office-state.ts    — hook: manages positions, transitions, states
  agent-message-panel.tsx — existing, keep
```

## Priority
1. Avatar redesign (most visual impact)
2. State-based positioning (idle→common, active→desk)
3. Animations (typing, walking, idle activities)
4. Meeting room mechanic
5. Ambient life & polish
