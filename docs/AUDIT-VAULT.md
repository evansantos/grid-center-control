# Grid Dashboard — Architecture & Data Integrity Audit

**Auditor:** Vault  
**Date:** 2026-02-17  
**Scope:** Database schema, API routes, engine CLI, file system access, SSE streaming, state management, security  

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 3 |
| HIGH | 6 |
| MEDIUM | 7 |
| LOW | 4 |
| **Total** | **20** |

---

## CRITICAL

### ARCH-01 — Unauthenticated Remote Command Execution

- **Severity:** CRITICAL
- **Component:** `app/src/app/api/terminal/route.ts`
- **Description:** The `/api/terminal` POST endpoint executes arbitrary shell commands via `execSync` with no authentication whatsoever. The blocklist (`rm -rf /`, `mkfs`, etc.) is trivially bypassable (e.g., `rm -rf /  ` with trailing space, or `r\m -rf /`, or using `find / -delete`). This is a full RCE vulnerability accessible to anyone who can reach the server.
- **Impact:** Complete system compromise. Any network-adjacent attacker can execute arbitrary commands as the server user.
- **Fix:** Remove this endpoint entirely, or gate it behind strong authentication + allowlist of safe commands. Never rely on string blocklists for security.

### ARCH-02 — Path Traversal in File System Reads

- **Severity:** CRITICAL
- **Component:** `app/src/app/api/agents/[id]/session/route.ts`, `app/src/app/api/agents/route.ts`, multiple API routes
- **Description:** Agent IDs from URL params are directly interpolated into file paths (`join(OPENCLAW_DIR, 'agents', resolvedId, 'sessions')`) with no sanitization. An attacker can use `../` sequences in the agent ID to read arbitrary `.jsonl` files on the filesystem.
- **Impact:** Arbitrary file read; information disclosure of sensitive data outside the intended directory.
- **Fix:** Validate that `agentId` matches `/^[a-zA-Z0-9_-]+$/` and reject any input containing path separators or `..`.

### ARCH-03 — No Authentication on Any API Route

- **Severity:** CRITICAL
- **Component:** All `app/src/app/api/` routes
- **Description:** No API route implements any form of authentication or authorization. All endpoints (including write operations like artifact approval, task updates, terminal commands) are publicly accessible.
- **Impact:** Any user on the network can read all data, modify project state, and execute commands.
- **Fix:** Implement authentication middleware (API keys, session tokens, or OAuth). At minimum, bind the server to localhost only.

---

## HIGH

### ARCH-04 — Missing Database Indexes

- **Severity:** HIGH
- **Component:** `engine/src/db.ts`, `grid.db` schema
- **Description:** No indexes exist beyond primary keys. Key queries filter on `project_id` (artifacts, tasks, worktrees, events), `task_number`, `type`, and `status` — all without indexes. The `events` table is queried with `ORDER BY id DESC LIMIT ?` per project, which requires a full table scan filtered by `project_id`.
- **Impact:** Query performance degrades linearly with data volume. Event log queries will become slow first.
- **Fix:** Add indexes:
  ```sql
  CREATE INDEX idx_artifacts_project ON artifacts(project_id, type);
  CREATE INDEX idx_tasks_project ON tasks(project_id, task_number);
  CREATE INDEX idx_worktrees_project ON worktrees(project_id);
  CREATE INDEX idx_events_project ON events(project_id, id);
  ```

### ARCH-05 — SSE Stream Resource Leak (agents/stream)

- **Severity:** HIGH
- **Component:** `app/src/app/api/agents/stream/route.ts`
- **Description:** The SSE endpoint calls `getAgentStatuses()` every 5 seconds, which does a full directory scan (`readdirSync` + `statSync` on every `.jsonl` file for every agent). This is O(agents × sessions) every 5s per connected client. The stream auto-closes after 5 minutes but there's no abort signal handling — if the client disconnects early, the interval keeps running until the 5-minute timeout.
- **Impact:** CPU and I/O waste; with multiple connected clients, this becomes a performance bottleneck.
- **Fix:** Add `req.signal.addEventListener('abort', ...)` cleanup (like the other SSE endpoint does). Consider caching status with a shared interval rather than per-connection polling.

### ARCH-06 — Inconsistent Task Status Values

- **Severity:** HIGH
- **Component:** `engine/src/db.ts` (`startTask` uses `'in_progress'`), `engine/src/orchestrator.ts` (`startBatch` uses `'in-progress'`)
- **Description:** Task status uses both `'in_progress'` and `'in-progress'` interchangeably. The `startTask` DB method writes `'in_progress'` while `Orchestrator.startBatch` writes `'in-progress'`. Status checks throughout the codebase use `['in-progress', 'in_progress'].includes(t.status)` as a workaround, but this is fragile.
- **Impact:** Inconsistent data in the database; any new code that forgets to check both variants will have bugs.
- **Fix:** Standardize on one format (recommend `in_progress`). Add a CHECK constraint on the column. Migrate existing data.

