# Grid Dashboard — Unified Backlog

> Last updated: 2026-02-17 | Sources: AUDIT-ATLAS (43 issues), AUDIT-VAULT (20 issues), SAGE UX Review, BACKLOG-VIDCLAW (8 features)
> Deduplicated and prioritized. Items tagged with source: [ATLAS], [VAULT], [SAGE], [VIDCLAW]

---

## Wave 7 — Security & Stability (P0 — MUST DO FIRST)

These are non-negotiable. Ship nothing else until these are resolved.

| ID | Title | Scope | Source |
|----|-------|-------|--------|
| SEC-01 | Remove/sandbox `/api/terminal` endpoint (RCE vulnerability) | S | ATLAS AUD-01, VAULT ARCH-01 |
| SEC-02 | Fix command injection in agent message/control APIs (use `execFile` with args array) | S | ATLAS AUD-02, AUD-03 |
| SEC-03 | Add path traversal protection on all agent ID inputs (strict regex `^[a-zA-Z0-9_-]+$`) | S | ATLAS AUD-07, VAULT ARCH-02 |
| SEC-04 | Add authentication middleware to all API routes (API key or localhost-only binding) | M | ATLAS AUD-04, VAULT ARCH-03 |
| SEC-05 | Fix command injection risk in health API (use Node.js `os` APIs instead of shell) | S | ATLAS AUD-16 |
| SEC-06 | Add CORS configuration in Next.js middleware | S | VAULT ARCH-16 |
| SEC-07 | Add CSRF protection on mutating endpoints | S | ATLAS AUD-18 |
| SEC-08 | Sanitize agent config write endpoint (validate resolved path is within expected dir) | S | ATLAS AUD-30 |

---

## Wave 8 — Core Reliability (P0)

Error handling, broken features, data integrity.

| ID | Title | Scope | Source |
|----|-------|-------|--------|
| REL-01 | Add root `error.tsx` + per-route error boundaries | S | ATLAS AUD-05, AUD-33, VAULT ARCH-19 |
| REL-02 | Fix 5 broken nav links (`/tools/*` → root paths) | S | ATLAS AUD-06 |
| REL-03 | Fix log search reading from wrong directory (`sessions/` → `agents/*/sessions/`) | S | VAULT ARCH-07 |
| REL-04 | Standardize task status values (`in_progress` only, add CHECK constraint, migrate data) | M | VAULT ARCH-06 |
| REL-05 | Add `loading.tsx` / Suspense boundaries for all route segments | M | ATLAS AUD-14 |
| REL-06 | Fix SSE stream resource leak (add abort signal cleanup, shared watcher singleton) | M | ATLAS AUD-10, VAULT ARCH-05 |
| REL-07 | Convert synchronous file I/O to async `fs/promises` in all API routes | M | VAULT ARCH-08 |
| REL-08 | Fix database singleton pattern (`globalThis` for dev, connection error handling) | S | ATLAS AUD-17, VAULT ARCH-14 |
| REL-09 | Fix `os.homedir()` fallback instead of `process.env.HOME ?? '~'` | S | ATLAS AUD-42, VAULT ARCH-20 |
| REL-10 | Add input validation (zod schemas) on all mutating API endpoints | M | ATLAS AUD-09 |
| REL-11 | Add JSON schema validation on config/DB field parsing (wrap `JSON.parse` with defaults) | S | VAULT ARCH-09 |
| REL-12 | Fix broken EventSource connecting to non-existent `/api/events` endpoint | S | VAULT ARCH-13 |
| REL-13 | Add DB indexes on foreign keys (artifacts, tasks, worktrees, events) | S | VAULT ARCH-04 |
| REL-14 | Add `UNIQUE(project_id, task_number)` constraint on tasks table | S | VAULT ARCH-12 |
| REL-15 | Add `ON DELETE CASCADE` to foreign key declarations | S | VAULT ARCH-10 |
| REL-16 | Fix orchestrator to allow parallel task execution (configurable concurrency) | M | VAULT ARCH-15 |

---

## Wave 9 — UX & Quality (P1)

Polish, consistency, real data over mocks.

