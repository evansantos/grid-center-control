# Office Redesign Visual Spec — "Living Office"

*Transform the static isometric office into an animated, living workspace*

---

## 1. Avatar Design System

### Base Specifications
- **Canvas size:** 48w × 64h px
- **Style:** Pixel-art humanoid, built from CSS divs (no images)
- **Structure:** Layered divs for body parts
- **Animation target:** GPU-accelerated transforms (translate, scale, rotate, opacity)

### Avatar Construction Layers (bottom to top)
```css
.avatar-container {
  position: relative;
  width: 48px;
  height: 64px;
  transform-style: preserve-3d;
}
```

#### Layer 1: Shadow & Base
```css
.avatar-shadow {
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  filter: blur(2px);
}
```

#### Layer 2: Legs
```css
.avatar-legs {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 22px;
  display: flex;
  justify-content: space-between;
}

.avatar-leg {
  width: 8px;
  height: 22px;
  background: linear-gradient(180deg, #4a5568 0%, #2d3748 100%);
  border-radius: 4px 4px 2px 2px;
  border: 1px solid #1a202c;
}

.avatar-leg::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: -1px;
  width: 10px;
  height: 6px;
  background: #2d3748;
  border-radius: 3px;
  border: 1px solid #1a202c;
}
```

#### Layer 3: Torso
```css
.avatar-torso {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 26px;
  border-radius: 6px 6px 2px 2px;
  border: 1px solid currentColor;
  background: linear-gradient(180deg, var(--agent-color) 0%, var(--agent-color-dark) 100%);
}

.avatar-torso::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 2px;
  width: 20px;
  height: 6px;
  background: var(--agent-color);
  border-radius: 3px 3px 0 0;
  transform: perspective(50px) rotateX(30deg);
  opacity: 0.8;
}
```

#### Layer 4: Arms
```css
.avatar-arms {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 14px;
  display: flex;
  justify-content: space-between;
}

.avatar-arm {
  width: 6px;
  height: 14px;
  background: #fcd34d;
  border-radius: 3px;
  border: 1px solid #f59e0b;
  transform-origin: top center;
}
```

#### Layer 5: Head
```css
.avatar-head {
  position: absolute;
  bottom: 36px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 18px;
  background: linear-gradient(180deg, #fcd34d 0%, #f59e0b 100%);
  border-radius: 6px;
  border: 1px solid #d97706;
}

.avatar-eyes {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
}

.avatar-eye {
  width: 3px;
  height: 3px;
  background: #1e293b;
  border-radius: 50%;
}

.avatar-mouth {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 1px;
  background: #7c2d12;
  border-radius: 1px;
}
```

#### Layer 6: Hair (varies per agent)
```css
.avatar-hair {
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 22px;
  height: 8px;
  border-radius: 4px 4px 0 0;
}
```

#### Layer 7: Accessory
```css
.avatar-accessory {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}
```

### Individual Agent Specifications

#### MCP (👑 Orchestrator)
```css
--agent-color: #dc2626;
--agent-color-dark: #991b1b;
--hair-color: #374151;
--accessory: '👑';
--accessory-top: -12px;
```
- Hair: Slicked back, dark gray
- Outfit: Deep red suit with subtle pinstripes
- Special: Golden crown accessory, slightly larger than others

#### CEO (👔 Chief Executive)
```css
--agent-color: #d97706;
--agent-color-dark: #92400e;
--hair-color: #6b7280;
--accessory: '👔';
```
- Hair: Professional gray, parted
- Outfit: Executive orange suit
- Special: Tie pattern visible on torso

#### GRID (⚡ Frontend)
```css
--agent-color: #7c3aed;
--agent-color-dark: #5b21b6;
--hair-color: #22d3ee;
--accessory: '💻';
```
- Hair: Electric blue, spiky/modern
- Outfit: Purple hoodie with lightning patterns
- Special: Laptop bag accessory

#### SENTINEL (🛡️ Security)
```css
--agent-color: #0ea5e9;
--agent-color-dark: #0369a1;
--hair-color: #475569;
--accessory: '🛡️';
```
- Hair: Military-style buzz cut
- Outfit: Blue tactical vest
- Special: Shield emblem on chest

#### BUG (🪲 QA Engineer)
```css
--agent-color: #22c55e;
--agent-color-dark: #16a34a;
--hair-color: #84cc16;
--accessory: '🔍';
```
- Hair: Green, slightly messy
- Outfit: Green lab coat over t-shirt
- Special: Magnifying glass, large circular glasses

