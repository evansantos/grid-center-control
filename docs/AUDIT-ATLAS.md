# GRID Dashboard — Full Application Audit

**Auditor:** Atlas  
**Date:** 2026-02-17  
**App:** `~/workspace/mcp-projects/grid/app/`  
**Build Status:** ✅ Clean (no errors, no warnings)  
**TypeScript:** ✅ `tsc --noEmit` passes  
**npm audit:** ⚠️ 10 moderate vulnerabilities (all in eslint toolchain)

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 5 |
| HIGH | 12 |
| MEDIUM | 16 |
| LOW | 10 |
| **Total** | **43** |

---

## CRITICAL

### AUD-01 — Remote Code Execution via Terminal API
- **Severity:** CRITICAL
- **File:** `src/app/api/terminal/route.ts`
- **Description:** Accepts arbitrary shell commands via POST and executes them with `execSync`. The blocklist (`rm -rf /`, `mkfs`, etc.) is trivially bypassed (e.g., `rm -rf  /` with extra space, base64-encoded commands, backticks, `$()` substitution).
- **Suggested fix:** Remove this endpoint entirely, or implement a strict allowlist of commands with argument validation. Never pass user input to shell execution.

### AUD-02 — Command Injection in Agent Message API
- **Severity:** CRITICAL
- **File:** `src/app/api/agents/[id]/message/route.ts`
- **Description:** User-supplied `message` is interpolated into a shell command via single-quote escaping (`replace(/'/g, "'\\''")`) which is insufficient. Payloads with `$(...)` or backticks can escape.
- **Suggested fix:** Use `execFile` with an array of arguments instead of `execAsync` with string interpolation. Or use a Node.js API/IPC instead of shelling out.

### AUD-03 — Command Injection in Agent Control API
- **Severity:** CRITICAL
- **File:** `src/app/api/agents/[id]/control/route.ts`
- **Description:** While agent ID is validated with regex `^[a-zA-Z0-9_-]+$`, the approach of building shell command strings is fragile. Any future relaxation of the regex would introduce injection.
- **Suggested fix:** Use `execFile(['openclaw', 'agent', action, id])` with argument array instead of string concatenation.

### AUD-04 — No Authentication on Any API Route
- **Severity:** CRITICAL
- **File:** All files in `src/app/api/`
- **Description:** Zero authentication or authorization on any endpoint. The terminal endpoint (AUD-01) combined with no auth means anyone with network access has full RCE.
- **Suggested fix:** Add authentication middleware. At minimum, require an API key or session token for all mutating endpoints.

### AUD-05 — No Error Boundary in App
- **Severity:** CRITICAL
- **File:** `src/app/layout.tsx`
- **Description:** No React Error Boundary wraps the application. Any unhandled component error crashes the entire UI with a white screen.
- **Suggested fix:** Add a root `error.tsx` in `src/app/` and consider per-route error boundaries.

---

## HIGH

### AUD-06 — Broken Navigation Links
- **Severity:** HIGH
- **File:** `src/components/nav-bar.tsx`
- **Description:** The `toolsGroup` links point to `/tools/spawn`, `/tools/logs`, `/tools/tokens`, `/tools/errors`, `/tools/health` — but pages exist at `/spawn`, `/logs`, `/tokens`, `/errors`, `/health`. All 5 links are 404s.
- **Suggested fix:** Change hrefs to `/spawn`, `/logs`, `/tokens`, `/errors`, `/health`.

### AUD-07 — Path Traversal Risk in Session/Log APIs
- **Severity:** HIGH
- **Files:** `src/app/api/agents/[id]/session/route.ts`, `src/app/api/logs/search/route.ts`, `src/app/api/activity/route.ts`, `src/app/api/subagents/route.ts`, `src/app/api/errors/route.ts`, `src/app/api/tokens/route.ts`
- **Description:** Multiple routes construct filesystem paths using `process.env.HOME` and user-controlled parameters without sanitizing for `..` traversal. While some use `path.join()`, the agent ID parameter could contain path traversal sequences.
- **Suggested fix:** Validate all path components against a strict allowlist regex. Use `path.resolve()` and verify the result is within the expected directory.

### AUD-08 — In-Memory State Lost on Restart
- **Severity:** HIGH
- **File:** `src/app/api/workflows/route.ts`
- **Description:** Workflow instances are stored in a module-level `instances` array. All running workflow state is lost on server restart or deployment.
- **Suggested fix:** Persist workflow instances to the SQLite database.

### AUD-09 — Missing Input Validation on Mutating Endpoints
- **Severity:** HIGH
- **Files:** `src/app/api/artifacts/[id]/route.ts`, `src/app/api/settings/budgets/route.ts`, `src/app/api/workflows/route.ts`, `src/app/api/spawn/route.ts`
- **Description:** Multiple POST/PUT endpoints accept JSON bodies without validating required fields, types, or bounds. Examples: budget amounts could be negative, workflow `stepIndex` not bounds-checked, artifact `projectId` not validated.
- **Suggested fix:** Add input validation (e.g., zod schemas) for all request bodies.

