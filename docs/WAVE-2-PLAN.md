# Wave 2: Design System Page Migrations - Execution Plan

**Project ID:** `c34f2b0a-2be9-48b0-ac7b-ecf24e426cb9`  
**Created:** 2026-02-18  
**Status:** Ready for execution  

## Overview

Wave 2 migrates 7 critical pages and the NavBar from inline styles and CSS vars to Grid Design System components. All pages currently use `var(--grid-*)` tokens mixed with inline styles, Tailwind classes, and hardcoded colors.

**UI Components Available (from Wave 1):**
- Button, Card, Badge, StatusDot, Input, Dialog, Toast, DropdownMenu, Tooltip, Skeleton, Table, Separator
- All use Grid design tokens (`--grid-*` CSS vars via Tailwind `@theme`)
- 121 component tests pass, Storybook configured

---

## P0 - High Priority Pages (Week 1-2)

### Task 1: Dashboard HomePage - StatCard Migration 
**Agent:** GRID ⚡  
**Priority:** P0  
**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/widgets/quick-stats-widget.tsx`
- Create: `src/components/ui/stat-card.tsx` (if not exists)

**Current State Analysis:**
- QuickStatsWidget renders individual stats with inline styles: `style={{ background: 'var(--grid-bg)' }}`
- Each stat has manual styling: `text-2xl font-bold tabular-nums` with `color: s.color`
- Mission Control header uses inline CSS vars: `color: 'var(--grid-text)'`

**Migration Plan:**
- Replace inline stat cards with `<StatCard variant="compact" />` component
- Convert hardcoded colors (`var(--grid-info, #3b82f6)`) to Grid tokens (`text-grid-info`)
- Replace manual tabular-nums with StatCard's built-in number styling
- Use StatCard's icon prop instead of manual emoji rendering

**Classes to Replace:**
```tsx
// BEFORE:
<div className="text-2xl font-bold tabular-nums" style={{ color: s.color }}>
// AFTER: 
<StatCard value={s.value} label={s.label} icon={s.icon} variant="compact" />
```

**Dependencies:** StatCard component (Wave 1)

---

### Task 2: Dashboard DashboardGrid - Card System Migration
**Agent:** GRID ⚡  
**Priority:** P0  
**Files:**
- Modify: `src/components/dashboard-grid.tsx`

**Current State Analysis:**
- Manual grid layout with inline styles for cards
- Individual widgets wrapped in manual div containers
- Preset selector uses manual button styling with `var(--grid-accent)`

**Migration Plan:**
- Replace manual card containers with `<Card variant="widget" />` 
- Replace preset selector buttons with `<Button variant="ghost" size="sm" />`
- Use Card header for widget titles instead of manual borders

**Classes to Replace:**
```tsx
// BEFORE:
style={{
  border: '1px solid var(--grid-border)',
  background: 'var(--grid-surface)',
  borderRadius: '0.5rem',
}}
// AFTER:
<Card variant="widget">
```

**Dependencies:** Card component (Wave 1)

---

### Task 3: Agents Page - Card + StatusDot Migration
**Agent:** GRID ⚡  
**Priority:** P0  
**Files:**
- Modify: `src/app/agents/page.tsx`

**Current State Analysis:**
- Manual agent cards with inline border/background styles
- Custom status dots using `style={{ background: status === 'active' ? 'var(--grid-success, #48bb78)' : 'var(--grid-text-dim)' }}`
- Loading spinner with manual animation and CSS vars
- Error state with manual red styling
- Action buttons with manual hover states

**Migration Plan:**
- Replace manual agent cards with `<Card variant="agent" />`
- Replace custom status dots with `<StatusDot status={status} label={statusText} />`
- Replace loading spinner with `<Skeleton variant="card" />`
- Replace error div with `<Card variant="error">` 
- Replace "Configure" buttons with `<Button variant="secondary" size="sm" />`

**Classes to Replace:**
```tsx
// BEFORE:
<div className="p-6 rounded-lg border" style={{ background: 'var(--grid-surface)', borderColor: 'var(--grid-border)' }}>
// AFTER: 
<Card className="p-6">

// BEFORE:
<span className="inline-block w-2 h-2 rounded-full" style={{ background: status === 'active' ? 'var(--grid-success, #48bb78)' : 'var(--grid-text-dim)' }} />
// AFTER:
<StatusDot status={status} />
```

**Dependencies:** Card, StatusDot, Button, Skeleton components (Wave 1)

---

### Task 4: NavBar - DropdownMenu Migration
**Agent:** PIXEL 🎨  
**Priority:** P0  
**Files:**
- Modify: `src/components/nav-bar.tsx`

**Current State Analysis:**
- Custom dropdown implementation with manual focus management
- Manual button styling with CSS vars and hover states
- Complex z-index and backdrop-filter for dropdown positioning
- Mobile menu with manual toggle state

**Migration Plan:**
- Replace custom Dropdown component with Radix `<DropdownMenu />` from Wave 1
- Replace manual button styling with `<Button variant="ghost" />`
- Convert SearchTrigger to use Grid Button component
- Keep mobile menu logic but use Grid components for styling

**Classes to Replace:**
```tsx
// BEFORE:
<button className="flex items-center gap-1 text-xs tracking-wide px-2 py-1 rounded transition-colors" style={{ color: isActive ? 'var(--grid-accent)' : 'var(--grid-text-dim)' }}>
// AFTER:
<Button variant="ghost" size="sm" className={cn(isActive && "text-grid-accent")}>

// BEFORE: Custom dropdown with manual positioning
// AFTER: <DropdownMenu> with DropdownMenuContent, DropdownMenuItem
```

**Dependencies:** DropdownMenu, Button components (Wave 1)

---

## P0 Review Gate

**BUG 🐛 Review Requirements:**
- [ ] All P0 pages load without errors
- [ ] Design token compliance: no `var(--grid-*)` in JSX 
- [ ] All replaced components use `cn()` utility
- [ ] Mobile responsiveness maintained
- [ ] Hover states work correctly
- [ ] No hardcoded colors (use Grid token classes)

**Testing Requirements:**
- [ ] **SAGE** 🧙: E2E tests pass for Dashboard, Agents, NavBar navigation
- [ ] Visual regression tests show no unintended changes
- [ ] Storybook stories updated for all new component usage

---

## P1 - Standard Priority Pages (Week 2-3)

### Task 5: Health Page - StatusDot + StatCard Integration
**Agent:** GRID ⚡  
**Priority:** P1  
**Files:**
- Modify: `src/app/health/page.tsx`
- Modify: `src/components/health-status.tsx`

**Current State Analysis:**
- Manual status circles with hardcoded colors: `bg-green-500`, `text-green-400`
- Individual check cards with manual Tailwind classes: `bg-zinc-900/50 rounded-lg border border-zinc-800`
- Custom loading spinner with manual border styling
- Manual latency display with `font-mono`

**Migration Plan:**
- Replace manual status circles with `<StatusDot status={health.overall} size="xl" />`
- Replace individual check cards with `<Card variant="health-check" />`
- Convert STATUS_COLORS object to use Grid design tokens
- Replace loading spinner with `<Skeleton variant="health-dashboard" />`
- Use Grid's tabular number classes for latency display

**Classes to Replace:**
```tsx
// BEFORE:
<div className="w-24 h-24 rounded-full bg-green-500 shadow-lg shadow-green-500/50 flex items-center justify-center">
// AFTER:
<StatusDot status="success" size="xl" showGlow />

// BEFORE:
<div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
// AFTER:
<Card variant="health-check" className="p-4">
```

**Dependencies:** StatusDot, Card, Skeleton components (Wave 1)

---

### Task 6: Logs Page - Table Component Integration  
**Agent:** DEV 💻  
**Priority:** P1  
**Files:**
- Modify: `src/app/logs/page.tsx`
- Modify: `src/components/log-search.tsx`

**Current State Analysis:**
- Page uses hardcoded Tailwind colors: `text-zinc-100`, `text-zinc-500`
- LogSearch component likely contains table implementation for search results
- Simple page structure with manual header styling

**Migration Plan:**
- Replace hardcoded text colors with Grid tokens: `text-grid-text`, `text-grid-text-dim`
- Integrate LogSearch component with Grid `<Table />` component from Wave 1
- Use Grid `<Input />` for search functionality within LogSearch
- Add consistent page header using Grid typography scale

**Classes to Replace:**
```tsx
// BEFORE:
<h1 className="text-2xl font-bold text-zinc-100">
// AFTER:
<h1 className="text-[length:var(--font-size-xl)] font-bold text-grid-text">

// BEFORE:
<p className="text-sm text-zinc-500 mt-1">
// AFTER:
<p className="text-[length:var(--font-size-sm)] text-grid-text-dim mt-1">
```

**Dependencies:** Table, Input components (Wave 1), LogSearch component analysis

---

### Task 7: Errors Page - Table + Badge Integration
**Agent:** DEV 💻  
**Priority:** P1  
**Files:**
- Modify: `src/app/errors/page.tsx`  
- Modify: `src/components/error-dashboard.tsx`

**Current State Analysis:**
- Page uses manual breadcrumb styling with inline CSS vars
- Sticky header with manual z-index and backdrop styling
- ErrorDashboard component likely contains table/list of errors

**Migration Plan:**
- Replace manual breadcrumb with Grid navigation pattern
- Replace sticky header styling with Grid-consistent approach
- Integrate ErrorDashboard with Grid `<Table />` and `<Badge />` components
- Use Badge variants for error severity levels
- Apply Grid design tokens to all inline style usage

**Classes to Replace:**
```tsx
// BEFORE:
<div style={{ borderBottom: '1px solid var(--grid-border)', backgroundColor: 'var(--grid-surface)' }}>
// AFTER:
<div className="border-b border-grid-border bg-grid-surface">

// BEFORE: Inline styles for breadcrumb
// AFTER: <Breadcrumb> component or Grid-styled navigation
```

**Dependencies:** Table, Badge components (Wave 1), ErrorDashboard component analysis

---

### Task 8: Settings Page - Input + Button + Dialog Integration
**Agent:** DEV 💻  
**Priority:** P1  
**Files:**
- Modify: `src/app/settings/page.tsx`

**Current State Analysis:**
- Minimal page with basic structure
- Uses inline CSS vars: `style={{ color: 'var(--grid-text)' }}`  
- Single card with manual border/background styling
- Placeholder content indicating future form controls

**Migration Plan:**
- Replace inline text color with Grid token classes
- Replace manual card styling with Grid `<Card />` component
- Prepare structure for future form controls using Grid `<Input />`, `<Button />`, and `<Dialog />` components
- Add consistent page header pattern

**Classes to Replace:**
```tsx
// BEFORE:
<h1 className="text-2xl font-bold" style={{ color: 'var(--grid-text)' }}>
// AFTER:
<h1 className="text-[length:var(--font-size-xl)] font-bold text-grid-text">

// BEFORE:
<div className="rounded-lg p-6 border" style={{ background: 'var(--grid-surface)', borderColor: 'var(--grid-border)' }}>
// AFTER:
<Card className="p-6">
```

**Dependencies:** Card, Input, Button, Dialog components (Wave 1)

---

## P1 Review Gate 

**BUG 🐛 Review Requirements:**
- [ ] All P1 pages maintain functionality while using Grid components
- [ ] No remaining `var(--grid-*)` inline styles in JSX
- [ ] All font sizes use `text-[length:var(--font-size-*)]` format
- [ ] All interactive elements use proper Grid hover/focus states
- [ ] Table components properly integrate with existing data

**Testing Requirements:**  
- [ ] **SAGE** 🧙: E2E tests cover all migrated page functionality
- [ ] Manual accessibility review of all forms and interactive elements
- [ ] Performance impact assessment (bundle size, render time)

---

## Parallel Workstreams

### Task 9: String Extraction - Phase 1 (P0 Pages)
**Agent:** SCRIBE 📝  
**Priority:** P0  
**Files:**
- Create: `src/i18n/messages/en.json` (if not exists)
- Modify: All P0 page files

**Work:**
- Extract hardcoded strings from Dashboard, Agents, NavBar during their migrations
- Create message keys following `page.section.key` pattern
- Examples: `agents.status.active`, `dashboard.stats.projects`, `nav.main.dashboard`

**Dependencies:** P0 page migrations (Tasks 1-4)

---

### Task 10: String Extraction - Phase 2 (P1 Pages) 
**Agent:** SCRIBE 📝  
**Priority:** P1  
**Files:**
- Update: `src/i18n/messages/en.json`
- Modify: All P1 page files

**Work:**
- Extract hardcoded strings from Health, Logs, Errors, Settings
- Add error messages, status labels, form placeholders
- Examples: `health.status.green`, `logs.search.placeholder`, `errors.severity.high`

**Dependencies:** P1 page migrations (Tasks 5-8)

---

### Task 11: E2E Test Coverage - P0 Pages
**Agent:** SAGE 🧙  
**Priority:** P0  
**Files:**
- Create: `e2e/dashboard.spec.ts`
- Create: `e2e/agents.spec.ts` 
- Create: `e2e/navigation.spec.ts`

**Test Coverage:**
- Dashboard: Widget loading, layout switching, stat card interactions
- Agents: List loading, status indicators, configure button navigation
- Navigation: Dropdown menus, mobile menu, search trigger

**Dependencies:** P0 page migrations (Tasks 1-4)

---

### Task 12: E2E Test Coverage - P1 Pages  
**Agent:** SAGE 🧙  
**Priority:** P1  
**Files:**
- Create: `e2e/health.spec.ts`
- Create: `e2e/logs.spec.ts`
- Create: `e2e/errors.spec.ts`

**Test Coverage:**
- Health: Status monitoring, manual refresh, check details
- Logs: Search functionality, table interactions
- Errors: Error filtering, badge interactions, table sorting

**Dependencies:** P1 page migrations (Tasks 5-8)

---

## Implementation Guidelines

### Design Token Compliance Rules

**✅ DO:**
```tsx
// Grid token classes
<div className="bg-grid-surface text-grid-text border-grid-border">
<span className="text-[length:var(--font-size-sm)] text-grid-text-dim">
<Button variant="primary" size="md">
```

**❌ DON'T:**  
```tsx
// Inline CSS vars
<div style={{ color: 'var(--grid-text)' }}>
// Raw Tailwind colors  
<div className="bg-zinc-900 text-zinc-100">
// Hardcoded values
<span style={{ fontSize: '12px', color: '#888' }}>
```

### Component Usage Patterns

**StatCard Usage:**
```tsx
<StatCard 
  value={42}
  label="Active Agents" 
  icon="🤖"
  trend={{ value: 12, direction: "up" }}
  variant="compact" 
/>
```

**StatusDot Usage:**
```tsx  
<StatusDot 
  status="active" // "active" | "idle" | "error" | "warning"
  label="System Online"
  showGlow={true}
  size="sm" // "sm" | "md" | "lg" | "xl"
/>
```

**Card Usage:**
```tsx
<Card variant="agent" className="p-6">
  <Card.Header>
    <Card.Title>Agent Name</Card.Title>
  </Card.Header>
  <Card.Content>
    <!-- Agent details -->
  </Card.Content>
</Card>
```

### File Organization

**Modified Files Structure:**
```
src/
├── app/
│   ├── page.tsx                    # Task 1-2 (GRID)
│   ├── agents/page.tsx            # Task 3 (GRID)  
│   ├── health/page.tsx            # Task 5 (GRID)
│   ├── logs/page.tsx              # Task 6 (DEV)
│   ├── errors/page.tsx            # Task 7 (DEV)
│   └── settings/page.tsx          # Task 8 (DEV)
├── components/
│   ├── nav-bar.tsx                # Task 4 (PIXEL)
│   ├── dashboard-grid.tsx         # Task 2 (GRID)
│   ├── health-status.tsx          # Task 5 (GRID)
│   ├── log-search.tsx             # Task 6 (DEV)
│   ├── error-dashboard.tsx        # Task 7 (DEV)
│   └── widgets/
│       └── quick-stats-widget.tsx # Task 1 (GRID)
└── i18n/messages/
    └── en.json                    # Tasks 9-10 (SCRIBE)
```

---

## Success Metrics

**Pre-Migration Baseline:**
- 7 pages using mixed inline styles + CSS vars
- ~47 hardcoded style objects across all pages
- 0 pages using Grid UI components
- Manual component implementations (dropdowns, cards, status indicators)

**Post-Migration Targets:**
- ✅ 0 inline `style={{}}` objects using `var(--grid-*)` 
- ✅ 100% Grid component usage for interactive elements
- ✅ All font sizes using `text-[length:var(--font-size-*)]` format  
- ✅ All colors using Grid token classes (`text-grid-*`, `bg-grid-*`, etc.)
- ✅ Radix DropdownMenu integration for NavBar
- ✅ E2E test coverage for all migrated pages
- ✅ String extraction preparation for i18n

**Component Usage Targets:**
- StatCard: 3+ instances (Dashboard stats)
- StatusDot: 15+ instances (Agent status, Health checks)  
- Card: 20+ instances (Agent cards, Health checks, Settings)
- Button: 10+ instances (Configure, Refresh, Actions)
- DropdownMenu: 4+ instances (NavBar dropdowns)

---

## Agent Coordination & Dependencies

### GRID ⚡ (Tasks 1, 2, 3, 5) - Critical Path
- **Week 1:** Dashboard + Agents pages (P0)
- **Week 2:** Health page + Widget refinements (P1)
- **Dependencies:** Wave 1 components (StatCard, Card, StatusDot)
- **Handoffs:** Provides migrated components to DEV for P1 integration

### DEV 💻 (Tasks 6, 7, 8) - Dependent Path  
- **Week 2-3:** Logs, Errors, Settings pages (P1)
- **Dependencies:** GRID's component patterns from P0 migration
- **Focus:** Table integration, form controls preparation

### PIXEL 🎨 (Task 4) - Independent Path
- **Week 1:** NavBar DropdownMenu migration (P0)  
- **Dependencies:** Wave 1 DropdownMenu component
- **Focus:** Complex interaction patterns, mobile behavior

### SCRIBE 📝 (Tasks 9, 10) - Parallel Path
- **Week 1-2:** String extraction during page migrations
- **Dependencies:** Access to all page modification PRs
- **Focus:** i18n message key structure, English defaults

### SAGE 🧙 (Tasks 11, 12) - Validation Path  
- **Week 1-2:** E2E test coverage for all migrated pages
- **Dependencies:** Completed page migrations
- **Focus:** Critical user journeys, accessibility validation

### BUG 🐛 - Quality Gates
- **P0 Review:** After Tasks 1-4 complete
- **P1 Review:** After Tasks 5-8 complete
- **Final Review:** All tasks complete, ready for Wave 3

---

**Next Phase:** Wave 3 will tackle complex pages (Kanban, Analytics, Office) and advanced component patterns.

**Estimated Timeline:** 2-3 weeks for full Wave 2 completion with all agents working in parallel.