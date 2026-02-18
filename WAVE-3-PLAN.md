# Design System Wave 3: Complex Pages + Polish

## Overview
Migrate complex pages to the design system and add polish (i18n, a11y, visual regression).

---

### Task 1: Kanban Page Migration
**Owner:** GRID
**Priority:** P0

Migrate Kanban page to design system components:
- Drag-and-drop with @dnd-kit or existing solution
- Column management (add, reorder, collapse)
- Task cards using Card, Badge, Button from ui/
- Status transitions with visual feedback
- Keyboard navigation for a11y (arrow keys, Enter to open)
- Filter/search functionality

**Files:**
- `app/src/app/kanban/page.tsx`
- `app/src/components/kanban/` (board, column, card components)
- `app/src/app/kanban/page.test.tsx`
- `app/e2e/kanban.spec.ts`

---

### Task 2: Analytics Pages Migration
**Owner:** GRID
**Priority:** P0

Migrate all Analytics sub-pages to design system:
- `/analytics/performance` - Performance metrics, charts
- `/analytics/sessions` - Session list, filters
- `/analytics/tokens` - Token usage, cost breakdown
- `/analytics/timeline` - Activity timeline
- `/analytics/metrics` - Custom metrics dashboard

Use StatCard for KPIs, Table for data, consistent PageHeader layout.

**Files:**
- `app/src/app/analytics/*/page.tsx` (5 pages)
- `app/src/components/analytics/` (shared components)
- `app/src/app/analytics/*/page.test.tsx`
- `app/e2e/analytics.spec.ts`

---

### Task 3: Office/Isometric View Polish
**Owner:** PIXEL
**Priority:** P1

Polish the isometric office view:
- Apply design tokens for all colors (no hardcoded hex)
- Add `prefers-reduced-motion` support (disable animations)
- Improve agent hover states with Tooltip from ui/
- Ensure status indicators use StatusDot component
- Mobile responsiveness (zoom/pan controls)

**Files:**
- `app/src/components/isometric-office/*.tsx`
- `app/src/components/isometric-office/*.test.tsx`

---

### Task 4: Calendar Page Migration
**Owner:** GRID
**Priority:** P1

Migrate Calendar page to design system:
- Month/week/day views
- Event display with Card component
- Navigation controls (prev/next, today) with Button
- Event badges for different types
- Keyboard navigation (arrow keys between dates)
- ARIA labels for screen readers

**Files:**
- `app/src/app/calendar/page.tsx`
- `app/src/components/calendar/` (views, event card)
- `app/src/app/calendar/page.test.tsx`
- `app/e2e/calendar.spec.ts`

---

### Task 5: Workflows Page Migration
**Owner:** GRID
**Priority:** P1

Migrate Workflows visual flow editor:
- Node-based flow visualization
- Connection lines between nodes
- Drag to reposition nodes
- Node cards using Card component
- Zoom/pan controls
- Keyboard shortcuts (delete, duplicate, connect)
- a11y: describedby for node relationships

**Files:**
- `app/src/app/workflows/page.tsx`
- `app/src/components/workflows/` (canvas, node, connection)
- `app/src/app/workflows/page.test.tsx`
- `app/e2e/workflows.spec.ts`

---

### Task 6: Soul/Skills/Spawn Pages Migration
**Owner:** DEV
**Priority:** P1

Migrate form-heavy pages:
- `/soul` - Soul editor (markdown textarea, preview)
- `/skills` - Skills manager (list, add, remove, configure)
- `/spawn` - Spawn form (agent selection, params, submit)

Use Input, Button, Dialog, Select, Textarea from ui/.
Form validation with error states (aria-describedby).
Loading states with Skeleton.

**Files:**
- `app/src/app/soul/page.tsx`
- `app/src/app/skills/page.tsx`
- `app/src/app/spawn/page.tsx`
- `app/src/app/*/page.test.tsx` (3 files)
- `app/e2e/forms.spec.ts`

---

### Task 7: Reports/Metrics Pages Migration
**Owner:** DEV
**Priority:** P1

Migrate Reports and Metrics pages:
- Chart visualizations (cost over time, usage trends)
- Data tables with sorting/filtering
- Export functionality (CSV, JSON)
- Date range picker
- StatCard for summary metrics

**Files:**
- `app/src/app/reports/page.tsx`
- `app/src/app/metrics/page.tsx`
- `app/src/components/reports/` (charts, tables)
- `app/src/app/*/page.test.tsx`
- `app/e2e/reports.spec.ts`

---

### Task 8: Subagents Page Migration
**Owner:** DEV
**Priority:** P1

Migrate Subagents page with tree visualization:
- Hierarchical tree of agent → subagent relationships
- Collapsible nodes (expand/collapse)
- Status indicators with StatusDot
- Agent cards with Card, Badge
- Actions: view logs, kill, steer
- Keyboard navigation (arrow keys, Enter)

**Files:**
- `app/src/app/subagents/page.tsx`
- `app/src/components/subagents/tree.tsx`
- `app/src/app/subagents/page.test.tsx`
- `app/e2e/subagents.spec.ts`

---

### Task 9: Portuguese (pt-BR) Translation
**Owner:** SCRIBE
**Priority:** P1

Add Portuguese translation for all UI strings:
- Duplicate `en.json` → `pt-BR.json`
- Translate all keys (maintain structure)
- Handle pluralization rules for PT
- Test locale switching

**Files:**
- `app/src/i18n/messages/pt-BR.json`
- `app/src/i18n/config.ts` (add pt-BR locale)
- `app/e2e/i18n.spec.ts`

---

### Task 10: Full E2E Test Suite
**Owner:** SAGE
**Priority:** P1

Complete Playwright e2e coverage:
- All migrated pages have e2e tests
- Critical user journeys covered
- Visual regression baseline screenshots
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile viewport tests

**Files:**
- `app/e2e/*.spec.ts` (all pages)
- `app/e2e/visual-regression.spec.ts`
- `app/playwright.config.ts` (multi-browser)

---

### Task 11: Accessibility Audit + Fixes
**Owner:** PIXEL
**Priority:** P0

Run axe-core audit and fix violations:
- Install @axe-core/playwright
- Add axe checks to all e2e tests
- Fix all critical/serious violations
- Verify heading hierarchy (h1→h2→h3)
- Verify color contrast (WCAG AA)
- Add skip navigation link
- Test with VoiceOver/NVDA

**Files:**
- `app/e2e/*.spec.ts` (add axe checks)
- Various component fixes
- `app/src/app/layout.tsx` (skip link)

---

## Acceptance Criteria
- [ ] All 8 complex pages migrated to design system
- [ ] All pages have unit tests (Vitest)
- [ ] All pages have e2e tests (Playwright)
- [ ] Portuguese translation complete
- [ ] axe-core audit passes (0 critical violations)
- [ ] Visual regression baseline established
