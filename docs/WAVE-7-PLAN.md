# Wave 7 Execution Plan — Security & Stability

> CEO directive | 2026-02-17 | Priority: P0 CRITICAL
> Nothing ships until Wave 7 is complete.

---

## Backlog Review & Validation

**Verdict: Priorities are correct.** All 8 items are legitimate P0 security issues. One reordering recommended below.

**Challenge:** SEC-06 (CORS) and SEC-07 (CSRF) are lower severity than the others — they matter for browser-based attacks but SEC-01 through SEC-05 are active RCE/injection vectors. However, they're small enough to run in parallel so no reason to defer.

---

## Execution Order (reordered by criticality + dependency)

### Phase A — Critical RCE/Injection (PARALLEL, immediate start)

These are the "building is on fire" items. All independent, all small scope.

| Batch | Items | Worker | Rationale |
|-------|-------|--------|-----------|
| A1 | **SEC-01** Remove/sandbox `/api/terminal` | SENTINEL | RCE — highest severity. Remove endpoint entirely or sandbox with extreme prejudice. |
| A2 | **SEC-02** Fix command injection in agent APIs | DEV-1 | Use `execFile` with args array. SENTINEL reviews. |
| A3 | **SEC-05** Fix command injection in health API | DEV-2 | Replace shell calls with `os` module. Small, fast. |
| A4 | **SEC-03** Path traversal protection | DEV-3 | Add strict regex validation `^[a-zA-Z0-9_-]+$` on all agent ID inputs. |

**All 4 run simultaneously.** Each gets its own git worktree. BUG reviews every PR.

### Phase B — Auth & Boundaries (PARALLEL, start after Phase A merges)

| Batch | Items | Worker | Rationale |
|-------|-------|--------|-----------|
| B1 | **SEC-04** Authentication middleware | SENTINEL | This is the big one (M scope). Add API key or localhost-only binding to all routes. Must merge AFTER A1-A4 so auth wraps the already-fixed endpoints. |
| B2 | **SEC-08** Sanitize config write endpoint | DEV-1 | Validate resolved path within expected dir. Quick. |

**Why B after A:** SEC-04 (auth middleware) touches every route. If we merge it first, the Phase A fixes would have merge conflicts. Fix the endpoints first, then wrap them with auth.

### Phase C — Browser Hardening (PARALLEL with Phase B)

| Batch | Items | Worker | Rationale |
|-------|-------|--------|-----------|
| C1 | **SEC-06** CORS configuration | DEV-2 | Next.js middleware config. Independent of auth. |
| C2 | **SEC-07** CSRF protection | DEV-3 | Mutating endpoints only. Can run alongside CORS. |

**C can start alongside B** — these are middleware-level changes in different code paths.

---

## SPEC Instructions

```
WAVE 7 ORCHESTRATION — SECURITY SPRINT

LEAD AGENT: SENTINEL
REVIEW AGENT: BUG (mandatory on ALL PRs, no exceptions)

PHASE A (parallel, 4 worktrees):
  - grid worktree create sec-01-terminal → SENTINEL
  - grid worktree create sec-02-cmd-injection → DEV worker 1
  - grid worktree create sec-05-health-injection → DEV worker 2  
  - grid worktree create sec-03-path-traversal → DEV worker 3
  
  SENTINEL provides security guidance to all Phase A workers.
  Each item = 1 Grid CLI project, 1 worktree, 1 PR.
  BUG reviews each PR before merge.

PHASE B (after Phase A merges, 2 worktrees):
  - grid worktree create sec-04-auth-middleware → SENTINEL
  - grid worktree create sec-08-config-sanitize → DEV worker 1

PHASE C (parallel with B, 2 worktrees):
  - grid worktree create sec-06-cors → DEV worker 2
  - grid worktree create sec-07-csrf → DEV worker 3

GATE: All 8 items merged + BUG approved → Wave 7 COMPLETE.
Do NOT start Wave 8 until gate passes.
```

### Worker Allocation

- **SENTINEL**: Leads. Owns SEC-01 (Phase A) and SEC-04 (Phase B). Reviews all other security PRs for correctness before BUG does final review.
- **DEV workers (3)**: Execute SEC-02, SEC-03, SEC-05, SEC-06, SEC-07, SEC-08 across phases.
- **BUG**: Reviews ALL code. Two-pass: SENTINEL security review → BUG code review → merge.
- **ARCH**: Available for consultation if SEC-04 auth design needs architectural input.

### Estimated Timeline

- Phase A: ~2-3 hours (all S scope, parallel)
- Phase B+C: ~3-4 hours (SEC-04 is M scope, rest are S)
- Total: **~5-7 hours** wall clock with parallel execution

---

## Waves 8-10 Strategic Notes

### Wave 8 — Core Reliability (16 items, P0)
- **Batch strategy**: Group by subsystem — DB items (REL-08, REL-13, REL-14, REL-15) together, file I/O items (REL-07, REL-09) together, error handling (REL-01, REL-12) together, SSE/streaming (REL-06) standalone.
- **Risk**: REL-04 (task status migration) and REL-16 (parallel orchestrator) are the most complex. Consider early starts.
- **Dependency**: REL-10 (zod validation) should come AFTER Wave 7's SEC-04 auth middleware to avoid double-refactoring routes.

### Wave 9 — UX & Quality (24 items, P1)
- Largest wave. Split into 3-4 sub-phases by theme: cleanup/removal (UX-02, UX-11, UX-17), styling (UX-03, UX-04), accessibility (UX-13, UX-14, UX-15), and functional fixes (everything else).
- PIXEL should lead styling/a11y items. SAGE for UX validation.
- Many S-scope items — high parallelism potential (6-8 concurrent worktrees).

### Wave 10 — VidClaw Features (8 items, P1)
- Feature work. Fun stuff. VID-01 (Kanban) is the centerpiece — start it first, others can build around it.
- VID-08 depends on VID-01 — schedule last.
- ARCH should design VID-01 and VID-05 before DEV starts coding.

---

*Plan authored by CEO. Execute via SPEC. No deviations without escalation.*