### ARCH-07 — Log Search Reads from Wrong Directory

- **Severity:** HIGH
- **Component:** `app/src/app/api/logs/search/route.ts`
- **Description:** The search endpoint reads from `~/.openclaw/sessions/` but the agents endpoint reads from `~/.openclaw/agents/{id}/sessions/`. These are different directories. The search endpoint likely finds nothing or stale data.
- **Impact:** Log search feature is broken or returns incomplete results.
- **Fix:** Update the search endpoint to scan `~/.openclaw/agents/*/sessions/` directories, matching the actual session storage layout.

### ARCH-08 — Synchronous File I/O in API Routes

- **Severity:** HIGH
- **Component:** `app/src/app/api/agents/route.ts`, `agents/[id]/session/route.ts`, `agents/status/route.ts`, `logs/search/route.ts`
- **Description:** All file operations use synchronous `readFileSync`, `readdirSync`, `statSync`. In Next.js API routes (which run on the Node.js event loop), synchronous I/O blocks the entire server for the duration of the read.
- **Impact:** Under load, a single slow file read (e.g., large session file) blocks all other requests.
- **Fix:** Use async `fs/promises` APIs (`readFile`, `readdir`, `stat`).

### ARCH-09 — JSON Parsing Without Schema Validation

- **Severity:** HIGH
- **Component:** `app/src/app/api/agents/route.ts` (reads `openclaw.json`), `engine/src/db.ts` (`parseProject` parses `model_config`), `app/src/lib/queries.ts`
- **Description:** `JSON.parse` is used on file contents and database fields without schema validation. Malformed `openclaw.json` crashes the agents list endpoint. Corrupted `model_config` in the DB crashes project queries. Individual JSONL line parsing is wrapped in try/catch (good), but top-level config parsing is not.
- **Impact:** A single corrupted config file or DB record crashes the entire API.
- **Fix:** Wrap top-level `JSON.parse` calls in try/catch with sensible defaults. Add schema validation (e.g., Zod).

---

## MEDIUM

### ARCH-10 — No Foreign Key Index Enforcement at Schema Level

- **Severity:** MEDIUM
- **Component:** `engine/src/db.ts` schema
- **Description:** Foreign keys are declared (`REFERENCES projects(id)`) and enforced via pragma, but there's no `ON DELETE CASCADE` or `ON DELETE RESTRICT`. Deleting a project leaves orphaned artifacts, tasks, worktrees, and events.
- **Impact:** Data integrity issues if projects are ever deleted; orphaned records accumulate.
- **Fix:** Add `ON DELETE CASCADE` to foreign key declarations, or implement application-level cascade delete.

### ARCH-11 — State Machine Gate Logic Mismatch

- **Severity:** MEDIUM
- **Component:** `engine/src/state.ts`
- **Description:** The `brainstorm → design` gate requires "at least one approved design artifact," but the `design → plan` gate requires "ALL design artifacts approved." This means a user in brainstorm phase can create multiple design artifacts, approve just one to pass the gate, then in design phase is blocked until all are approved. The brainstorm gate should arguably check for brainstorm-type artifacts, not design artifacts (or the naming is confusing).
- **Impact:** Confusing UX; users can get stuck if they create draft designs they don't intend to approve.
- **Fix:** Clarify the gate semantics. Consider: brainstorm gate checks for "at least one design draft created," design gate checks for "all designs approved."

### ARCH-12 — No Task Number Uniqueness Constraint

- **Severity:** MEDIUM
- **Component:** `engine/src/db.ts` schema, `tasks` table
- **Description:** There's no UNIQUE constraint on `(project_id, task_number)`. The `createTaskBatch` and `createTask` methods don't check for duplicates. Parsing a plan file twice creates duplicate task numbers.
- **Impact:** Duplicate tasks with the same number; CLI commands that find tasks by number (`tasks.find(t => t.task_number === n)`) will silently use the first match.
- **Fix:** Add `UNIQUE(project_id, task_number)` constraint.

### ARCH-13 — EventSource Connects to Non-Existent Endpoint

- **Severity:** MEDIUM
- **Component:** `app/src/app/project/[id]/client.tsx`
- **Description:** The client connects to `/api/events?projectId=${projectId}` but no such API route exists in the codebase. The `/api/events/route.ts` exists but likely doesn't handle the SSE protocol expected by `EventSource`.
- **Impact:** Real-time updates on the project page are broken. The UI shows "Reconnecting..." permanently.
- **Fix:** Either create the SSE endpoint at `/api/events` or update the client to use an existing stream endpoint.

### ARCH-14 — Singleton DB Connection in Next.js

- **Severity:** MEDIUM
- **Component:** `app/src/lib/db.ts`
- **Description:** The database connection is stored in a module-level singleton (`let db`). In Next.js with hot module reloading in development, this can leak connections. In production with multiple workers/serverless instances, this creates multiple connections without WAL coordination awareness.
- **Impact:** Potential DB locking issues; connection leaks in development.
- **Fix:** Use a connection pool or ensure proper cleanup. For serverless, consider opening/closing per request.

