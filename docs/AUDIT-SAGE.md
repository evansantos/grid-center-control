# GRID Dashboard — UX & Product Quality Audit

**Auditor:** Sage  
**Date:** 2026-02-17  
**App:** `~/workspace/mcp-projects/grid/app/`  
**Method:** Full source code review of all pages, components, API routes, and navigation structure

---

## Executive Summary

The Grid Dashboard has **34 pages** and **58 components** built across multiple development waves. The result is a feature-rich but inconsistent product with several critical issues:

- **5 nav links are broken** (point to `/tools/*` routes that don't exist)
- **20+ pages are unreachable** from the navigation
- **Most settings pages are pure UI theater** — they don't persist anything
- **Multiple analytics pages show hardcoded mock data** presented as real
- **4 office visualization components exist** but only 1 is used (3,269 lines of dead code)
- **Accessibility is nearly absent** — almost zero ARIA attributes across 58 components
- **No global error boundary** exists

The app needs consolidation, not more features.

---

## Issues

### CRITICAL

| ID | Page/Component | Description | Recommendation |
|---|---|---|---|
| UX-A01 | `nav-bar.tsx` | **5 broken navigation links.** Tools dropdown links to `/tools/spawn`, `/tools/logs`, `/tools/tokens`, `/tools/errors`, `/tools/health` — but these routes don't exist. Actual pages are at `/spawn`, `/logs`, `/tokens`, `/errors`, `/health`. Users clicking these get 404s. | Fix nav hrefs to match actual routes: `/spawn`, `/logs`, `/tokens`, `/errors`, `/health` |
| UX-A02 | Navigation | **20+ orphaned pages.** The following pages exist but have NO link in the nav bar: `/analytics/costs`, `/analytics/heatmap`, `/analytics/models`, `/analytics/roi`, `/metrics`, `/reports`, `/reports/snapshots`, `/settings` (index), `/settings/alerts`, `/settings/audit`, `/settings/budgets`, `/settings/changelog`, `/settings/cron`, `/settings/secrets`, `/settings/workflows`, `/workflows`, `/subagents`, `/agents/bulk`, `/agents/graph`, all `/project/*` pages. Users cannot discover these features. | Add these to nav dropdowns or remove the pages. Suggested groupings: expand Analytics dropdown, add Reports section, expand Settings dropdown. |
| UX-A03 | All settings APIs | **Settings don't persist.** All 5 settings API routes (`/api/settings/audit`, `/budgets`, `/changelog`, `/secrets`, `/workflows`) use in-memory arrays or hardcoded mock data. Zero `writeFile`, `db`, or any persistence calls. Every setting is lost on server restart. Users think they're configuring the system but nothing saves. | Either implement file-based persistence (write to `~/.openclaw/` config files) or clearly label these as "Preview — not yet functional" |
| UX-A04 | `layout.tsx` | **No global error boundary.** The root layout has no `error.tsx` or error boundary. Unhandled errors crash the entire app with a white screen. | Add `src/app/error.tsx` and `src/app/not-found.tsx` with branded error pages |

### HIGH

| ID | Page/Component | Description | Recommendation |
|---|---|---|---|
| UX-A05 | `/analytics/models` | **Entirely hardcoded mock data.** The API route (`/api/analytics/models/route.ts`) returns static `modelStats` objects with fabricated numbers (e.g., "445,000 requests for gpt-4o-mini in 30d"). No filesystem or database queries. Misleads users into thinking they have real analytics. | Query actual session files for model usage, or label clearly as "Demo Data" |
| UX-A06 | `/analytics/heatmap` | **Mock data with TODO comment.** API route has explicit comment: `// Generate mock data (TODO: Query events table for real data)`. Generates random numbers weighted toward "working hours." | Implement real data from session logs or remove the page |
| UX-A07 | `/analytics/roi` | **In-memory-only storage.** ROI entries are stored in a module-level `const entries: ROIEntry[] = []`. Data vanishes on server restart. No persistence whatsoever. | Persist to a JSON file in `~/.openclaw/grid/` |
| UX-A08 | `/settings/secrets` | **Mock API keys displayed.** Shows hardcoded fake API keys (`mockKeys` array) with fake statuses. Users might think these are their real keys. Dangerous UX — could lead to confusion about which keys are actually configured. | Either read real key metadata from OpenClaw config or remove the page |
| UX-A09 | `/settings/changelog` | **Hardcoded fake changelog.** Variable literally named `MOCK_DATA` with fabricated changelog entries. Presents fictional agent config changes as real history. | Parse actual git history or config file timestamps, or remove |
| UX-A10 | `/settings/audit` | **Fabricated audit trail.** Hardcoded `sampleEntries` with fake timestamps and changes. An audit log that lies is worse than no audit log. | Implement real audit logging or remove |
| UX-A11 | Dead components | **3,269 lines of dead office code.** `living-office.tsx` (1,454 lines), `pixel-hq.tsx` (447 lines), `office-map.tsx` (274 lines) are never imported by any page. Only `isometric-office.tsx` (1,094 lines) is used. | Delete `living-office.tsx`, `pixel-hq.tsx`, `office-map.tsx` and their sub-components (`conversation-panel.tsx`, `visitor-indicator.tsx`, `speech-bubble.tsx`, `office-zone.tsx`) if also unused |
| UX-A12 | Accessibility | **Near-zero ARIA coverage.** Across 58 components, only 7 have any `aria-` attributes or `role=` declarations. Zero ARIA labels on interactive elements in nav dropdowns, modals, forms. Nav dropdown buttons have no `aria-expanded`, `aria-haspopup`. No skip-to-content link. No focus management. | Add ARIA attributes to all interactive components. Priority: nav, modals, forms, dropdowns |

### MEDIUM

| ID | Page/Component | Description | Recommendation |
|---|---|---|---|
| UX-A13 | `nav-bar.tsx` | **Settings dropdown only shows Escalation.** There are 8 settings pages but the nav only links to `/settings/escalation`. The Settings hub page (`/settings`) exists but is orphaned. | Show all settings in dropdown, or link to `/settings` hub page |
| UX-A14 | `nav-bar.tsx` | **Analytics dropdown missing 4 pages.** Only shows Performance, Sessions, Timeline. Missing: Costs, Heatmap, Models, ROI. | Add missing analytics pages to dropdown |
| UX-A15 | `nav-bar.tsx` dropdown | **Hover-based color styling uses inline JS.** `onMouseEnter`/`onMouseLeave` handlers manually set `style.color` and `style.background`. This breaks on touch devices, fights with CSS, and creates accessibility issues (no `:focus-visible` styling). | Use CSS `:hover` and `:focus-visible` pseudo-classes via Tailwind |
| UX-A16 | `/settings/budgets` | **In-memory budget management.** Budgets are stored in module-level array. Users can "create" budgets that vanish on restart. No validation feedback when limits are hit. | Persist budgets and connect to actual cost tracking |
| UX-A17 | `/settings/workflows` | **In-memory workflow engine.** Workflow templates are hardcoded, active workflows stored in memory. The entire workflow system is a UI demo. | Either build real workflow orchestration or remove and simplify to a "Quick Actions" pattern |
| UX-A18 | Loading states | **Inconsistent loading patterns.** Only 16 of 58 components handle loading states. Many pages fetch data with no loading indicator — users see empty content that may or may not be "no data" vs "still loading." | Standardize on a `<LoadingSkeleton>` component used across all data-fetching pages |
| UX-A19 | Error handling | **No consistent error UI.** Most API calls have try/catch but display errors differently (some as inline text, some as console.log, some silently fail). No toast/snackbar pattern despite `toast-provider.tsx` existing. | Standardize error display using the existing toast provider |
| UX-A20 | Breadcrumbs | **Two breadcrumb components.** Both `breadcrumb-nav.tsx` and `breadcrumbs.tsx` exist. Unclear which is canonical. Neither is consistently used across pages. | Pick one, delete the other, use it on all sub-pages |
| UX-A21 | Feature bloat | **Achievement badges, sound effects, onboarding tour** — `achievement-badges.tsx`, `sound-effects-provider.tsx`, `sound-settings.tsx`, `onboarding-tour.tsx` add gamification complexity to what is an ops dashboard. These are nice-to-have features built before core functionality works. | Defer until core features (persistence, real data, navigation) are solid. Remove or feature-flag. |
| UX-A22 | Feature bloat | **Smart recommendations, mini-map, org-chart** — novelty components that add bundle size and maintenance burden without clear user value in an MVP. | Defer or remove. Focus on making existing pages work correctly first. |
| UX-A23 | `/office` page | **Hardcoded "14 agents across 5 departments."** The subtitle claims a specific agent count that may not match reality. | Derive count from actual agent data |

### LOW

| ID | Page/Component | Description | Recommendation |
|---|---|---|---|
| UX-A24 | `nav-bar.tsx` | **Search trigger dispatches synthetic KeyboardEvent.** The search button creates `new KeyboardEvent('keydown', { key: 'k', metaKey: true })` which may not be caught by all event listeners. Fragile coupling with command palette. | Use a shared state/context to open command palette |
| UX-A25 | Mobile nav | **Mobile menu hardcoded top offset.** `top: 42` assumes nav height of 42px. Will break if nav height changes. | Use CSS `calc()` or a ref-based measurement |
| UX-A26 | Theming | **Inline style variables everywhere.** Most components use `style={{ color: 'var(--grid-text)' }}` instead of Tailwind classes, creating inconsistency with components that do use Tailwind. | Migrate to Tailwind CSS variables or create utility classes |
| UX-A27 | `layout.tsx` | **Only JetBrains Mono font.** The entire app uses a monospace font. While thematic for a dev tool, it hurts readability for longer text (reports, changelogs, descriptions). | Add a proportional font for body text, keep mono for code/data |
| UX-A28 | `/analytics/costs` | **Real data but fragile parsing.** Reads from `~/.openclaw/agents/` filesystem. Good that it uses real data, but no graceful degradation if directory structure changes. | Add defensive parsing with fallback values |
| UX-A29 | Keyboard navigation | **`keyboard-nav-provider.tsx` exists but unclear coverage.** Provider wraps the app but most interactive elements don't use the keyboard nav hooks. | Audit and connect keyboard navigation to all interactive elements |
| UX-A30 | `theme-toggle.tsx` | **Has aria-label** (one of the few accessible components). Good pattern — replicate across all interactive elements. | Use as reference pattern for accessibility improvements |

---

## Data Source Summary

| Data Source | Pages Using It | Status |
|---|---|---|
| **Real filesystem data** (`~/.openclaw/sessions/`, `~/.openclaw/agents/`) | Costs, Performance, Sessions, Timeline, Agents list | ✅ Working |
| **In-memory arrays** (lost on restart) | ROI, Budgets, Workflows (active), Alerts | ⚠️ Volatile |
| **Hardcoded mock data** | Models, Heatmap, Audit, Changelog, Secrets | ❌ Fake |
| **OpenClaw CLI** (exec-based) | Agent control, Cron, Health, Spawn | ✅ Working (when CLI available) |

---

## Priority Recommendations

### P0 — Fix Now (Blocking)
1. **Fix 5 broken nav links** (UX-A01) — users literally can't navigate to Tools
2. **Add missing pages to navigation** (UX-A02) — 20+ features are invisible
3. **Add error boundary** (UX-A04) — app crashes show white screen

### P1 — Fix Soon (Misleading)
4. **Label or remove mock data pages** (UX-A05, A06, A08, A09, A10) — fake data presented as real erodes trust
5. **Implement persistence for settings** (UX-A03) — or label as non-functional
6. **Delete 3,269 lines of dead office code** (UX-A11)

### P2 — Improve (Quality)
7. **Consolidate navigation** — single dropdown structure covering all pages
8. **Standardize loading/error patterns** (UX-A18, A19)
9. **Add basic accessibility** (UX-A12) — ARIA labels, focus management
10. **Remove or defer bloat features** (UX-A21, A22) — badges, sounds, gamification

### P3 — Polish
11. Fix inline styles, font choices, breadcrumb duplication
12. Improve mobile experience details
13. Add keyboard navigation coverage

---

## Feature Inventory

| Feature | Pages | Status | Notes |
|---|---|---|---|
| Dashboard | 1 | ✅ Functional | Real agent data |
| Agent List + Config | 3 | ✅ Functional | Real data, working controls |
| Agent Graph | 1 | ⚠️ Partial | Links exist internally but orphaned from nav |
| Bulk Operations | 1 | ⚠️ Partial | Orphaned from nav |
| Office View | 1 | ✅ Functional | But 3 dead alternative implementations |
| Analytics - Performance | 1 | ✅ Functional | Real session data |
| Analytics - Sessions | 1 | ✅ Functional | Real session data |
| Analytics - Timeline | 1 | ✅ Functional | Real session data |
| Analytics - Costs | 1 | ✅ Functional | Real filesystem data |
| Analytics - Models | 1 | ❌ Mock | Entirely hardcoded |
| Analytics - Heatmap | 1 | ❌ Mock | Random generated data |
| Analytics - ROI | 1 | ⚠️ Volatile | Works but loses data on restart |
| Reports | 2 | ⚠️ Partial | Check if API returns real data |
| Spawn | 1 | ✅ Functional | Calls OpenClaw CLI |
| Subagents | 1 | ✅ Functional | Calls OpenClaw CLI |
| Logs | 1 | ✅ Functional | Real log search |
| Tokens | 1 | ✅ Functional | Real token data |
| Errors | 1 | ✅ Functional | Real error data |
| Health | 1 | ✅ Functional | Real health checks |
| Metrics | 1 | ⚠️ Unknown | Orphaned, needs verification |
| Workflows | 1 | ❌ Mock | In-memory, hardcoded templates |
| Settings - Escalation | 1 | ⚠️ Partial | In nav but check persistence |
| Settings - Alerts | 1 | ⚠️ Volatile | In-memory |
| Settings - Budgets | 1 | ⚠️ Volatile | In-memory |
| Settings - Cron | 1 | ✅ Functional | Calls OpenClaw CLI |
| Settings - Secrets | 1 | ❌ Mock | Fake key data |
| Settings - Audit | 1 | ❌ Mock | Fake audit trail |
| Settings - Changelog | 1 | ❌ Mock | `MOCK_DATA` variable |
| Settings - Workflows | 1 | ❌ Mock | Hardcoded templates |
| Projects | 4 | ⚠️ Partial | Check API backing |

**Summary:** 12 ✅ Functional | 8 ⚠️ Partial/Volatile | 7 ❌ Mock/Fake

---

*This audit was conducted via full source code review. Browser-based testing was unavailable. Some issues may have additional UI-level symptoms not captured here.*