#### ARCH (🏛️ Architect)
```css
--agent-color: #7c3aed;
--agent-color-dark: #5b21b6;
--hair-color: #64748b;
--accessory: '📐';
```
- Hair: Silver, well-kempt
- Outfit: Purple blazer, very structured
- Special: Ruler/T-square pattern on outfit

#### DEV (🔧 Engineer)
```css
--agent-color: #0ea5e9;
--agent-color-dark: #0369a1;
--hair-color: #475569;
--accessory: '⚙️';
```
- Hair: Dark, casual
- Outfit: Blue denim jacket over graphic tee
- Special: Gear patterns on jacket

#### PIXEL (🎨 Designer)
```css
--agent-color: #f43f5e;
--agent-color-dark: #e11d48;
--hair-color: #ec4899;
--accessory: '🎨';
```
- Hair: Pink, artistic/wavy
- Outfit: Rose art smock with paint splatters
- Special: Artist beret, paintbrush in hand

#### SCRIBE (✍️ Writer)
```css
--agent-color: #ec4899;
--agent-color-dark: #be185d;
--hair-color: #a855f7;
--accessory: '✏️';
```
- Hair: Purple, flowing
- Outfit: Magenta cardigan, vintage style
- Special: Quill pen, ink stains on fingers

#### SPEC (📋 Product)
```css
--agent-color: #f97316;
--agent-color-dark: #ea580c;
--hair-color: #92400e;
--accessory: '📋';
```
- Hair: Brown, professional bob
- Outfit: Orange blazer, business casual
- Special: Clipboard accessory, glasses

#### SAGE (🧠 Strategist)
```css
--agent-color: #facc15;
--agent-color-dark: #eab308;
--hair-color: #a3a3a3;
--accessory: '🍵';
```
- Hair: Wise gray, with small beard
- Outfit: Golden robe-like jacket
- Special: Tea cup, meditation pose option

#### ATLAS (📊 Research)
```css
--agent-color: #06b6d4;
--agent-color-dark: #0891b2;
--hair-color: #0f766e;
--accessory: '📊';
```
- Hair: Teal, neat and analytical
- Outfit: Cyan lab coat with data patterns
- Special: Chart/graph patterns on outfit

#### RIFF (🎸 Audio)
```css
--agent-color: #ef4444;
--agent-color-dark: #dc2626;
--hair-color: #1f2937;
--accessory: '🎧';
```
- Hair: Black, rock-style
- Outfit: Red leather jacket
- Special: Headphones, music note patterns

#### VAULT (📚 Knowledge)
```css
--agent-color: #10b981;
--agent-color-dark: #059669;
--hair-color: #6b7280;
--accessory: '📚';
```
- Hair: Gray, professorial
- Outfit: Green librarian vest
- Special: Small books floating around, glasses

---

## 2. Animation Catalog

### Core Animation System
All animations use CSS transforms for GPU acceleration:
- `transform: translate3d()` for position changes
- `transform: rotate()` for rotations
- `opacity` for fade effects
- `scale()` for size changes

### Walking Animation
```css
@keyframes avatar-walk {
  0% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-2px);
  }
  50% {
    transform: translateY(0);
  }
  75% {
    transform: translateY(-1px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes avatar-walk-left-leg {
  0%, 100% {
    transform: translateX(0) rotateZ(0deg);
  }
  50% {
    transform: translateX(-1px) rotateZ(-5deg);
  }
}

@keyframes avatar-walk-right-leg {
  0%, 100% {
    transform: translateX(0) rotateZ(0deg);
  }
  50% {
    transform: translateX(1px) rotateZ(5deg);
  }
}

.avatar-walking {
  animation: avatar-walk 0.6s ease-in-out infinite;
}

.avatar-walking .avatar-leg:first-child {
  animation: avatar-walk-left-leg 0.6s ease-in-out infinite;
}

.avatar-walking .avatar-leg:last-child {
  animation: avatar-walk-right-leg 0.6s ease-in-out infinite reverse;
}
```

