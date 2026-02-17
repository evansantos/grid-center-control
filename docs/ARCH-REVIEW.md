# Grid Dashboard — Architecture Review

**Date:** 2026-02-17  
**Reviewer:** arch (Architecture Agent)  
**Scope:** `grid/app/` (Next.js Dashboard) + `grid/engine/` (Grid CLI/SQLite)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS DASHBOARD (app/)                     │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Mission     │  │   Kanban     │  │  Agent       │  ... 25+     │
│  │  Control     │  │   Board      │  │  Status      │  pages       │
│  │  (page.tsx)  │  │  (client)    │  │  (client)    │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                  │                      │
│    Server-side       Client fetch       SSE+Polling                │
│    direct call       /api/kanban        /api/stream                │
│         │                 │             /api/agents/stream          │
│  ┌──────▼───────┐  ┌─────▼────────┐  ┌──────▼───────┐             │
│  │  lib/        │  │  /api/kanban  │  │  /api/stream │             │
│  │  queries.ts  │  │  route.ts     │  │  route.ts    │             │
│  │  (SQLite)    │  │  (FILESYSTEM) │  │  (FILESYSTEM)│             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│         │                 │                  │                      │
└─────────┼─────────────────┼──────────────────┼──────────────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
   ┌──────────┐    ┌───────────────┐   ┌──────────────────┐
   │ grid.db  │    │ ~/.openclaw/  │   │ ~/.openclaw/     │
   │ (SQLite) │    │ agents/*/     │   │ agents/*/        │
   │          │    │ workspace/    │   │ sessions/*.jsonl  │
   │ 20 proj  │    │ tasks.json    │   │ openclaw.json     │
   │ 82 tasks │    │ (NONEXISTENT) │   │                  │
   └──────────┘    └───────────────┘   └──────────────────┘
       ▲                                       ▲
       │                                       │
   ┌───┴──────────┐                   ┌────────┴─────────┐
   │ Grid Engine   │                   │ OpenClaw Runtime │
   │ (CLI/SQLite)  │                   │ (gateway)        │
   │ engine/src/   │                   │                  │
   └───────────────┘                   └──────────────────┘
```

### Data Source Summary

| API Route | Data Source | Reads From |
|-----------|------------|------------|
| `/` (Mission Control) | **grid.db** via `lib/queries.ts` | SQLite (projects, tasks) |
| `/api/kanban` | **Filesystem** | `tasks.json` files (DON'T EXIST) |
| `/api/kanban/move` | **Filesystem** | `tasks.json` files (DON'T EXIST) |
| `/api/kanban/run` | **Filesystem** | Writes to `HEARTBEAT.md` |
| `/api/agents` | **Filesystem** | `openclaw.json`, session `.jsonl` files |
| `/api/agents/status` | **Filesystem** | Session `.jsonl` file mtimes |
| `/api/agents/stream` | **Filesystem** | Session `.jsonl` file mtimes (SSE) |
| `/api/stream` | **Filesystem** | `fs.watch` on session dirs |
| `/api/activity` | **Filesystem** | Parses session `.jsonl` content |
| `/api/alerts` | **grid.db** (with mock fallback) | SQLite events table |
| `/api/projects/[id]` | **grid.db** | SQLite |
| `/api/artifacts/[id]` | **grid.db** | SQLite |
| `/api/events` | **grid.db** | SQLite |
| ~20 other API routes | **Filesystem** | Various OpenClaw config/session files |

---

## Issues Found (Severity Ranked)

### 🔴 CRITICAL

#### 1. Kanban Board Is Completely Broken — Reads From Nonexistent Files
**Files:** `api/kanban/route.ts`, `api/kanban/move/route.ts`

The Kanban board reads from `tasks.json` files in agent workspaces. These files **do not exist**. The actual task data (82 tasks across 20 projects) lives in `grid.db`. The Kanban board will always render empty.

**Impact:** Core feature is non-functional. Users see an empty board.

#### 2. Kanban Run/Move Write to Wrong Targets
**Files:** `api/kanban/run/route.ts`, `api/kanban/move/route.ts`

- `kanban/run` writes to `~/.openclaw/workspace/HEARTBEAT.md` (main agent's heartbeat), not the Grid DB. Task status is never updated in SQLite.
- `kanban/move` writes to the nonexistent `tasks.json` files. Status changes are lost.

**Impact:** No task management actually works through the UI.

#### 3. Two Completely Disconnected Data Systems
The dashboard has **two independent data backends** with zero integration:
- **grid.db** (SQLite): Projects, tasks, artifacts, events, worktrees — used by Mission Control, project pages
- **Filesystem**: Agent sessions, status, activity — used by agent pages, kanban, stream

The Grid Engine CLI writes to `grid.db`. The OpenClaw runtime writes `.jsonl` session files. Neither knows about the other. There is no bridge.

### 🟠 HIGH

#### 4. Alerts API Falls Back to Mock Data Silently
**File:** `api/alerts/route.ts`

When the `events` table query fails (which it does — the schema expects `type` and `data` columns but the engine schema has `event_type` and `details`), it silently returns **fabricated mock data** with random values. Users see fake alerts thinking they're real.

#### 5. Agent Status Detection Is Fragile — File Mtime Polling
**Files:** `api/agents/status/route.ts`, `api/agents/stream/route.ts`

Agent "active" status is determined by checking if any `.jsonl` file was modified in the last 30 seconds. This means:
- An agent writing a log line appears "active" even if idle
- An active agent with a session older than 30s appears "idle"
- No awareness of actual agent process state

#### 6. Duplicated Agent Status Logic
The same "scan session dirs, check mtimes" logic is copy-pasted across:
- `api/agents/status/route.ts`
- `api/agents/stream/route.ts`  
- `api/agents/route.ts`
- `api/activity/route.ts`
- `api/stream/route.ts`

Five files with nearly identical filesystem scanning code. Any bug fix must be applied in 5 places.

### 🟡 MEDIUM

#### 7. SSE Stream Uses fs.watch — Unreliable and Leaky
**File:** `api/stream/route.ts`

- `fs.watch` is known to be unreliable on macOS (double events, missed events)
- Creates one `FSWatcher` per agent directory per connected client
- With 50 agents × 10 concurrent clients = 500 file watchers
- 5-minute hard timeout disconnects all clients

#### 8. No Shared Data Access Layer
The app has two data access patterns with no abstraction:
- `lib/db.ts` + `lib/queries.ts` — thin SQLite wrapper for grid.db
- Direct `fs.readFile`/`fs.readdir` scattered across ~20 API routes

There's no service layer, no shared utility for "get agent info" or "get agent sessions."

#### 9. Session File Parsing Is Expensive and Repeated
**File:** `api/activity/route.ts`

Every request parses full `.jsonl` session files line by line, JSON.parse per line, to extract the last message. With 14 agents × multiple sessions × potentially large files, this is O(total_lines) per request. The 5s cache helps, but it's still wasteful.

#### 10. Inconsistent Server/Client Component Boundaries
The app follows a pattern of `page.tsx` (server) + `client.tsx` (client), but:
- Mission Control (`page.tsx`) does **direct synchronous SQLite calls** at the top level — this works but blocks the render
- Kanban, Agents, Activity use **client-side fetch** to API routes
- No consistent data fetching strategy (RSC vs. client fetch vs. SSE)

### 🟢 LOW

#### 11. No Error Boundaries on Data-Fetching Pages
Mission Control does `listProjects()` directly in the server component. If SQLite fails, the whole page crashes with no recovery.

#### 12. Inline Styles in Kanban Board
`kanban/client.tsx` uses extensive inline `style={{}}` objects instead of CSS modules/Tailwind, making theming and maintenance harder.

#### 13. No Database Migrations in the Dashboard App
The engine has a `migrations/` directory, but the dashboard's `lib/db.ts` just opens the DB with no migration awareness. Schema drift is possible.

---

## Recommended Fixes (Prioritized)

### Phase 1: Fix What's Broken (1-2 days)

**1. Rewrite Kanban to read from grid.db**
```typescript
// api/kanban/route.ts — should be:
import { getDB } from '@/lib/db';

export async function GET() {
  const db = getDB();
  const tasks = db.prepare(`
    SELECT t.*, p.name as project_name 
    FROM tasks t JOIN projects p ON t.project_id = p.id
    ORDER BY t.task_number
  `).all();
  
  const columns = { pending: [], in_progress: [], review: [], done: [] };
  for (const task of tasks) {
    const status = task.status.replace(/-/g, '_');
    if (columns[status]) columns[status].push(task);
  }
  return NextResponse.json({ columns });
}
```

**2. Rewrite Kanban Move to update grid.db**
```typescript
// api/kanban/move/route.ts
import { getDB } from '@/lib/db';

export async function PUT(req) {
  const { taskId, status } = await req.json();
  getDB().prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, taskId);
  return NextResponse.json({ success: true });
}
```

**3. Rewrite Kanban Run to update grid.db + trigger agent**
Update task status in SQLite first, then optionally write HEARTBEAT.md for agent pickup.

**4. Fix Alerts schema mismatch**
The alerts route queries `type` and `data` columns but the schema has `event_type` and `details`. Fix the query. Remove mock data fallback entirely.

### Phase 2: Consolidate Data Access (3-5 days)

**5. Create a shared agent service layer**
```
src/lib/
  agents/
    index.ts          — getAgent, listAgents, getAgentStatus
    sessions.ts       — parseSession, getRecentSessions
    config.ts         — loadOpenClawConfig (cached)
```
Replace the 5+ duplicated filesystem scanning implementations with one.

**6. Add caching to agent/session data**
- Cache `openclaw.json` parse (it changes rarely)
- Cache session file listings with short TTL
- Consider a lightweight in-memory store (Map with TTL)

**7. Standardize data fetching pattern**
Pick one:
- **Recommended:** Server Components fetch from `lib/queries.ts` (SQLite) and `lib/agents/` (filesystem). Pass data as props to client components. Use SSE only for real-time updates, not initial data.

### Phase 3: Scalability & Architecture (1-2 weeks)

**8. Replace fs.watch SSE with polling or DB-driven events**
Instead of one fs.watch per agent per client:
- Server-side: Single background interval polls agent status every 5s
- SSE: Broadcasts cached status to all connected clients
- Or: Agent heartbeats write to grid.db, dashboard reads from DB

**9. Add an `agent_status` table to grid.db**
```sql
CREATE TABLE agent_status (
  agent_id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'idle',  -- active/idle/offline
  last_heartbeat TEXT,
  current_task_id TEXT REFERENCES tasks(id),
  session_key TEXT,
  updated_at TEXT NOT NULL
);
```
Agents update this via heartbeat. Dashboard reads from DB. Single source of truth.

**10. Unified event bus**
Instead of filesystem watchers, have agents emit events to a shared table/channel that the dashboard subscribes to.

---

## Proposed Unified Data Flow

```
┌────────────────────────────────────────────────────────────────┐
│                     PROPOSED ARCHITECTURE                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Next.js Dashboard                       │  │
│  │                                                           │  │
│  │  Server Components ──► lib/queries.ts ──► grid.db         │  │
│  │  Client Components ──► /api/* routes  ──► lib/services/   │  │
│  │  Real-time          ──► /api/stream   ──► SSE broadcaster │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                    ┌─────────▼──────────┐                      │
│                    │  lib/services/      │                      │
│                    │                     │                      │
│                    │  projects.ts ──────►│                      │
│                    │  tasks.ts    ──────►├──► grid.db (SQLite)  │
│                    │  agents.ts   ──────►│       SINGLE         │
│                    │  events.ts   ──────►│     SOURCE OF        │
│                    │  kanban.ts   ──────►│       TRUTH          │
│                    └─────────────────────┘                      │
│                              ▲                                  │
│                              │                                  │
│         ┌────────────────────┼────────────────────┐            │
│         │                    │                    │            │
│  ┌──────┴───────┐   ┌───────┴──────┐   ┌────────┴────────┐   │
│  │ Grid Engine   │   │ Agent        │   │ OpenClaw        │   │
│  │ CLI           │   │ Heartbeats   │   │ Gateway         │   │
│  │ (creates      │   │ (update      │   │ (updates        │   │
│  │  projects,    │   │  agent_status│   │  session data   │   │
│  │  tasks)       │   │  table)      │   │  in DB)         │   │
│  └───────────────┘   └──────────────┘   └─────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### Key Principles:
1. **grid.db is the single source of truth** for all structured data
2. **No filesystem scanning for task/project data** — only for raw session logs if needed
3. **Agent status lives in DB** — agents update via heartbeat, dashboard reads from DB
4. **One service layer** — no duplicated scanning logic
5. **SSE broadcasts from a single server-side poller** — not per-client fs.watch

---

## Scalability Assessment: 50 Agents

| Concern | Current (14 agents) | At 50 agents |
|---------|-------------------|-------------|
| Agent status SSE | 14 fs.watchers/client | 50 watchers/client → 500 for 10 clients |
| Activity feed | Scans 14×3 session files/request | 50×3 = 150 file reads/request |
| Agent list page | Reads 14 session dirs | 50 dirs, each with readdir+stat+parse |
| Kanban (current) | Scans 14 agent dirs for tasks.json | 50 dirs, all failing (files don't exist) |
| Kanban (fixed) | 1 SQLite query | 1 SQLite query ✓ |
| Stream watchers | ~14 FSWatcher instances | 50+ FSWatcher — OS limit risk |

**Verdict:** The filesystem-scanning approach will degrade significantly at 50 agents. The SQLite-based approach scales trivially. Migration to DB-centric architecture is essential before scaling.

---

## Summary

The Grid Dashboard has two parallel but disconnected data systems. The SQLite-backed parts (Mission Control, projects) work correctly. The filesystem-backed parts (Kanban, agent status, activity) are either broken (Kanban reads nonexistent files) or fragile (mtime-based status detection). The critical path is:

1. **Now:** Fix Kanban to read from grid.db (hours, not days)
2. **Soon:** Consolidate filesystem scanning into a shared service layer
3. **Next:** Migrate agent status to DB, replace fs.watch with DB polling