### AUD-10 — SSE Stream Resource Leak
- **Severity:** HIGH
- **File:** `src/app/api/stream/route.ts`
- **Description:** Creates filesystem watchers for every SSE connection. With many concurrent clients, this could exhaust file descriptor limits. No connection limit enforced.
- **Suggested fix:** Use a shared watcher singleton that broadcasts to connected clients. Add connection limits.

### AUD-11 — Agent Status Stream Hardcoded 5s Polling
- **Severity:** HIGH
- **File:** `src/app/api/agents/stream/route.ts`
- **Description:** Polls filesystem every 5 seconds per connected client, doing `readdirSync` + `statSync` on every agent's sessions directory. This creates O(clients × agents × files) filesystem calls.
- **Suggested fix:** Use filesystem watchers instead of polling, or use a shared singleton.

### AUD-12 — Silent Error Swallowing
- **Severity:** HIGH
- **Files:** `src/app/api/logs/search/route.ts`, `src/app/api/agents/[id]/session/route.ts`, multiple components
- **Description:** Empty `catch {}` blocks throughout the codebase silently swallow errors, making debugging impossible and hiding real failures.
- **Suggested fix:** At minimum log errors. In API routes, return proper error responses.

### AUD-13 — Root Page Missing Error Handling
- **Severity:** HIGH
- **File:** `src/app/page.tsx`
- **Description:** Server component calls `listProjects()` and `taskStats()` without try-catch. If the database is unavailable, the entire page crashes.
- **Suggested fix:** Wrap in try-catch and show a fallback UI.

### AUD-14 — Missing Suspense Boundaries
- **Severity:** HIGH
- **Files:** All page.tsx files
- **Description:** No `loading.tsx` or `<Suspense>` boundaries anywhere in the app. Server-rendered pages block fully until data loads, and client-side navigation shows no loading indicator.
- **Suggested fix:** Add `loading.tsx` files for each route segment, or wrap async components in `<Suspense>`.

### AUD-15 — Mock/Placeholder Data in Production APIs
- **Severity:** HIGH
- **Files:** `src/app/api/settings/secrets/route.ts`, `src/app/api/spawn/route.ts`, `src/app/api/agents/bulk/route.ts`, `src/app/api/agents/[id]/action/route.ts`, `src/app/api/agents/graph/route.ts`
- **Description:** Multiple API routes return hardcoded mock data or are pure stubs. The secrets route returns fake API key data. The action route just echoes back "Action queued" without doing anything.
- **Suggested fix:** Implement real functionality or clearly mark as unimplemented with 501 status.

### AUD-16 — Command Injection in Health API
- **Severity:** HIGH
- **File:** `src/app/api/health/route.ts`
- **Description:** Uses `execAsync` for system health checks. While commands are hardcoded (not user input), running shell commands for health checks is fragile and opens the door to future injection if parameterized.
- **Suggested fix:** Use Node.js APIs (e.g., `os.loadavg()`, `process.memoryUsage()`) instead of shelling out.

### AUD-17 — Database Singleton Not Connection-Safe
- **Severity:** HIGH
- **File:** `src/lib/db.ts`
- **Description:** Module-level `db` variable in a serverless-compatible framework (Next.js) may behave unexpectedly. In development, hot reloading creates multiple instances. No connection cleanup or error recovery.
- **Suggested fix:** Use `globalThis` pattern for dev mode persistence, add connection error handling.

---

## MEDIUM

### AUD-18 — No CSRF Protection
- **Severity:** MEDIUM
- **Files:** All POST/PUT/DELETE API routes
- **Description:** No CSRF tokens or origin validation on any mutating endpoint.
- **Suggested fix:** Add origin checking middleware or CSRF token validation.

### AUD-19 — Accessibility: Missing ARIA Attributes on Dropdowns
- **Severity:** MEDIUM
- **File:** `src/components/nav-bar.tsx`
- **Description:** Dropdown buttons lack `aria-expanded`, `aria-haspopup`, `aria-controls`. Dropdown menus lack `role="menu"` and `role="menuitem"`. No keyboard navigation (arrow keys, Escape).
- **Suggested fix:** Add proper ARIA attributes and keyboard event handlers.

### AUD-20 — Accessibility: Color-Only Status Indicators
- **Severity:** MEDIUM
- **Files:** `src/components/agent-state-indicator.tsx`, `src/components/agent-scorecards.tsx`, `src/components/error-dashboard.tsx`, `src/components/activity-feed.tsx`
- **Description:** Status indicators rely solely on color (red/yellow/green dots) without text labels or icons for colorblind users.
- **Suggested fix:** Add text labels, icons, or patterns alongside color indicators.