### Typing Animation (Active State)
```css
@keyframes avatar-typing-arms {
  0%, 100% {
    transform: rotateX(0deg);
  }
  25% {
    transform: rotateX(-10deg);
  }
  75% {
    transform: rotateX(-5deg);
  }
}

@keyframes avatar-typing-body-bob {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-1px);
  }
}

@keyframes screen-glow-pulse {
  0%, 100% {
    box-shadow: 0 0 8px var(--agent-color-alpha-30);
  }
  50% {
    box-shadow: 0 0 16px var(--agent-color-alpha-50), 0 0 24px var(--agent-color-alpha-20);
  }
}

.avatar-typing {
  animation: avatar-typing-body-bob 2s ease-in-out infinite;
}

.avatar-typing .avatar-arms {
  animation: avatar-typing-arms 1.5s ease-in-out infinite;
}

.avatar-typing + .desk-monitor {
  animation: screen-glow-pulse 2s ease-in-out infinite;
}
```

### Idle Activities
```css
@keyframes avatar-idle-breathe {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-1px) scale(1.01);
  }
}

@keyframes avatar-coffee-sip {
  0%, 80%, 100% {
    transform: rotateZ(0deg);
  }
  10%, 70% {
    transform: rotateZ(-15deg);
  }
}

@keyframes avatar-stretch {
  0%, 100% {
    transform: rotateZ(0deg) translateY(0);
  }
  50% {
    transform: rotateZ(5deg) translateY(-4px);
  }
}

@keyframes avatar-read {
  0%, 100% {
    transform: rotateX(0deg);
  }
  50% {
    transform: rotateX(-10deg);
  }
}

.avatar-idle-breathe {
  animation: avatar-idle-breathe 4s ease-in-out infinite;
}

.avatar-idle-coffee .avatar-arm:first-child {
  animation: avatar-coffee-sip 6s ease-in-out infinite;
}

.avatar-idle-stretch {
  animation: avatar-stretch 8s ease-in-out infinite;
}

.avatar-idle-read .avatar-head {
  animation: avatar-read 5s ease-in-out infinite;
}
```

### Sitting Down/Standing Up Transitions
```css
@keyframes avatar-sit-down {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(8px);
  }
}

@keyframes avatar-stand-up {
  0% {
    transform: translateY(8px);
  }
  100% {
    transform: translateY(0);
  }
}

.avatar-sitting-transition-in {
  animation: avatar-sit-down 0.5s ease-out forwards;
}

.avatar-standing-transition-in {
  animation: avatar-stand-up 0.5s ease-out forwards;
}

.avatar-sitting {
  transform: translateY(8px);
}
```

### Meeting Room Animations
```css
@keyframes speech-bubble-appear {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes whiteboard-writing {
  0% {
    transform: translateX(-5px);
  }
  50% {
    transform: translateX(5px) translateY(-2px);
  }
  100% {
    transform: translateX(-5px);
  }
}

.speech-bubble {
  animation: speech-bubble-appear 0.3s ease-out;
}

.avatar-presenting .avatar-arm:first-child {
  animation: whiteboard-writing 2s ease-in-out infinite;
}
```

### Ambient Animations
```css
@keyframes particle-drift {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  20% {
    opacity: 0.6;
  }
  80% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-100px) translateX(20px);
    opacity: 0;
  }
}

@keyframes plant-sway {
  0%, 100% {
    transform: rotateZ(0deg);
  }
  50% {
    transform: rotateZ(2deg);
  }
}

@keyframes steam-rise {
  0% {
    opacity: 0.8;
    transform: translateY(0) scale(0.8);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(1.2);
  }
}

.ambient-particle {
  animation: particle-drift 15s linear infinite;
}

.plant-element {
  animation: plant-sway 6s ease-in-out infinite;
}

.steam-particle {
  animation: steam-rise 3s ease-out infinite;
}
```

---

## 3. Room Layout