### ARCH-15 — Orchestrator Blocks on In-Progress Tasks

- **Severity:** MEDIUM
- **Component:** `engine/src/orchestrator.ts` — `getNextBatch()`
- **Description:** `getNextBatch()` returns `null` if any tasks are in-progress, even if there are independent pending tasks that could run in parallel. This forces serial batch execution.
- **Impact:** Suboptimal parallelism; can't start new tasks until the entire current batch completes.
- **Fix:** Allow configurable concurrency limits instead of blocking entirely on in-progress tasks.

### ARCH-16 — No CORS Configuration

- **Severity:** MEDIUM
- **Component:** All API routes
- **Description:** No CORS headers are set on any API route. If the dashboard is served on a different port/domain than the API, cross-origin requests will fail. Conversely, if running on localhost without CORS restrictions, any website the user visits can make requests to the API.
- **Impact:** Either broken cross-origin access or unintended cross-origin access from malicious sites (especially dangerous combined with ARCH-01 and ARCH-03).
- **Fix:** Add explicit CORS configuration in Next.js middleware, restricting to expected origins.

---

## LOW

### ARCH-17 — Terminal Command Blocklist is Security Theater

- **Severity:** LOW (subsumed by ARCH-01)
- **Component:** `app/src/app/api/terminal/route.ts`
- **Description:** The `BLOCKED` array checks for exact substring matches. Bypasses are trivial: `rm  -rf /` (double space), `$(rm -rf /)`, base64-encoded commands, `perl -e 'system("rm -rf /")'`, etc.
- **Impact:** False sense of security.
- **Fix:** Remove the endpoint (see ARCH-01). Blocklists cannot secure arbitrary command execution.

### ARCH-18 — Search Cache is Single-Entry

- **Severity:** LOW
- **Component:** `app/src/app/api/logs/search/route.ts`
- **Description:** The cache stores exactly one entry (`let cache`). Two users searching for different queries will thrash each other's cache. The 10-second TTL means even a single user gets no benefit on pagination or follow-up queries.
- **Impact:** Minimal caching benefit; misleading performance characteristics.
- **Fix:** Use an LRU cache with multiple entries, or remove the cache entirely since it provides negligible benefit.

### ARCH-19 — No Error Boundaries in Client Components

- **Severity:** LOW
- **Component:** `app/src/app/project/[id]/client.tsx` and other client components
- **Description:** Client components don't use React Error Boundaries. A JSON parsing error or unexpected data shape in SSE messages will crash the entire component tree.
- **Impact:** White screen on runtime errors; poor user experience.
- **Fix:** Add React Error Boundaries around key UI sections.

### ARCH-20 — Hardcoded HOME Path Fallback

- **Severity:** LOW
- **Component:** `engine/src/cli.ts`, `app/src/lib/db.ts`
- **Description:** The fallback for `process.env.HOME` is the literal string `'~'` in `app/src/lib/db.ts`, which Node.js won't expand (tilde expansion is a shell feature). The engine uses `'~'` as well. If `HOME` is unset, the DB path becomes `~/workspace/...` which fails.
- **Impact:** App crashes if `HOME` env var is unset (rare but possible in containerized environments).
- **Fix:** Use `os.homedir()` instead of `process.env.HOME ?? '~'`.

---

## Architecture Diagram

```
┌─────────────┐     ┌──────────────────────────┐     ┌─────────────┐
│  Next.js UI  │────▶│  Next.js API Routes       │────▶│  grid.db    │
│  (React/SSE) │     │  (NO AUTH — ARCH-03)       │     │  (SQLite)   │
└─────────────┘     │                            │     └─────────────┘
                    │  /api/terminal (RCE! ARCH-01)│
                    │  /api/agents/* (path trav)  │
                    │  /api/stream (SSE, fs.watch) │
                    │  /api/agents/stream (SSE)   │───▶ ~/.openclaw/
                    └──────────────────────────────┘     (fs reads)
                    
┌─────────────┐
│  Grid Engine │────▶ grid.db (direct, better-sqlite3)
│  CLI (node)  │     Status inconsistency (ARCH-06)
└─────────────┘
```

---

## Recommendations Priority

1. **Immediately:** Remove or disable `/api/terminal` (ARCH-01)
2. **Immediately:** Add path sanitization on all agent ID inputs (ARCH-02)
3. **Short-term:** Add authentication to all API routes (ARCH-03)
4. **Short-term:** Fix status value inconsistency (ARCH-06), add DB indexes (ARCH-04)
5. **Medium-term:** Fix SSE cleanup (ARCH-05), async I/O (ARCH-08), broken event stream (ARCH-13)
6. **Long-term:** Schema constraints (ARCH-10, ARCH-12), state machine refinement (ARCH-11)
