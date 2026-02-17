# Wave 2 Execution Plan

> Project: Grid Dashboard Wave 2  
> Date: 2026-02-17

---

## Tasks

### Task 1: BUG-01 — Fix Living Office Status Intermitente
**Assignee:** GRID ⚡  
**Priority:** P0  
**Changes:**
1. `/api/stream/route.ts` — Enhance activity events to include parsed agent status (active/recent/idle) and activity summary
2. `/api/activity/route.ts` — Reduce cache TTL from 30s to 5s
3. `living-office.tsx` — Subscribe to SSE `/api/stream` for real-time status updates, keep polling as fallback at 30s interval
4. Test: Agent status should update within 2s of activity change

### Task 2: BUG-02 — Show MCP (main agent) on Map
**Assignee:** GRID ⚡  
**Priority:** P0  
**Changes:**
1. `/api/activity/route.ts` — Remove `if (agentId === 'main') continue;`, map agent dir `main` to id `mcp` in output
2. `/api/agents/status/route.ts` — Remove `if (id === 'main') continue;`, include main mapped as `mcp`
3. Test: MCP agent should appear with correct status on office map

### Task 3: OBS-05 — Token Usage Live Counter
**Assignee:** GRID ⚡  
**Priority:** P1  
**New files:**
- `src/app/api/tokens/route.ts`
- `src/components/token-counter.tsx`
- `src/app/tokens/page.tsx`
**Changes:**
- `nav-bar.tsx` — Add Tokens link

### Task 4: OBS-04 — Error & Alert Dashboard
**Assignee:** GRID ⚡  
**Priority:** P1  
**New files:**
- `src/app/api/errors/route.ts`
- `src/components/error-dashboard.tsx`
- `src/app/errors/page.tsx`
**Changes:**
- `nav-bar.tsx` — Add Errors link with badge

### Task 5: AUT-05 — Automated Health Checks
**Assignee:** DEV 🔧  
**Priority:** P1  
**New files:**
- `src/app/api/health/route.ts`
- `src/components/health-status.tsx`
- `src/app/health/page.tsx`
**Changes:**
- `nav-bar.tsx` — Add Health link

### Task 6: CTL-03 — Steer Sub-Agent from Dashboard
**Assignee:** DEV 🔧  
**Priority:** P1  
**New files:**
- `src/app/api/subagents/route.ts`
- `src/components/subagent-tree.tsx`
- `src/app/subagents/page.tsx`

### Task 7: CTL-06 — Spawn New Agent Session
**Assignee:** DEV 🔧  
**Priority:** P1  
**New files:**
- `src/app/api/spawn/route.ts`
- `src/components/spawn-form.tsx`
**Changes:**
- Integrate spawn form into subagents page

### Task 8: ANA-02 — Agent Performance Scorecards
**Assignee:** DEV 🔧  
**Priority:** P1  
**New files:**
- `src/app/api/analytics/performance/route.ts`
- `src/components/scorecard.tsx`
- `src/app/analytics/performance/page.tsx`

### Task 9: ANA-03 — Session Analytics
**Assignee:** DEV 🔧  
**Priority:** P1  
**New files:**
- `src/app/api/analytics/sessions/route.ts`
- `src/components/activity-heatmap.tsx`
- `src/app/analytics/sessions/page.tsx`

---

## Execution Batches

### Batch 1 (Parallel) — Bugs + Observability + Health
- Tasks 1-4 → GRID ⚡ (bugs + real-time features)
- Task 5 → DEV 🔧 (health checks)

### Batch 2 — Control Features
- Tasks 6-7 → DEV 🔧

### Batch 3 — Analytics
- Tasks 8-9 → DEV 🔧

### QA Pass
- All tasks → BUG 🪲 (quality review)

---

## Nav Bar Updates (Task shared across features)
Add to nav-bar.tsx:
- 💰 Tokens → `/tokens`
- ⚠️ Errors → `/errors` (with error count badge)
- 🏥 Health → `/health`  
- 🌳 Sub-agents → `/subagents`
- 📊 Performance → `/analytics/performance`
- 📈 Sessions → `/analytics/sessions`