### Overall Floor Plan (Expanded)
**New dimensions:** 960w × 600h px (increased from 840×520 for more space)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🔴 BOSS OFFICE (200×120)          │  ☕ COMMON AREA (280×120)          │
│  ┌─────────┐  ┌─────────┐          │  ┌─────┐ ☕ ┌─────────┐ 🪴       │
│  │   MCP   │  │   CEO   │          │  │couch│    │ tables  │           │
│  │  desk   │  │  desk   │          │  │     │    │         │           │
│  └─────────┘  └─────────┘          │  └─────┘    └─────────┘           │
├─────────────────────────────────────┼─────────────────────────────────────┤
│  ⚡ ENGINEERING ZONE (480×180)                                          │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                              │
│  │GRID │ │SENT │ │ BUG │ │ARCH │ │ DEV │                              │
│  │desk │ │desk │ │desk │ │desk │ │desk │                              │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                              │
├─────────────────────────────────────┼─────────────────────────────────────┤
│  🎨 CREATIVE ZONE (240×180)         │  📋 STRATEGY ZONE (240×180)        │
│  ┌────────┐ ┌────────┐              │  ┌──────┐ ┌──────┐               │
│  │ PIXEL  │ │ SCRIBE │              │  │ SPEC │ │ SAGE │               │
│  │easel/tb│ │  desk  │              │  │ desk │ │ desk │               │
│  └────────┘ └────────┘              │  └──────┘ └──────┘               │
├─────────────────────────────────────┴─────────────────────────────────────┤
│  📚 LABS ZONE (320×180)             │  🏢 MEETING ROOM (160×180)        │
│  ┌──────┐ ┌──────┐ ┌──────┐        │  ┌─────────────────┐              │
│  │ATLAS │ │ RIFF │ │VAULT │        │  │  ⬜ whiteboard  │              │
│  │ desk │ │ desk │ │ desk │        │  │                 │              │
│  └──────┘ └──────┘ └──────┘        │  │   ⭕ table     │              │
│                                      │  │  💺💺💺💺   │              │
└─────────────────────────────────────────┴─────────────────────────────────────┘
```

### Exact Pixel Positions

#### Zone Boundaries
```css
:root {
  --boss-zone: 0, 0, 480, 120;      /* x, y, w, h */
  --common-zone: 480, 0, 480, 120;
  --eng-zone: 0, 120, 960, 180;
  --creative-zone: 0, 300, 480, 180;
  --strategy-zone: 480, 300, 240, 180;
  --labs-zone: 0, 480, 640, 120;
  --meeting-zone: 640, 480, 320, 120;
}
```

#### Individual Desk Positions (agent assigned desks)
```typescript
const DESK_POSITIONS = {
  // Boss Zone
  mcp: { x: 100, y: 60, zone: 'boss' },
  ceo: { x: 300, y: 60, zone: 'boss' },
  
  // Engineering Zone  
  grid: { x: 80, y: 200, zone: 'engineering' },
  sentinel: { x: 240, y: 200, zone: 'engineering' },
  bug: { x: 400, y: 200, zone: 'engineering' },
  arch: { x: 560, y: 200, zone: 'engineering' },
  dev: { x: 720, y: 200, zone: 'engineering' },
  
  // Creative Zone
  pixel: { x: 120, y: 380, zone: 'creative' },
  scribe: { x: 320, y: 380, zone: 'creative' },
  
  // Strategy Zone
  spec: { x: 560, y: 380, zone: 'strategy' },
  sage: { x: 720, y: 380, zone: 'strategy' },
  
  // Labs Zone
  atlas: { x: 120, y: 540, zone: 'labs' },
  riff: { x: 320, y: 540, zone: 'labs' },
  vault: { x: 520, y: 540, zone: 'labs' },
} as const;
```

#### Common Area Positions (idle agents)
```typescript
const COMMON_AREA_SPOTS = [
  { x: 600, y: 60, type: 'couch-left' },
  { x: 640, y: 60, type: 'couch-center' },
  { x: 680, y: 60, type: 'couch-right' },
  { x: 760, y: 50, type: 'coffee-machine' },
  { x: 820, y: 80, type: 'standing-table-1' },
  { x: 860, y: 80, type: 'standing-table-2' },
  { x: 900, y: 60, type: 'plant-area' },
] as const;
```

#### Meeting Room Layout
```typescript
const MEETING_ROOM_POSITIONS = {
  presenter: { x: 760, y: 520, facing: 'whiteboard' }, // SPEC position
  whiteboard: { x: 720, y: 500, w: 80, h: 40 },
  table_center: { x: 800, y: 560 },
  chairs: [
    { x: 740, y: 580, seat: 1 },
    { x: 780, y: 590, seat: 2 },
    { x: 820, y: 590, seat: 3 },
    { x: 860, y: 580, seat: 4 },
    { x: 800, y: 540, seat: 5 }, // head of table
    { x: 800, y: 600, seat: 6 }, // foot of table
  ],
} as const;
```

### Furniture Specifications

#### Desk Units
```css
.desk-unit {
  position: absolute;
  width: 60px;
  height: 40px;
}

