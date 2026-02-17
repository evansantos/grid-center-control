# Wave 1 Sprint Plan — Grid Dashboard P0 Features

> Project: Grid Dashboard Wave 1  
> Sprint: 1 (of 1)  
> Date: 2026-02-17

---

## Agent Assignments

| Agent | Tasks | Rationale |
|-------|-------|-----------|
| GRID ⚡ | AUT-01, OBS-01, OBS-02 | Complex infra, real-time, core data layer |
| PIXEL 🎨 | OFF-01, OFF-02 | Visual/animation work on living office |
| DEV 🔧 | CTL-01, CTL-02, ANA-01, UX-01 | Feature implementation, UI components |
| BUG 🪲 | QA review of all features | End-to-end testing |

---

## Tasks

### Task 1: Unified SSE Real-Time Stream (AUT-01)
**Agent:** GRID ⚡  
**Priority:** P0 — Foundation  
**Description:**  
Replace the polling-based SSE endpoint with a file-watcher-based unified stream.

**Subtasks:**
1. Create `/api/stream/route.ts` with SSE using `chokidar` to watch agent session directories
2. Implement JSONL tail reader (read from last offset, parse new lines)
3. Multiplex events: agent_activity, agent_state, project_update
4. Add `:keepalive` every 15s
5. Create `useRealtimeStream()` React hook with auto-reconnect
6. Migrate existing components from polling to new hook
7. Add "last updated" indicator and manual refresh button

**Acceptance Criteria:**
- Dashboard reflects agent activity within 1s
- Zero manual refresh needed for normal operation
- Auto-reconnects on connection drop (exponential backoff)
- CPU usage not significantly higher than current polling

**Files:**
- `app/src/app/api/stream/route.ts` (new)
- `app/src/hooks/use-realtime-stream.ts` (new)
- `app/src/lib/activity-parser.ts` (new)

---

### Task 2: Live Activity Stream Component (OBS-01)
**Agent:** GRID ⚡  
**Priority:** P0  
**Depends on:** Task 1  
**Description:**  
Scrollable feed showing real-time agent activities (tool calls, messages, file edits).

**Subtasks:**
1. Define `ActivityEvent` type (agent, type, summary, detail, timestamp)
2. Create `activity-parser.ts` — parse JSONL lines into ActivityEvent
3. Create `<LiveActivityStream />` component with virtual scroll
4. Agent avatar + type icon per event
5. Filter bar: by agent, by event type
6. Auto-scroll with "new events" indicator when scrolled up
7. Cap at 200 events in memory

**Acceptance Criteria:**
- Shows tool_call, tool_result, message events in real-time
- Can filter by agent
- Does not cause memory leaks (capped buffer)

**Files:**
- `app/src/components/live-activity-stream.tsx` (new)
- `app/src/lib/activity-parser.ts` (shared with Task 1)

---

### Task 3: Agent State Machine (OBS-02)
**Agent:** GRID ⚡  
**Priority:** P0  
**Depends on:** Task 1  
**Description:**  
Track and expose each agent's state: idle, thinking, executing_tool, waiting, error.

**Subtasks:**
1. Create `agent-state-machine.ts` with state detection logic
2. State derived from JSONL events + file mtime
3. Emit `agent_state_change` events via SSE stream
4. Create `useAgentState(agentId)` hook
5. Add state indicator component `<AgentStateIndicator />`
6. Show state + duration in agent list and detail views

**Acceptance Criteria:**
- State updates within 5s of actual change
- Visual indicator shows correct state
- Duration counter accurate

**Files:**
- `app/src/lib/agent-state-machine.ts` (new)
- `app/src/hooks/use-agent-state.ts` (new)
- `app/src/components/agent-state-indicator.tsx` (new)

---

### Task 4: Agent Speech Bubbles (OFF-01)
**Agent:** PIXEL 🎨  
**Priority:** P0  
**Depends on:** Task 2 (activity events)  
**Description:**  
Comic-style speech bubbles above pixel characters showing what agent is doing.

**Subtasks:**
1. Create `<SpeechBubble />` component with CSS bubble + tail
2. Tool call → human summary mapping function
3. Position bubble above each PixelCharacter in living-office
4. Fade-in on activity, fade-out after 10s idle
5. Max 40 chars, truncate gracefully
6. Ensure no overlap with adjacent agents

**Acceptance Criteria:**
- Bubbles appear when agent is active
- Summaries are human-readable ("Reading src/app.tsx...")
- Smooth fade animations
- Auto-hide after inactivity

**Files:**
- `app/src/components/speech-bubble.tsx` (new)
- `app/src/components/living-office.tsx` (modified)

---

### Task 5: Visual Status on Sprites (OFF-02)
**Agent:** PIXEL 🎨  
**Priority:** P0  
**Depends on:** Task 3 (state machine)  
**Description:**  
Pixel characters visually reflect their state without hover.

**Subtasks:**
1. Add CSS keyframe animations for each state:
   - active: glowing aura (box-shadow pulse)
   - thinking: floating "..." dots
   - idle (long): "Zzz" animation
   - error: red "!" with shake
2. Integrate with `useAgentState()` hook
3. Smooth transitions between states (300ms)
4. Ensure animations are performant (GPU-accelerated)