### AUD-21 — Accessibility: Command Palette Missing Focus Trap
- **Severity:** MEDIUM
- **File:** `src/components/command-palette.tsx`
- **Description:** Modal dialog lacks `role="dialog"`, `aria-modal="true"`, and focus trapping. Tab key moves focus outside the modal.
- **Suggested fix:** Add proper dialog ARIA attributes and implement focus trapping.

### AUD-22 — Hardcoded Colors in Components
- **Severity:** MEDIUM
- **Files:** `src/components/command-palette.tsx`, `src/components/error-dashboard.tsx`, `src/components/achievement-badges.tsx`, `src/lib/agent-meta.ts`, `src/lib/agent-state-machine.ts`
- **Description:** Many components use hardcoded hex colors (`#0a0a0f`, `#ef4444`, `#1e293b`, etc.) instead of CSS custom properties/design tokens. This breaks theme consistency and dark/light mode.
- **Suggested fix:** Replace hardcoded colors with `var(--grid-*)` CSS custom properties.

### AUD-23 — Inline Styles Mixed with Tailwind
- **Severity:** MEDIUM
- **Files:** Most component files
- **Description:** Inconsistent styling approach — many components mix Tailwind utility classes with inline `style={}` objects. This makes maintenance harder and creates specificity issues.
- **Suggested fix:** Standardize on one approach. Prefer CSS custom properties + Tailwind for consistency.

### AUD-24 — No Rate Limiting
- **Severity:** MEDIUM
- **Files:** All API routes, especially `src/app/api/terminal/route.ts`
- **Description:** No rate limiting on any endpoint. The terminal and message endpoints are particularly dangerous without throttling.
- **Suggested fix:** Add rate limiting middleware (e.g., sliding window per IP).

### AUD-25 — Agent Agents Page Uses Hardcoded Sample Data
- **Severity:** MEDIUM
- **File:** `src/app/agents/page.tsx`
- **Description:** Uses `SAMPLE_AGENTS` array as fallback/demo data that may confuse users into thinking it's real.
- **Suggested fix:** Show empty state with clear messaging when no real agent data is available.

### AUD-26 — Logs Search Cache is Global Singleton
- **Severity:** MEDIUM
- **File:** `src/app/api/logs/search/route.ts`
- **Description:** Single cache entry shared across all users. One user's search results are served to the next user with the same query, even if underlying data changed within 10s TTL.
- **Suggested fix:** Use per-request caching or a proper cache with invalidation.

### AUD-27 — Missing Loading States in Client Components
- **Severity:** MEDIUM
- **Files:** `src/app/workflows/client.tsx`, `src/app/reports/client.tsx`, `src/app/settings/budgets/client.tsx`, `src/app/settings/changelog/page.tsx`
- **Description:** Multiple client components perform fetch operations without showing loading indicators or handle errors silently.
- **Suggested fix:** Add loading spinners/skeletons and user-visible error messages.

### AUD-28 — Using `<a href>` Instead of Next.js `<Link>`
- **Severity:** MEDIUM
- **Files:** `src/app/layout.tsx` (secondary nav), `src/app/project/[id]/client.tsx`
- **Description:** Uses native `<a>` tags for internal navigation, causing full page reloads instead of client-side transitions.
- **Suggested fix:** Replace `<a href>` with `<Link>` from `next/link`.

### AUD-29 — No Confirmation for Destructive Actions
- **Severity:** MEDIUM
- **Files:** `src/app/settings/budgets/client.tsx`, `src/app/settings/cron/client.tsx`
- **Description:** Delete buttons execute immediately without confirmation dialog.
- **Suggested fix:** Add confirmation modal before destructive operations.

### AUD-30 — Agent Config Allows Writing to Filesystem
- **Severity:** MEDIUM
- **File:** `src/app/api/agents/[id]/config/route.ts`
- **Description:** POST endpoint writes arbitrary content to agent workspace files. While limited to `ALLOWED_FILES` list, the agent `id` parameter could potentially contain path traversal despite `path.join()`.
- **Suggested fix:** Validate agent ID with strict regex, verify resolved path is within expected directory.

### AUD-31 — Keyboard Search Trigger Uses Synthetic Event
- **Severity:** MEDIUM
- **File:** `src/components/nav-bar.tsx`
- **Description:** Search button dispatches a synthetic `KeyboardEvent('keydown', { key: 'k', metaKey: true })` which is hacky and may not work in all browsers.
- **Suggested fix:** Use a shared state/context to trigger the command palette open.

