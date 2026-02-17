# Wave 2 Design Document

> Project: Grid Dashboard Wave 2  
> Author: SPEC (PO Agent)  
> Date: 2026-02-17  
> Status: Draft → Review

---

## 1. Overview

Wave 2 delivers 9 features across 4 tiers: bug fixes, observability, advanced control, and analytics. All build on the existing Next.js 14 app with SSE streaming infrastructure.

## 2. Architecture Context

### Current State
- **Activity API** (`/api/activity/route.ts`): Polls JSONL session files, 30s cache TTL, file mtime-based status
- **Stream API** (`/api/stream/route.ts`): SSE with `fs.watch` on agent session dirs, sends `activity` events on file changes
- **Events API** (`/api/events/route.ts`): SSE for project data, 2s polling interval
- **Agent Status API** (`/api/agents/status/route.ts`): Reads session mtimes, 30s threshold for "active"
- **Living Office** (`living-office.tsx`): Polls `/api/activity` every 5s, maps agent status to visual states
- **useRealtimeStream hook**: Connects to `/api/stream` SSE, handles reconnection with exponential backoff

### Key Problem: Status Intermittence (BUG-01)
**Root Cause Analysis:**
1. Activity API has 30s cache → stale data served for up to 30s
2. Living Office polls every 5s but gets cached (stale) data
3. Status threshold: `<60s mtime = active` — tight window combined with 30s cache means agents can appear idle when active
4. The SSE stream (`/api/stream`) exists but Living Office doesn't use it — it uses polling instead
5. `fs.watch` in stream API fires on file changes but doesn't include parsed status data

**Fix Strategy:** Connect Living Office to the SSE stream for instant status updates, reduce cache TTL to 5s as fallback, and emit richer status data from the stream.

---

## 3. Feature Designs

### 3.1 BUG-01: Living Office Status Intermitente

**Changes:**
1. **`/api/stream/route.ts`**: When `activity` event fires, also read and emit the agent's current status (active/recent/idle) and last activity summary
2. **`living-office.tsx`**: Subscribe to `/api/stream` SSE via `useRealtimeStream` hook. On `activity` events, update agent status map immediately. Keep polling as fallback but increase interval to 30s.
3. **`/api/activity/route.ts`**: Reduce cache TTL from 30s to 5s

**Result:** Near-instant status updates via SSE, with polling as safety net.

### 3.2 BUG-02: MCP Not on Map

**Changes:**
1. **`/api/activity/route.ts`**: Remove `if (agentId === 'main') continue;` — include main agent in activity data, map it as agent id `mcp`
2. **`/api/agents/status/route.ts`**: Remove `if (id === 'main') continue;` — include main in status
3. Map `main` agent id to `mcp` in the response (Living Office already has MCP desk at position)

**Note:** The AGENTS array in living-office.tsx already has `id: 'mcp'`. The API just needs to emit data for it. We need to map the filesystem dir `main` → agent id `mcp`.

### 3.3 OBS-05: Token Usage Live Counter

**New Files:**
- `app/src/app/api/tokens/route.ts` — API that reads OpenClaw session JSONL files, extracts `usage` fields (tokens_in, tokens_out) from message entries, aggregates per agent/session/day
- `app/src/components/token-counter.tsx` — Gauge component showing:
  - Per-agent token count (current session)
  - Daily accumulated total
  - Burn rate (tokens/min over last 5 min)
  - Visual gauge with color thresholds (green < 100k, yellow < 500k, red > 500k)
- `app/src/app/tokens/page.tsx` — Full token usage page

**Data Source:** JSONL session files contain `usage` objects on message entries. Parse these for token counts.

### 3.4 OBS-04: Error & Alert Dashboard

**New Files:**
- `app/src/app/api/errors/route.ts` — Scans session JSONL for error entries (tool errors, API failures, timeouts). Filters by agent, error type, timeframe
- `app/src/components/error-dashboard.tsx` — Table/list of errors with:
  - Agent, timestamp, error type, message preview
  - Filters: agent dropdown, error type, date range
  - Auto-refresh via SSE
- `app/src/app/errors/page.tsx` — Errors page
- `app/src/components/nav-bar.tsx` — Add error badge (red dot with count) when unread errors exist

**Error Types to Detect:**
- Tool call failures (non-zero exit, error responses)
- Rate limit hits (429 status)
- Timeout errors
- Session crashes (incomplete sessions)

### 3.5 AUT-05: Automated Health Checks

