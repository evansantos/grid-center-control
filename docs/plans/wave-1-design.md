# Wave 1 Design — Grid Dashboard P0 Features

> Project: Grid Dashboard Wave 1  
> Author: SPEC (orchestrated), ARCH (technical guidance)  
> Date: 2026-02-17  
> Status: Draft

---

## 1. Overview

Wave 1 delivers 9 P0 features that transform the Grid Dashboard from a static view into a **real-time, interactive command center**. The foundation is a proper real-time data layer (AUT-01) that all other features build upon.

## 2. Architecture

### 2.1 Real-Time Data Layer (AUT-01)

**Current state:** SSE endpoint at `/api/events` polls SQLite every 2s. Agent status checks file mtimes.

**Target architecture:**
- **Keep SSE** (simpler than WebSocket, sufficient for server→client push)
- **Replace polling with file watchers** using `fs.watch`/`chokidar` on:
  - Agent session JSONL files (`~/.openclaw/agents/*/sessions/*.jsonl`)
  - Grid engine SQLite db changes
- **New unified SSE endpoint** `/api/stream` that multiplexes:
  - Agent activity events (from JSONL tail)
  - Agent state changes (from file mtime + JSONL parsing)
  - Project/task updates (from SQLite)
  - Cost/token events (from session metadata)
- **Client-side:** Custom React hook `useRealtimeStream()` replaces all polling hooks
- **Heartbeat:** SSE sends `:keepalive` every 15s; client reconnects on drop

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  JSONL Files │────▶│  /api/stream     │────▶│  React App  │
│  (agents)    │     │  (SSE endpoint)  │     │  useStream()│
├─────────────┤     │                  │     └─────────────┘
│  SQLite DB   │────▶│  Multiplexed     │
│  (grid eng)  │     │  events          │
└─────────────┘     └──────────────────┘
```

**Key design decisions:**
- SSE over WebSocket: unidirectional is sufficient, simpler infra
- File watching over polling: lower latency, lower CPU
- Single multiplexed stream: one connection per client vs N

### 2.2 Live Activity Stream (OBS-01)

**Data source:** Agent session JSONL files contain messages with tool calls, responses, etc.

**Implementation:**
- Backend tails JSONL files using `fs.watch` + read from last known offset
- Parse each new line for: tool calls, assistant messages, user messages
- Emit structured events:
  ```ts
  interface ActivityEvent {
    agent: string;
    type: 'tool_call' | 'tool_result' | 'message' | 'thinking';
    summary: string;       // e.g., "Reading file src/app.tsx"
    detail?: string;       // truncated content
    timestamp: string;
    sessionId: string;
  }
  ```
- New component: `<LiveActivityStream />` — scrollable feed with auto-scroll, agent avatars, type icons
- Filters: by agent, by event type
- Max 200 events in memory, older ones pruned

### 2.3 Agent State Machine (OBS-02)

**States:**
```
idle → thinking → executing_tool → waiting_response → idle
                                                    → error