.desk-surface {
  position: absolute;
  bottom: 8px;
  width: 60px;
  height: 8px;
  background: linear-gradient(90deg, #8b5a3c, #6b4423);
  border-radius: 4px;
  border: 1px solid #4a2c17;
  transform: perspective(100px) rotateX(15deg);
}

.desk-monitor {
  position: absolute;
  bottom: 16px;
  left: 18px;
  width: 24px;
  height: 18px;
  background: #1a1a2e;
  border-radius: 2px;
  border: 1px solid #333;
}

.desk-monitor.active {
  background: var(--agent-color-dark);
  box-shadow: 0 0 8px var(--agent-color-alpha-30);
}

.desk-chair {
  position: absolute;
  bottom: 0;
  left: 20px;
  width: 20px;
  height: 12px;
  background: #2d3748;
  border-radius: 2px 2px 6px 6px;
  border: 1px solid #1a202c;
}
```

#### Coffee Machine
```css
.coffee-machine {
  position: absolute;
  left: 740px;
  top: 40px;
  width: 32px;
  height: 40px;
}

.coffee-machine-body {
  width: 32px;
  height: 32px;
  background: linear-gradient(180deg, #4a5568, #2d3748);
  border-radius: 4px;
  border: 1px solid #1a202c;
  position: relative;
}

.coffee-machine-steam {
  position: absolute;
  top: -10px;
  left: 12px;
  width: 8px;
  height: 10px;
}

.steam-particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: steam-rise 3s ease-out infinite;
}

.steam-particle:nth-child(2) { animation-delay: 0.5s; }
.steam-particle:nth-child(3) { animation-delay: 1s; }
```

#### Common Area Seating
```css
.couch-unit {
  position: absolute;
  left: 580px;
  top: 50px;
  width: 120px;
  height: 24px;
}

.couch-base {
  width: 120px;
  height: 16px;
  background: linear-gradient(180deg, #7c2d12, #581c0d);
  border-radius: 8px;
  border: 1px solid #3f1f0f;
}

.couch-back {
  position: absolute;
  top: -8px;
  width: 120px;
  height: 12px;
  background: linear-gradient(180deg, #92400e, #7c2d12);
  border-radius: 6px 6px 0 0;
}

.couch-cushion {
  position: absolute;
  top: 4px;
  width: 36px;
  height: 8px;
  background: #a16207;
  border-radius: 2px;
  border: 1px solid #78350f;
}
```

#### Meeting Table
```css
.meeting-table {
  position: absolute;
  left: 760px;
  top: 540px;
  width: 100px;
  height: 60px;
}

.meeting-table-surface {
  width: 100px;
  height: 12px;
  background: linear-gradient(90deg, #8b5a3c, #6b4423);
  border-radius: 50px 50px 20px 20px;
  border: 1px solid #4a2c17;
  transform: perspective(150px) rotateX(20deg);
}

.meeting-chair {
  position: absolute;
  width: 16px;
  height: 20px;
  background: linear-gradient(180deg, #4a5568, #2d3748);
  border-radius: 2px 2px 4px 4px;
  border: 1px solid #1a202c;
}
```

#### Whiteboard
```css
.whiteboard {
  position: absolute;
  left: 700px;
  top: 500px;
  width: 80px;
  height: 40px;
}

.whiteboard-surface {
  width: 80px;
  height: 40px;
  background: #f8fafc;
  border-radius: 4px;
  border: 2px solid #475569;
  position: relative;
}

.whiteboard-text {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 6px;
  color: #1e293b;
  font-family: monospace;
  line-height: 1;
}

.whiteboard-stand {
  position: absolute;
  bottom: -8px;
  left: 36px;
  width: 8px;
  height: 8px;
  background: #64748b;
  border-radius: 0 0 2px 2px;
}
```

---

## 4. Color & Atmosphere

### Dark Theme Color Palette
```css
:root {
  /* Floor & Walls */
  --floor-base: #0f172a;
  --floor-pattern: #1e293b;
  --wall-base: #0a0a0f;
  --wall-accent: #1a1a2e;
  
  /* Zone Floor Tints */
  --boss-floor-tint: rgba(220, 38, 38, 0.08);     /* Red tint */
  --engineering-floor-tint: rgba(124, 58, 237, 0.08); /* Purple tint */
  --creative-floor-tint: rgba(244, 63, 94, 0.08);     /* Rose tint */
  --strategy-floor-tint: rgba(249, 115, 22, 0.08);    /* Orange tint */
  --labs-floor-tint: rgba(6, 182, 212, 0.08);         /* Cyan tint */
  --common-floor-tint: rgba(34, 197, 94, 0.06);       /* Green tint */
  --meeting-floor-tint: rgba(168, 85, 247, 0.08);     /* Violet tint */
  
  /* Furniture Colors */
  --wood-primary: #8b5a3c;
  --wood-secondary: #6b4423;
  --wood-dark: #4a2c17;
  --metal-primary: #4a5568;
  --metal-secondary: #2d3748;
  --metal-dark: #1a202c;
  --fabric-primary: #7c2d12;
  --fabric-secondary: #581c0d;
  
  /* Ambient Elements */
  --particle-color: rgba(248, 250, 252, 0.4);
  --dust-particle-color: rgba(203, 213, 225, 0.2);
  --steam-color: rgba(255, 255, 255, 0.6);
}
```

### Day/Night Cycle
```css
/* Time-based atmosphere tinting */
.office-container {
  position: relative;
}

.office-container::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 100;
  border-radius: inherit;
  background: var(--time-tint);
  mix-blend-mode: multiply;
  transition: background 30s ease-in-out;
}

/* JavaScript will set --time-tint based on hour */
/* Morning (6-10): rgba(255, 248, 220, 0.1) - warm */
/* Day (10-16): transparent - neutral */
/* Evening (16-20): rgba(255, 224, 178, 0.15) - golden */
/* Night (20-6): rgba(79, 70, 229, 0.2) - cool blue */
```

### Ambient Particle System
```css
.ambient-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 50;
}

.dust-particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: var(--dust-particle-color);
  border-radius: 50%;
  animation: particle-drift 20s linear infinite;
}

/* Generate 15 particles with random delays and positions */
.dust-particle:nth-child(1) { 
  left: 5%; 
  animation-delay: 0s; 
  animation-duration: 18s; 
}
.dust-particle:nth-child(2) { 
  left: 15%; 
  animation-delay: 3s; 
  animation-duration: 22s; 
}
/* ... continue for 15 particles ... */
```

### Zone-Specific Atmosphere Effects
```css
.zone-boss::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, var(--boss-floor-tint) 0%, transparent 70%);
  pointer-events: none;
}