| ID | Title | Scope | Source |
|----|-------|-------|--------|
| UX-01 | Replace mock/stub APIs with real implementations or return 501 | L | ATLAS AUD-15, SAGE |
| UX-02 | Consolidate 3 office views into 1 (keep isometric, remove living-office + pixel-hq) | M | SAGE |
| UX-03 | Replace hardcoded colors with `var(--grid-*)` design tokens across all components | M | ATLAS AUD-22 |
| UX-04 | Standardize styling: Tailwind + CSS vars only, eliminate inline styles | M | ATLAS AUD-23 |
| UX-05 | Replace `<a href>` with Next.js `<Link>` for internal navigation | S | ATLAS AUD-28 |
| UX-06 | Add confirmation dialogs for destructive actions (delete budgets, cron jobs, etc.) | S | ATLAS AUD-29 |
| UX-07 | Fix `alert()` usage → use NotificationCenter | S | ATLAS AUD-37 |
| UX-08 | Add loading spinners/skeletons to all client components that fetch data | M | ATLAS AUD-27 |
| UX-09 | Replace agents page SAMPLE_AGENTS with real data + proper empty state | S | ATLAS AUD-25, SAGE |
| UX-10 | Fix server page try/catch (page.tsx crashes if DB unavailable) | S | ATLAS AUD-13 |
| UX-11 | Remove low-value features: achievement badges, sound effects provider | S | SAGE |
| UX-12 | Fix silent error swallowing (empty `catch {}` → log + user feedback) | M | ATLAS AUD-12 |
| UX-13 | Fix command palette `role="dialog"`, focus trap, ARIA attributes | S | ATLAS AUD-21 |
| UX-14 | Fix nav-bar ARIA: `aria-expanded`, `aria-haspopup`, keyboard nav | S | ATLAS AUD-19 |
| UX-15 | Add text labels to color-only status indicators (accessibility) | S | ATLAS AUD-20 |
| UX-16 | Fix search trigger (shared context instead of synthetic KeyboardEvent) | S | ATLAS AUD-31 |
| UX-17 | Replace mock analytics endpoints with real data or remove | S | ATLAS AUD-32 |
| UX-18 | Add `not-found.tsx` for dynamic route segments | S | ATLAS AUD-38 |
| UX-19 | Lazy-load heavy components (isometric-office, session-heatmap) via `next/dynamic` | S | ATLAS AUD-39 |
| UX-20 | Add auto-refresh pause/resume button to metrics page | S | ATLAS AUD-41 |
| UX-21 | Fix mobile menu z-index stacking issues | S | ATLAS AUD-43 |
| UX-22 | Fix LRU cache for log search (replace single-entry cache) | S | VAULT ARCH-18 |
| UX-23 | Clarify state machine gate semantics (brainstorm → design gate) | S | VAULT ARCH-11 |
| UX-24 | Persist workflow instances to SQLite (currently in-memory, lost on restart) | M | ATLAS AUD-08 |

---

## Wave 10 — VidClaw Features (P1)

New features inspired by competitor analysis.

| ID | Title | Scope | Source |
|----|-------|-------|--------|
| VID-01 | Kanban Task Board (drag-drop, priorities, agent assignment, multi-agent swimlanes) | L | VIDCLAW |
| VID-02 | Skills Manager Panel (browse, toggle, create, per-agent assignment) | M | VIDCLAW |
| VID-03 | Soul Editor + git-based version history + diff view + persona templates | M | VIDCLAW |
| VID-04 | Activity Calendar (monthly view, parsed from memory files, multi-agent) | S | VIDCLAW |
| VID-05 | Workspace Content Browser (file tree, markdown preview, syntax highlighting) | M | VIDCLAW |
| VID-06 | Rate Limit Window Progress Bars (navbar widget) | S | VIDCLAW |
| VID-07 | Model Hot-Switch from Navbar (per-agent model override) | S | VIDCLAW |
| VID-08 | Task Auto-Pickup via Heartbeat Integration (depends VID-01) | M | VIDCLAW |

---

## Summary

| Wave | Focus | Items | Priority |
|------|-------|-------|----------|
| 7 | Security & Stability | 8 | P0 |
| 8 | Core Reliability | 16 | P0 |
| 9 | UX & Quality | 24 | P1 |
| 10 | VidClaw Features | 8 | P1 |
| **Total** | | **56** | |

---

## Completed (Waves 1-6)

<details>
<summary>Previously completed items (click to expand)</summary>

### Wave 1 (9 P0s) ✅
SSE stream, live activity, state machine, speech bubbles, status sprites, send message, pause/kill, cost dashboard, keyboard nav

### Wave 2 (9 P1s) ✅
Token counter, error dashboard, health checks, sub-agent tree, spawn form, agent scorecards, session heatmap

### Wave 3 (8 tasks) ✅
Cache fix, error feedback, performance, polish, flame graph, log search, agent animations, day/night cycle

### Wave 4 (7 P1s) ✅
Theme switcher, notifications, global search, dashboard grid, quick actions, office zones, escalation rules

### Wave 5 (7 items) ✅
Responsive mobile, agent config editor, cron manager, trend alerts, dependency graph, report generator, tool call heatmap

### Wave 6 (partial) ⚠️
Some items delivered (bulk ops, snapshots, etc.) but wave incomplete — remaining items merged into Waves 7-10.

</details>
