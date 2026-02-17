# Phase 1: Security Lockdown

### Task 1: Fix command injection in agent message/control APIs
Fix command injection in `/api/agents/[id]/message` and `/api/agents/[id]/control` — allowlist agent IDs, use `execFile` array form, allowlist actions. Agent: SENTINEL. Priority: P0.

### Task 2: Fix path traversal in files API
Fix path traversal in `/api/files` — resolve symlinks, block `..`, null bytes, validate canonical path inside workspace. Agent: SENTINEL. Priority: P0.

### Task 3: Fix git injection in soul API
Fix git injection in `/api/soul` — validate `revertHash` against `/^[a-f0-9]{7,40}$/`, use `execFile`. Agent: DEV. Priority: P0.

### Task 4: Add rate limiting and security headers
Add rate limiting middleware (100 req/min/IP) + security headers (CSP, HSTS, X-Frame-Options). Agent: DEV. Priority: P0.

### Task 5: Fix localhost auth bypass
Fix localhost auth bypass — validate `remoteAddress` not just `x-forwarded-for`; tighten CSRF to require Origin on mutations. Depends on Task 1. Agent: SENTINEL. Priority: P0.

### Task 6: Run npm audit fix and dependency cleanup
Run `npm audit fix`, add explicit `zod` dependency, remove unused `better-sqlite3` import if confirmed unused. Agent: GRID. Priority: P0.

### Task 7: BUG review all Phase 1 PRs
Security review of all Phase 1 changes — verify no command injection, path traversal, or auth bypass remains. Depends on Tasks 1-6. Agent: BUG. Priority: P0.