.zone-engineering::after {
  content: '';
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 80%, var(--engineering-floor-tint) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, var(--engineering-floor-tint) 0%, transparent 50%);
  pointer-events: none;
}

/* Similar patterns for other zones */
```

---

## 5. State Transition Map

### Agent State Logic
```typescript
type AgentState = 'active' | 'recent' | 'idle' | 'meeting' | 'walking';

interface AgentPosition {
  x: number;
  y: number;
  state: AgentState;
  targetX?: number;
  targetY?: number;
  walkingDuration?: number;
}

const STATE_POSITION_MAP = {
  // SPEC orchestrating → all assigned agents to meeting room
  meeting: (agentId: string) => {
    if (agentId === 'spec') {
      return MEETING_ROOM_POSITIONS.presenter;
    }
    // Other agents get assigned chairs based on task
    const chairIndex = getTaskParticipantIndex(agentId);
    return MEETING_ROOM_POSITIONS.chairs[chairIndex % 6];
  },
  
  // Active → assigned desk
  active: (agentId: string) => {
    return DESK_POSITIONS[agentId];
  },
  
  // Recent → stay at desk but with reduced activity
  recent: (agentId: string) => {
    return DESK_POSITIONS[agentId];
  },
  
  // Idle → common area with randomized position
  idle: (agentId: string) => {
    const baseSpot = COMMON_AREA_SPOTS[hash(agentId) % COMMON_AREA_SPOTS.length];
    return {
      x: baseSpot.x + (hash(agentId + Date.now()) % 40 - 20), // ±20px random
      y: baseSpot.y + (hash(agentId + Date.now()) % 20 - 10), // ±10px random
      activity: getIdleActivity(agentId, baseSpot.type)
    };
  }
} as const;
```

### Transition Animation System
```css
.agent-position-transition {
  transition: 
    transform 2s cubic-bezier(0.25, 0.46, 0.45, 0.94),
    opacity 0.5s ease-in-out;
}