```

**Detection logic:**
- `idle`: No JSONL changes for >30s
- `thinking`: New assistant message started (partial write detected)
- `executing_tool`: Tool call parsed from JSONL
- `waiting_response`: Tool call sent, no result yet
- `error`: Error message in JSONL or session crash

**Implementation:**
- State tracked per-agent in the SSE backend
- Emitted as state change events
- New hook: `useAgentState(agentId)` returns current state + duration
- Visual: pulsing dot with state-specific color:
  - idle: dim gray
  - thinking: pulsing yellow
  - executing_tool: spinning blue
  - waiting: pulsing orange
  - error: red alert

### 2.4 Send Message to Agent (CTL-01)

**Mechanism:** Use OpenClaw CLI `openclaw chat send` or equivalent API.

**Implementation:**
- New API route: `POST /api/agents/[id]/message` 
  - Body: `{ message: string }`
  - Backend executes: `openclaw agent message <agentId> "<message>"` (or writes to session)
- UI: Text input at bottom of conversation panel (already has `ConversationPanel`)
  - Enter to send, Shift+Enter for newline
  - Shows sent message immediately (optimistic)
  - Conversation panel already polls for updates

**Fallback:** If no direct API, write to a designated input file that the agent picks up.

### 2.5 Pause/Resume/Kill Agent (CTL-02)

**Mechanism:** 
- Kill: `kill` the agent's process (find PID from session)
- Pause/Resume: Signal-based (SIGSTOP/SIGCONT) or flag file

**Implementation:**
- New API routes:
  - `POST /api/agents/[id]/control` — body: `{ action: 'pause' | 'resume' | 'kill' }`
- Backend finds agent process via PID file or `pgrep`
- Kill sends SIGTERM, waits, SIGKILL if needed
- Pause/Resume via flag file `.openclaw/agents/<id>/.paused` (agent checks on heartbeat)
- UI: Three buttons in agent detail panel with confirmation modal for kill
- State reflects immediately via SSE

### 2.6 Speech Bubbles (OFF-01)

**Source:** Latest activity event from OBS-01 stream.

**Implementation:**
- Map tool calls to human-readable summaries:
  - `exec` → "Running command..."
  - `Read` → "Reading {filename}..."
  - `Write` → "Writing {filename}..."
  - `web_search` → "Searching: {query}..."
  - `web_fetch` → "Fetching {url}..."
  - `Edit` → "Editing {filename}..."
  - `sessions_spawn` → "Spawning sub-agent..."
  - Default assistant → "Thinking..."
- New component: `<SpeechBubble agent={id} />` positioned above pixel character
- CSS: Comic-style bubble with tail, fade-in/out animation
- Auto-hide after 10s of no new activity
- Max 40 chars, truncate with "..."

### 2.7 Status Indicators on Sprites (OFF-02)

**Source:** Agent state from OBS-02.

**Implementation (in `living-office.tsx`):**
- Add visual indicators to existing `PixelCharacter` component:
  - **active**: Glowing aura (CSS box-shadow animation, agent color)
  - **thinking**: Pulsing "..." thought dots above head
  - **idle (long)**: "Zzz" floating animation
  - **error**: Red "!" exclamation, shake animation
  - **conversing**: "💬" speech indicator
- CSS keyframe animations, no JS animation loops
- Transition smoothly between states (300ms)

### 2.8 Cost Dashboard (ANA-01)

**Data source:** Parse token usage from session JSONL metadata. Each assistant response typically includes usage info.

**Implementation:**
- Backend: Scan session files, extract token counts and model info
- New API: `GET /api/analytics/costs?range=day|week|month`
  - Returns: `{ total: number, byAgent: Record<string, number>, byModel: Record<string, number>, daily: Array<{date, cost}> }`
- Cost calculation: token counts × model pricing (configurable in `cost-config.json`)
- New page: `/analytics/costs` with:
  - Total cost card with trend indicator
  - Bar chart: cost by agent (recharts)
  - Line chart: daily cost trend
  - Table: breakdown by model
  - Budget alert threshold (stored in localStorage)
- Dependency: `recharts` for charts

### 2.9 Keyboard Navigation (UX-01)

**Implementation:**
- Custom hook `useKeyboardNav()` using native `keydown` listeners
- Shortcuts (active when no input focused):
  - `j`/`k`: Navigate agent list (up/down)
  - `Enter`: Open selected agent detail
  - `Esc`: Close panel / go back
  - `?`: Toggle shortcut cheat sheet
  - `1-9`: Quick jump to agent by index
  - `g h`: Go home
  - `g a`: Go to agents
  - `g c`: Go to costs
  - `/`: Focus search
- Cheat sheet: Modal overlay listing all shortcuts
- Disable when any `<input>`, `<textarea>`, or `[contenteditable]` is focused
- Visual: Highlight currently selected agent with ring/outline

## 3. Component Tree (New/Modified)

```
app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── stream/route.ts          [NEW] Unified SSE endpoint
│   │   │   ├── agents/[id]/
│   │   │   │   ├── message/route.ts     [NEW] Send message
│   │   │   │   └── control/route.ts     [NEW] Pause/Resume/Kill
│   │   │   └── analytics/
│   │   │       └── costs/route.ts       [NEW] Cost data API
│   │   └── analytics/
│   │       └── costs/page.tsx           [NEW] Cost dashboard page
│   ├── components/
│   │   ├── live-activity-stream.tsx      [NEW] Activity feed component
│   │   ├── speech-bubble.tsx             [NEW] Agent speech bubbles
│   │   ├── agent-state-indicator.tsx     [NEW] State dot/animation
│   │   ├── cost-dashboard.tsx            [NEW] Cost charts
│   │   ├── keyboard-nav-provider.tsx     [NEW] Keyboard nav context
│   │   ├── shortcut-cheatsheet.tsx       [NEW] ? overlay
│   │   ├── control-buttons.tsx           [NEW] Pause/Resume/Kill UI
│   │   ├── living-office.tsx             [MOD] Add bubbles + indicators
│   │   └── conversation-panel.tsx        [MOD] Add message input
│   ├── hooks/
│   │   ├── use-realtime-stream.ts        [NEW] SSE hook
│   │   ├── use-agent-state.ts            [NEW] Per-agent state
│   │   └── use-keyboard-nav.ts           [NEW] Keyboard shortcuts
│   └── lib/
│       ├── activity-parser.ts            [NEW] JSONL → activity events
│       ├── cost-calculator.ts            [NEW] Token → cost mapping
│       └── agent-state-machine.ts        [NEW] State detection logic
```

## 4. Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| `recharts` | Cost dashboard charts | ^2.x |
| `chokidar` | File watching (backend) | ^3.x |

No other new dependencies needed. Everything else uses native APIs.

## 5. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| JSONL files large → slow parsing | High | Read from tail only (last 1KB), track file offset |
| Too many file watchers | Medium | Watch directories, not individual files |
| SSE connection drops | Medium | Auto-reconnect with exponential backoff |
| No direct API for agent messaging | High | Fall back to CLI exec or file-based approach |
| Cost data not in JSONL | Medium | Parse what's available, estimate for missing |

## 6. Implementation Order

1. **AUT-01** first (foundation for everything)
2. **OBS-01 + OBS-02** (data layer for activity + state)
3. **OFF-01 + OFF-02** (visual layer, depends on OBS)
4. **CTL-01 + CTL-02** (interaction, independent)
5. **ANA-01** (analytics, independent)
6. **UX-01** (polish, independent)

## 7. Acceptance Criteria

| Feature | Criteria |
|---------|----------|
| AUT-01 | Dashboard updates within 1s of agent activity. No manual refresh needed. Reconnects on drop. |
| OBS-01 | Live feed shows tool calls, messages within 2s. Filterable by agent. |
| OBS-02 | Agent state shown with <5s latency. Visual indicators match actual state. |
| CTL-01 | Can send message to any agent. Message appears in agent's session. Response visible in conversation. |
| CTL-02 | Can kill agent session. Confirmation required. Status updates immediately. |
| OFF-01 | Speech bubbles appear during activity. Summarize current action. Auto-hide after idle. |
| OFF-02 | Sprites visually change based on state. Animations smooth. |
| ANA-01 | Cost breakdown by agent, model, time. Charts render. Daily trend visible. |
| UX-01 | j/k navigates agents. Enter opens. Esc closes. ? shows cheatsheet. Works without mouse. |