### AUD-32 — Unused Analytics Routes
- **Severity:** MEDIUM
- **Files:** `src/app/api/analytics/roi/route.ts`, `src/app/api/analytics/heatmap/route.ts`, `src/app/api/analytics/models/route.ts`
- **Description:** Several analytics endpoints generate mock/random data rather than querying real metrics.
- **Suggested fix:** Implement real data collection or remove mock endpoints.

### AUD-33 — No `error.tsx` Pages
- **Severity:** MEDIUM
- **Files:** All route segments
- **Description:** No `error.tsx` boundary files exist in any route segment. Runtime errors crash to Next.js default error page.
- **Suggested fix:** Add `error.tsx` at the root and for critical route segments.

---

## LOW

### AUD-34 — npm audit: 10 Moderate Vulnerabilities
- **Severity:** LOW
- **File:** `package.json`
- **Description:** 10 moderate vulnerabilities in eslint toolchain (`@typescript-eslint/*`, `eslint`). These are dev dependencies only — no runtime impact.
- **Suggested fix:** Run `npm audit fix --force` or update eslint packages.

### AUD-35 — Empty `onAction` Callbacks
- **Severity:** LOW
- **File:** `src/app/workflows/client.tsx`
- **Description:** Empty `onAction={() => {}}` callback props passed to components — no-ops that may confuse developers.
- **Suggested fix:** Remove or implement the callbacks.

### AUD-36 — Console.error Without User Feedback
- **Severity:** LOW
- **Files:** `src/app/reports/client.tsx`, multiple components
- **Description:** Errors are logged to console but user sees no feedback.
- **Suggested fix:** Show toast/notification on error.

### AUD-37 — Uses `alert()` for Notifications
- **Severity:** LOW
- **File:** `src/app/reports/client.tsx`
- **Description:** Uses native `alert()` instead of the app's notification system.
- **Suggested fix:** Use the existing `NotificationCenter` component.

### AUD-38 — Missing `not-found.tsx` Pages
- **Severity:** LOW
- **Files:** All route segments
- **Description:** No custom 404 pages for dynamic routes like `project/[id]` or `agents/[name]`.
- **Suggested fix:** Add `not-found.tsx` files for dynamic route segments.

### AUD-39 — No Lazy Loading for Heavy Components
- **Severity:** LOW
- **Files:** `src/components/isometric-office.tsx`, `src/components/pixel-hq.tsx`, `src/components/org-chart.tsx`, `src/components/session-heatmap.tsx`
- **Description:** Heavy visualization components are imported statically instead of using `next/dynamic` with lazy loading.
- **Suggested fix:** Use `dynamic(() => import('./component'), { ssr: false })` for large client-only components.

### AUD-40 — Inconsistent Error Handling Patterns
- **Severity:** LOW
- **Files:** Throughout codebase
- **Description:** Mix of try/catch, empty catch blocks, `.catch()`, and no error handling. No consistent pattern.
- **Suggested fix:** Establish and document a standard error handling pattern.

### AUD-41 — Auto-Refresh Not Pausable
- **Severity:** LOW
- **File:** `src/app/metrics/page.tsx`
- **Description:** Auto-refresh polling can't be paused by users, which is problematic for accessibility (screen readers) and for debugging.
- **Suggested fix:** Add a pause/resume button for auto-refresh.

### AUD-42 — Database Path Fallback to `~`
- **Severity:** LOW
- **File:** `src/lib/db.ts`
- **Description:** Falls back to literal `~` if `HOME` is unset: `process.env.HOME ?? '~'`. The tilde `~` is not expanded by Node.js `path.join()`, resulting in a relative path `~/workspace/...`.
- **Suggested fix:** Use `os.homedir()` instead of `process.env.HOME`.

### AUD-43 — Mobile Menu z-index Stacking Issues
- **Severity:** LOW
- **File:** `src/components/nav-bar.tsx`
- **Description:** Mobile menu uses `position: sticky; top: 42; zIndex: 99` with hardcoded top offset that may not match actual nav height.
- **Suggested fix:** Calculate top offset dynamically or use a CSS variable.

---

## Recommendations Priority

### Immediate (This Week)
1. **AUD-01** — Remove or heavily sandbox terminal endpoint
2. **AUD-02, AUD-03** — Fix command injection vulnerabilities
3. **AUD-04** — Add authentication to API routes
4. **AUD-06** — Fix broken navigation links (quick win)

### Short-Term (This Sprint)
5. **AUD-05, AUD-33** — Add error boundaries
6. **AUD-07** — Sanitize filesystem path construction
7. **AUD-09** — Add input validation (zod)
8. **AUD-14** — Add loading.tsx files
9. **AUD-17** — Fix database singleton pattern

### Medium-Term (Next Sprint)
10. **AUD-10, AUD-11** — Fix SSE resource management
11. **AUD-15** — Implement real APIs or return 501
12. **AUD-19–AUD-21** — Fix accessibility issues
13. **AUD-22** — Migrate hardcoded colors to design tokens