.agent-walking {
  z-index: 10; /* Walk over furniture */
}

.agent-walking .avatar-container {
  animation: 
    avatar-walk 0.6s ease-in-out infinite,
    avatar-walk-shadow 0.6s ease-in-out infinite;
}

@keyframes avatar-walk-shadow {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.9);
  }
}
```

### Meeting Detection & Orchestration
```typescript
interface MeetingState {
  active: boolean;
  orchestrator: string; // Usually 'spec'
  participants: string[];
  task: string;
  startTime: number;
}

// When SPEC becomes active with a task, trigger meeting mode
function detectMeeting(activity: ActivityItem[]): MeetingState | null {
  const spec = activity.find(a => a.agent === 'spec' && a.status === 'active');
  if (!spec?.task) return null;
  
  // Find other active agents (participants in the task)
  const participants = activity
    .filter(a => a.status === 'active' && a.agent !== 'spec')
    .map(a => a.agent);
  
  if (participants.length === 0) return null;
  
  return {
    active: true,
    orchestrator: 'spec',
    participants,
    task: spec.task,
    startTime: Date.now()
  };
}
```

### Position Update Logic
```typescript
function calculateTargetPosition(
  agentId: string, 
  currentState: AgentState, 
  newState: AgentState,
  meetingState?: MeetingState
): { x: number; y: number; transition: boolean } {
  
  // Meeting state overrides individual state
  if (meetingState?.active && 
      (meetingState.orchestrator === agentId || meetingState.participants.includes(agentId))) {
    return {
      ...STATE_POSITION_MAP.meeting(agentId),
      transition: currentState !== 'meeting'
    };
  }
  
  // Normal state transitions
  const targetPos = STATE_POSITION_MAP[newState](agentId);
  const currentPos = STATE_POSITION_MAP[currentState](agentId);
  
  return {
    ...targetPos,
    transition: currentPos.x !== targetPos.x || currentPos.y !== targetPos.y
  };
}
```

### Idle Activity Rotation
```typescript
const IDLE_ACTIVITIES = [
  'coffee',     // Drinking coffee (near machine)
  'chat',       // Talking with other idle agents
  'read',       // Reading a book/tablet
  'stretch',    // Stretching/exercising
  'phone',      // Checking phone
  'think',      // Just standing/thinking
] as const;

function getIdleActivity(agentId: string, spotType: string): string {
  if (spotType === 'coffee-machine') return 'coffee';
  if (spotType.startsWith('couch')) return 'read';
  
  // Rotate activity every 30 seconds based on agent and time
  const cycle = Math.floor(Date.now() / 30000);
  const activities = IDLE_ACTIVITIES.filter(a => a !== 'coffee');
  return activities[(hash(agentId) + cycle) % activities.length];
}
```

---

## Implementation Notes

### Performance Considerations
1. **Use CSS transforms exclusively** for animations - no changing layout properties
2. **Limit particle count** to 15-20 ambient particles maximum
3. **Batch DOM updates** - update all agent positions in single rAF cycle
4. **Use `will-change` property** on animated elements
5. **Debounce state changes** - don't animate on every API poll, only on actual state changes

### CSS Custom Properties Usage
```css
.avatar-container {
  --agent-color: inherit;
  --agent-color-dark: inherit; 
  --agent-color-alpha-30: color-mix(in srgb, var(--agent-color) 30%, transparent);
  --agent-color-alpha-50: color-mix(in srgb, var(--agent-color) 50%, transparent);
}
```

### Responsive Behavior
```css
@media (max-width: 1024px) {
  .office-container {
    transform: scale(0.8);
    transform-origin: top left;
  }
}

@media (max-width: 768px) {
  .office-container {
    transform: scale(0.6);
  }
  
  /* Hide some ambient effects on mobile */
  .ambient-particles {
    display: none;
  }
}
```

### Browser Compatibility
- **Target:** Modern browsers with CSS Grid, Custom Properties, and `transform3d`
- **Fallback:** Graceful degradation - static positions if animations fail
- **Critical:** Use `@supports` queries for advanced features

This specification provides exact measurements, detailed CSS implementations, and a comprehensive animation system that will transform the current cube-based office into a vibrant, living workspace. The implementer (GRID agent) can use these precise values to build the new system while maintaining performance and visual consistency with the existing dark theme.