**New Files:**
- `app/src/app/api/health/route.ts` — Runs health checks:
  - Gateway: `openclaw gateway status` via exec or HTTP ping
  - Agents: Check if each agent's session dir was modified recently
  - Disk space: `df` output
  - API responsiveness: Self-ping latency
- `app/src/components/health-status.tsx` — Status page with green/yellow/red indicators
- `app/src/app/health/page.tsx` — Health page

**Status Logic:**
- 🟢 Green: All checks pass
- 🟡 Yellow: Non-critical issues (agent idle >1h, disk >80%)  
- 🔴 Red: Critical (gateway down, no agent activity in >4h)

### 3.6 CTL-03: Steer Sub-Agent from Dashboard

**New Files:**
- `app/src/app/api/subagents/route.ts` — GET: Lists active sub-agents (calls OpenClaw subagents list API or reads session data). POST: Sends steering message to a sub-agent
- `app/src/components/subagent-tree.tsx` — Tree view showing:
  - Parent → child relationships
  - Status of each sub-agent (running/completed/failed)
  - Expand to see task, last message
  - "Steer" button opens text input
- `app/src/app/subagents/page.tsx` — Sub-agents management page

**Implementation:** Uses OpenClaw's `subagents` tool API. The dashboard backend proxies requests to OpenClaw gateway.

### 3.7 CTL-06: Spawn New Agent Session

**New Files:**
- `app/src/app/api/spawn/route.ts` — POST: Spawns a new agent session via OpenClaw's `sessions_spawn` API
- `app/src/components/spawn-form.tsx` — Form with:
  - Agent selector (dropdown from config)
  - Model selector (available models)
  - Task description (textarea)
  - Timeout (number input, default 300s)
  - "Spawn" button with confirmation
- Integrated into subagents page or as modal from nav

### 3.8 ANA-02: Agent Performance Scorecards

**New Files:**
- `app/src/app/api/analytics/performance/route.ts` — Aggregates per agent:
  - Tasks completed (sessions that reached completion)
  - Avg response time (time between user message and assistant response)
  - Error rate (errors / total messages)
  - Tokens per task
- `app/src/components/scorecard.tsx` — Card per agent with metrics + sparkline trends
- `app/src/app/analytics/performance/page.tsx` — Performance page

### 3.9 ANA-03: Session Analytics

**New Files:**
- `app/src/app/api/analytics/sessions/route.ts` — Session duration stats, activity distribution by hour/day
- `app/src/components/activity-heatmap.tsx` — GitHub-style contribution heatmap showing session activity per day, color-coded by intensity
- `app/src/app/analytics/sessions/page.tsx` — Session analytics page

---

## 4. Navigation Updates

Add to nav-bar.tsx:
- **Tokens** (💰) — `/tokens`
- **Errors** (⚠️) — `/errors` (with badge)
- **Health** (🏥) — `/health`
- **Sub-agents** (🌳) — `/subagents`
- **Analytics** dropdown: Performance, Sessions (alongside existing Costs)

---

## 5. Shared Patterns

### API Pattern
All new API routes follow existing patterns:
- Read from `~/.openclaw/agents/` JSONL files
- Optional caching with short TTL
- JSON response with error handling

### SSE Integration
New real-time features (tokens, errors) can optionally subscribe to `/api/stream` SSE events and update on file changes rather than polling.

### Component Pattern
- Server page (`page.tsx`) with client component
- Tailwind CSS styling consistent with existing dark theme
- Loading states, error boundaries
- Responsive (works at different viewport sizes)

---

## 6. Dependencies & Risks

| Risk | Mitigation |
|------|-----------|
| JSONL parsing performance for large files | Read only last N lines, cache parsed data |
| Token data may not exist in all sessions | Graceful fallback to "N/A" |
| Gateway API access from Next.js server | Use exec or HTTP to local gateway |
| Sub-agent API may need auth | Proxy through gateway with existing auth |

---

## 7. Implementation Order

1. **Parallel Batch 1** (Bugs + Tier 2 start):
   - BUG-01 + BUG-02 → GRID ⚡
   - OBS-05 + OBS-04 → GRID ⚡
   - AUT-05 → DEV 🔧

2. **Batch 2** (Tier 3):
   - CTL-03 + CTL-06 → DEV 🔧

3. **Batch 3** (Tier 4):
   - ANA-02 + ANA-03 → DEV 🔧

4. **QA** → BUG 🪲 (final review of all features)