**Acceptance Criteria:**
- Each state has distinct visual indicator
- Visible without hover/click
- Smooth transitions, no jank
- Works at all zoom levels

**Files:**
- `app/src/components/living-office.tsx` (modified)

---

### Task 6: Send Message to Agent (CTL-01)
**Agent:** DEV 🔧  
**Priority:** P0  
**Description:**  
Text input in dashboard to send messages to any agent.

**Subtasks:**
1. Create `POST /api/agents/[id]/message` API route
2. Backend: execute `openclaw` CLI or write to session
3. Add text input to ConversationPanel (Enter=send, Shift+Enter=newline)
4. Optimistic UI: show sent message immediately
5. Error handling: show toast on failure
6. Message history integration (already polled)

**Acceptance Criteria:**
- Can send message to any agent from dashboard
- Agent receives and processes the message
- Response appears in conversation panel
- Error feedback on failure

**Files:**
- `app/src/app/api/agents/[id]/message/route.ts` (new)
- `app/src/components/conversation-panel.tsx` (modified)

---

### Task 7: Pause/Resume/Kill Agent (CTL-02)
**Agent:** DEV 🔧  
**Priority:** P0  
**Description:**  
Control buttons for agent lifecycle management.

**Subtasks:**
1. Create `POST /api/agents/[id]/control` API route
2. Backend: find agent PID, send signals (SIGTERM for kill)
3. Create `<ControlButtons />` component with Pause/Resume/Kill
4. Confirmation modal for destructive actions (kill)
5. Status reflects immediately via SSE
6. Disable buttons when agent is idle

**Acceptance Criteria:**
- Kill terminates agent session
- Confirmation required for kill
- UI reflects state change immediately
- No orphaned processes

**Files:**
- `app/src/app/api/agents/[id]/control/route.ts` (new)
- `app/src/components/control-buttons.tsx` (new)

---

### Task 8: Cost Dashboard (ANA-01)
**Agent:** DEV 🔧  
**Priority:** P0  
**Description:**  
Cost visibility with breakdowns by agent, model, and time.

**Subtasks:**
1. Create `cost-calculator.ts` — parse JSONL for token usage, apply pricing
2. Create cost config with model pricing (`lib/cost-config.ts`)
3. Create `GET /api/analytics/costs` API route
4. Create `/analytics/costs` page with:
   - Total cost card with trend arrow
   - Bar chart: cost by agent (recharts)
   - Line chart: daily trend
   - Model breakdown table
5. Budget threshold alert (localStorage)
6. Add "Costs" link to navbar

**Acceptance Criteria:**
- Shows cost per agent, per model, per day
- Charts render correctly
- Data refreshes with real-time stream
- Budget alert fires at threshold

**Files:**
- `app/src/lib/cost-calculator.ts` (new)
- `app/src/lib/cost-config.ts` (new)
- `app/src/app/api/analytics/costs/route.ts` (new)
- `app/src/app/analytics/costs/page.tsx` (new)
- `app/src/components/cost-dashboard.tsx` (new)

---

### Task 9: Keyboard-First Navigation (UX-01)
**Agent:** DEV 🔧  
**Priority:** P0  
**Description:**  
Vim-like keyboard navigation for power users.

**Subtasks:**
1. Create `useKeyboardNav()` hook with event listeners
2. Implement shortcuts: j/k (navigate), Enter (open), Esc (back), ? (help)
3. Number keys 1-9 for quick agent jump
4. `g h`, `g a`, `g c` for page navigation
5. `/` to focus search
6. Create `<ShortcutCheatsheet />` modal (? key)
7. Disable when input/textarea focused
8. Visual selection indicator (ring on selected agent)
9. Integrate with KeyboardNavProvider context

**Acceptance Criteria:**
- Full navigation without mouse
- No conflicts with browser shortcuts or command palette
- Cheatsheet accessible via ?
- Selection visually clear

**Files:**
- `app/src/hooks/use-keyboard-nav.ts` (new)
- `app/src/components/keyboard-nav-provider.tsx` (new)
- `app/src/components/shortcut-cheatsheet.tsx` (new)

---

## Execution Order

```
Phase 1 (Foundation):   Task 1 (AUT-01) — GRID
Phase 2 (Data Layer):   Task 2 (OBS-01) + Task 3 (OBS-02) — GRID  
Phase 3 (Visual):       Task 4 (OFF-01) + Task 5 (OFF-02) — PIXEL (parallel with Phase 2)
Phase 4 (Controls):     Task 6 (CTL-01) + Task 7 (CTL-02) — DEV (parallel with Phase 2-3)
Phase 5 (Analytics):    Task 8 (ANA-01) — DEV (after Phase 4 or parallel)
Phase 6 (Polish):       Task 9 (UX-01) — DEV (after Phase 5 or parallel)
Phase 7 (QA):           All tasks reviewed — BUG
```

## Definition of Done

- [ ] All 9 tasks implemented and working
- [ ] No TypeScript errors
- [ ] Dashboard loads without errors
- [ ] Real-time updates functional
- [ ] BUG review approved for each task
- [ ] No regressions in existing features
