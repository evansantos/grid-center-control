# Wave 11 — Unified Execution Plan

**Date:** February 17, 2026  
**Author:** CEO Agent  
**Sources:** ARCH-REVIEW, SENTINEL-AUDIT, ATLAS-METRICS, SAGE-REVIEW, VAULT-REVIEW  
**Status:** APPROVED — Ready for execution

---

## Executive Summary

Five specialist agents audited the Grid Dashboard and found **critical blockers** across security, data integrity, and architecture. The dashboard's "Mission Control" promise is undermined by: command injection vulnerabilities, a Kanban board reading from nonexistent files (82 tasks invisible), disabled foreign keys, zero test coverage, and sample data instead of real fleet status.

Wave 11 fixes this in **4 phases over ~4 weeks**, prioritizing security (can't ship with RCE), then data integration (must show real data), then hardening, then polish.

**Key numbers:** 2 critical security vulns, 82 invisible tasks, 0 tests, 37 `any` types, 181 commented blocks, 3.5MB uncontrolled WAL.

---

## Phase 1: Security Lockdown (P0) — Days 1–3

*Nothing ships until command injection and path traversal are eliminated.*

| ID | Item | Agent | Priority | Size | Depends |
|----|------|-------|----------|------|---------|
| W11-01 | Fix command injection in `/api/agents/[id]/message` and `/api/agents/[id]/control` — allowlist agent IDs, use `execFile` array form, allowlist actions | SENTINEL | P0 | M | — |
| W11-02 | Fix path traversal in `/api/files` — resolve symlinks, block `..`, null bytes, validate canonical path inside workspace | SENTINEL | P0 | M | — |
| W11-03 | Fix git injection in `/api/soul` — validate `revertHash` against `/^[a-f0-9]{7,40}$/`, use `execFile` | DEV | P0 | S | — |
| W11-04 | Add rate limiting middleware (100 req/min/IP) + security headers (CSP, HSTS, X-Frame-Options) | DEV | P0 | M | — |
| W11-05 | Fix localhost auth bypass — validate `remoteAddress` not just `x-forwarded-for`; tighten CSRF to require Origin on mutations | SENTINEL | P0 | S | W11-01 |
| W11-06 | Run `npm audit fix`, add explicit `zod` dependency, remove unused `better-sqlite3` import if confirmed unused | GRID | P0 | S | — |
| W11-07 | **BUG review** all Phase 1 PRs — no exceptions | BUG | P0 | M | W11-01..06 |

**Round structure:** SENTINEL(W11-01) + DEV(W11-03) + GRID(W11-06) parallel → SENTINEL(W11-02) + DEV(W11-04) → SENTINEL(W11-05) → BUG(W11-07)

**Exit criteria:** Zero command injection, zero path traversal, all API inputs validated. Manual pentest by SENTINEL confirms.

---

## Phase 2: Data Integration (P0) — Days 4–8

*Kanban must read grid.db. Dashboard must show real fleet. Alerts must stop faking data.*

| ID | Item | Agent | Priority | Size | Depends |
|----|------|-------|----------|------|---------|
| W11-08 | Rewrite `/api/kanban` to read tasks from grid.db via `lib/queries.ts` — GROUP BY status into columns | DEV | P0 | M | — |
| W11-09 | Rewrite `/api/kanban/move` to UPDATE task status in grid.db | DEV | P0 | S | W11-08 |
| W11-10 | Rewrite `/api/kanban/run` to update grid.db + optionally write HEARTBEAT.md | DEV | P0 | S | W11-08 |
| W11-11 | Fix `/api/alerts` schema mismatch (`type`→`event_type`, `data`→`details`), remove mock data fallback entirely | DEV | P0 | S | — |
| W11-12 | Replace sample agents on Agents page with real OpenClaw agent detection (scan `~/.openclaw/agents/`) | GRID | P0 | M | — |
| W11-13 | Create shared agent service layer: `lib/agents/{index,sessions,config}.ts` — consolidate 5 duplicated filesystem scanning implementations | GRID | P0 | L | — |
| W11-14 | Build Fleet Status widget for dashboard — real-time agent grid (active/idle/error count) using shared agent service | PIXEL | P0 | M | W11-13 |
| W11-15 | **BUG review** all Phase 2 PRs | BUG | P0 | M | W11-08..14 |

**Round structure:** DEV(W11-08) + GRID(W11-12) + PIXEL(prep W11-14 designs) parallel → DEV(W11-09,10,11) + GRID(W11-13) → PIXEL(W11-14) → BUG(W11-15)

**Exit criteria:** Kanban shows 82 real tasks from grid.db. Move/run update DB. Agents page shows real fleet. Alerts show real events. Fleet Status widget live on dashboard.

---

## Phase 3: DB Hardening & Quality Foundation (P1) — Days 9–16

*Database must be production-grade. Testing infrastructure must exist.*

| ID | Item | Agent | Priority | Size | Depends |
|----|------|-------|----------|------|---------|
| W11-16 | Enable foreign keys: `PRAGMA foreign_keys = ON` in `db.ts` on every connection, run `PRAGMA foreign_key_check` | DEV | P1 | S | — |
| W11-17 | Apply missing indexes from `005_add_indexes.sql` (idx_artifacts_project, idx_tasks_project, idx_worktrees_project, idx_events_project) | DEV | P1 | S | — |
| W11-18 | WAL checkpoint strategy: add `PRAGMA wal_checkpoint(TRUNCATE)` on app startup + daily cron | DEV | P1 | S | — |
| W11-19 | Implement automated backup: `sqlite3 grid.db ".backup"` script + retention policy (7 days) | DEV | P1 | M | — |
| W11-20 | Add CHECK constraints for status fields (tasks.status IN ('pending','in_progress','review','done','failed')) | DEV | P1 | S | W11-16 |
| W11-21 | Set up testing infrastructure: Jest + React Testing Library + first smoke tests for API routes (target: critical paths) | ATLAS | P1 | L | — |
| W11-22 | Add error boundaries at page level (Mission Control, Kanban, Agents) + centralized error handler | GRID | P1 | M | — |
| W11-23 | Sanitize error responses: generic errors in production, detailed in dev only | DEV | P1 | S | — |
| W11-24 | Replace 37 `any` types with proper interfaces — strict TypeScript pass | ATLAS | P1 | M | W11-21 |
| W11-25 | **BUG review** all Phase 3 PRs | BUG | P1 | L | W11-16..24 |

**Round structure:** DEV(W11-16,17,18) + ATLAS(W11-21) + GRID(W11-22) parallel → DEV(W11-19,20,23) + ATLAS(W11-24) → BUG(W11-25)

**Exit criteria:** FK enforced, indexes applied, WAL <1MB after checkpoint, backup automated, ≥10 smoke tests passing, zero `any` types, error boundaries on all pages.

---

## Phase 4: Quality & UX Polish (P2) — Days 17–25

*Refactor monsters, clean dead code, polish fleet experience.*

| ID | Item | Agent | Priority | Size | Depends |
|----|------|-------|----------|------|---------|
| W11-26 | Split `living-office.tsx` (1,454 lines) into ≤300-line components: extract state management, agent visualization, animations | GRID | P2 | L | W11-21 |
| W11-27 | Split `isometric-office.tsx` (1,094 lines) similarly | GRID | P2 | L | W11-26 |
| W11-28 | Remove 181 commented-out code blocks across codebase | ATLAS | P2 | M | — |
| W11-29 | Standardize import patterns (absolute imports via `@/`), add barrel exports | ATLAS | P2 | S | — |
| W11-30 | Replace SSE `fs.watch` with single server-side poller broadcasting to all clients (fix macOS reliability + scalability) | DEV | P2 | L | W11-13 |
| W11-31 | Build Task Distribution widget for dashboard — workload heatmap across agents, queue depth, bottleneck detection | PIXEL | P2 | M | W11-13, W11-14 |
| W11-32 | Add agent assignment indicators to Kanban task cards | PIXEL | P2 | S | W11-08 |
| W11-33 | Replace inline styles in `kanban/client.tsx` with Tailwind classes | PIXEL | P2 | S | W11-32 |
| W11-34 | Implement proper migration runner with version tracking in grid.db | DEV | P2 | M | W11-16 |
| W11-35 | **BUG review** all Phase 4 PRs | BUG | P2 | L | W11-26..34 |

**Round structure:** GRID(W11-26) + ATLAS(W11-28) + DEV(W11-30) + PIXEL(W11-32) parallel → GRID(W11-27) + ATLAS(W11-29) + PIXEL(W11-31,33) + DEV(W11-34) → BUG(W11-35)

**Exit criteria:** No component >300 lines, zero commented-out blocks, SSE stable on macOS, fleet widgets live, migration system operational.

---

## Dependency Graph

```
Phase 1 (Security):
  W11-01 ──► W11-05
  W11-01..06 ──► W11-07 (BUG review)

Phase 2 (Data):
  W11-08 ──► W11-09, W11-10
  W11-13 ──► W11-14
  W11-08..14 ──► W11-15 (BUG review)

Phase 3 (Hardening):
  W11-16 ──► W11-20
  W11-21 ──► W11-24
  W11-16..24 ──► W11-25 (BUG review)

Phase 4 (Polish):
  W11-21 ──► W11-26 ──► W11-27
  W11-13 ──► W11-30, W11-31
  W11-08 ──► W11-32 ──► W11-33
  W11-16 ──► W11-34
  W11-26..34 ──► W11-35 (BUG review)

Cross-phase:
  Phase 1 ──► Phase 2 (security must land first)
  Phase 2 ──► Phase 3 (data integration before hardening)
  Phase 3 ──► Phase 4 (tests before refactoring)
```

---

## Agent Utilization Matrix

| Agent | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Total Items |
|-------|---------|---------|---------|---------|-------------|
| SENTINEL | W11-01,02,05 | — | — | — | 3 |
| DEV | W11-03,04 | W11-08,09,10,11 | W11-16,17,18,19,20,23 | W11-30,34 | 14 |
| GRID | W11-06 | W11-12,13 | W11-22 | W11-26,27 | 6 |
| PIXEL | — | W11-14 | — | W11-31,32,33 | 4 |
| ATLAS | — | — | W11-21,24 | W11-28,29 | 4 |
| BUG | W11-07 | W11-15 | W11-25 | W11-35 | 4 |

**Max concurrent per round:** 5 (within constraint)

---

## Success Criteria

| Metric | Before | After Wave 11 |
|--------|--------|---------------|
| Command injection vulns | 2 critical | 0 |
| Path traversal vulns | 1 critical | 0 |
| Kanban visible tasks | 0 | 82 |
| Agents page: real agents | 0 (sample data) | 14+ (real fleet) |
| Mock data endpoints | 1 (alerts) | 0 |
| Foreign key enforcement | OFF | ON |
| DB indexes applied | 0 | 4 |
| WAL size | 3.5MB uncontrolled | <1MB checkpointed |
| Test coverage | 0% | ≥30% critical paths |
| `any` types | 37 | 0 |
| Commented-out blocks | 181 | 0 |
| Components >1000 lines | 2 | 0 |
| Fleet status on dashboard | No | Yes |
| Automated backup | No | Yes (daily) |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Security fix breaks agent APIs | Medium | High | BUG review + SENTINEL retest all endpoints after fix |
| Kanban rewrite loses edge cases | Medium | Medium | Compare old filesystem logic against new DB queries; test with real 82 tasks |
| FK enabling reveals hidden orphans | Low | Medium | Run `PRAGMA foreign_key_check` before enabling; fix violations first |
| Monster component split introduces regressions | Medium | Medium | Tests (W11-21) must land before refactoring (W11-26,27) |
| SSE rewrite breaks real-time updates | Medium | High | Keep old `fs.watch` as fallback flag during transition |
| DEV agent overloaded (14 items) | High | Medium | Parallelize DB tasks (S-sized) in batches; items are intentionally small |

---

## Execution Notes

1. **Phase gates are hard:** Phase 2 does NOT start until BUG approves Phase 1 security fixes.
2. **SENTINEL retests:** After Phase 1, SENTINEL runs full pentest against the same PoCs from the audit.
3. **BUG is the bottleneck by design:** Every line of code gets reviewed. Budget BUG time accordingly.
4. **DEV carries the heaviest load** but most items are S-sized DB/backend tasks that can batch quickly.
5. **PIXEL starts design work early** in Phase 2 while waiting for GRID to finish the agent service layer.

---

*Wave 11 targets: Ship a Grid Dashboard that is secure, shows real data, and earns the "Mission Control" name.*
