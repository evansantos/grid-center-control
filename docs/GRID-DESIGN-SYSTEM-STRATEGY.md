# GRID Dashboard — Design System Overhaul
## Strategic Vision Document

**Date:** 2026-02-18
**Author:** CEO Agent (Strategic Analysis)
**Status:** PROPOSAL — Awaiting Evan's approval

---

## Executive Summary

The Grid Dashboard has 245 source files, 52 top-level components, 7,000+ lines of component code, 20+ pages, and **zero component-level tests**. Styling is split between Tailwind classes (514 usages) and inline `style={{}}` objects (312 usages across 30/52 components). There's a solid CSS custom property foundation in `globals.css` but no shared component primitives — every page reinvents buttons, cards, inputs, and layouts. No i18n. Minimal a11y (7 files with `aria-*`, 2 with `role=`).

**The diagnosis:** Good design tokens, no design system. Every component is a bespoke snowflake.

**The prescription:** Build a thin, custom component layer on top of **Radix UI primitives** + **Tailwind CSS 4**, documented with **Storybook**, tested with **Vitest + Playwright**, internationalized with **next-intl**.

---

## 1. Design System Tooling — The Recommendation

### Decision: **Custom Components on Radix Primitives** (shadcn/ui-inspired, not shadcn/ui itself)

| Option | Verdict | Rationale |
|--------|---------|-----------|
| **shadcn/ui** | ❌ Not directly | Ships with its own design language (zinc/slate palette, Inter font, rounded-lg aesthetic). We'd fight it constantly to maintain JetBrains Mono + `#ff4444` + mission-control vibe. The *approach* is right, but we should own the components. |
| **Radix UI Primitives** | ✅ **YES** | Unstyled, accessible, composable. Gives us Dialog, DropdownMenu, Tooltip, Select, Tabs, Toggle — all with full a11y built-in. We style them our way. |
| **Storybook** | ✅ **YES** | Component documentation, visual testing, design token showcase. Essential for a 100+ component codebase. |
| **Build 100% custom** | ❌ No | We'd spend months reimplementing focus management, keyboard navigation, screen reader support that Radix gives us free. |

### Why This Approach

1. **shadcn/ui is a pattern, not a library.** We adopt the *pattern*: copy-paste-own components, built on Radix primitives, styled with Tailwind. But we write them ourselves with our design language baked in.

2. **Radix handles the hard parts.** Accessible dialogs (focus trapping, Escape handling), dropdown menus (keyboard navigation, typeahead), tooltips (positioning, delays) — these are solved problems. Our `ConfirmDialog` already reimplements focus management and Escape handling manually. Radix does this better.

3. **Tailwind CSS 4 is already in the stack.** No migration needed. We just need to formalize our design tokens into Tailwind's theme layer instead of only CSS custom properties.

4. **Storybook for documentation, not development.** We don't live in Storybook — we develop in the app. But Storybook serves as the living catalogue for the team.

### Proposed Component Library Structure

```
src/
├── components/
│   ├── ui/                    # ← NEW: Primitive design system components
│   │   ├── button.tsx         # Button variants (primary, secondary, ghost, danger)
│   │   ├── card.tsx           # Replaces .grid-card CSS class + inline styles
│   │   ├── badge.tsx          # Status badges, phase badges
│   │   ├── input.tsx          # Text inputs, search inputs
│   │   ├── select.tsx         # Radix Select with our styling
│   │   ├── dialog.tsx         # Radix Dialog — replaces ConfirmDialog pattern
│   │   ├── dropdown-menu.tsx  # Radix DropdownMenu — replaces nav Dropdown
│   │   ├── tabs.tsx           # Radix Tabs
│   │   ├── tooltip.tsx        # Radix Tooltip
│   │   ├── toast.tsx          # Radix Toast — replaces custom ToastProvider
│   │   ├── table.tsx          # Data tables (logs, agents, tokens)
│   │   ├── skeleton.tsx       # Loading skeletons (replaces CSS .skeleton)
│   │   ├── stat-card.tsx      # Dashboard stat cards (standardized)
│   │   ├── status-dot.tsx     # Status indicators (replaces .status-dot CSS)
│   │   ├── kbd.tsx            # Keyboard shortcut display
│   │   ├── separator.tsx      # Visual separators
│   │   └── index.ts           # Barrel export
│   ├── layout/                # ← NEW: Layout components
│   │   ├── page-header.tsx    # Consistent page titles + breadcrumbs
│   │   ├── page-shell.tsx     # Page wrapper with consistent padding
│   │   ├── section.tsx        # Content sections within pages
│   │   └── sidebar.tsx        # Future: collapsible sidebar
│   ├── patterns/              # ← NEW: Composed patterns
│   │   ├── data-table.tsx     # Sortable, filterable table pattern
│   │   ├── empty-state.tsx    # "No data" states
│   │   ├── error-boundary.tsx # Consistent error states
│   │   ├── loading-state.tsx  # Consistent loading states
│   │   └── confirm-action.tsx # Danger action confirmation pattern
│   ├── ... (existing domain components, gradually migrated)
```

### Design Token Migration

Current tokens in `globals.css` are good. We extend them into Tailwind:

```css
/* globals.css — enhanced */
@theme {
  --color-grid-bg: #0a0a0f;
  --color-grid-surface: #12121a;
  --color-grid-surface-hover: #1a1a28;
  --color-grid-border: #1e1e2e;
  --color-grid-border-bright: #2e2e44;
  --color-grid-accent: #ff4444;
  --color-grid-accent-dim: rgba(255, 68, 68, 0.15);
  --color-grid-text: #e0e0e0;
  --color-grid-text-dim: #888;
  --color-grid-text-muted: #555;
  --color-grid-success: #22c55e;
  --color-grid-warning: #f59e0b;
  --color-grid-error: #ef4444;
  --color-grid-info: #3b82f6;
  
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  
  --spacing-page: 1.5rem;
  --spacing-section: 1rem;
  --spacing-card: 1rem;
}
```

This lets us write `bg-grid-surface` / `text-grid-accent` / `border-grid-border` in Tailwind instead of mixing inline styles and CSS vars.

---

## 2. Testing Strategy

### The Stack

| Layer | Tool | Coverage Target | Purpose |
|-------|------|-----------------|---------|
| **Unit** | **Vitest** + React Testing Library | 80% of `ui/` components | Component behavior, props, states |
| **Integration** | **Vitest** + MSW | 60% of API routes | API route handlers, data flow |
| **Visual** | **Storybook** + Chromatic (or Percy) | All `ui/` components | Visual regression detection |
| **E2E** | **Playwright** | Critical user journeys | Full page flows, navigation |
| **E2E + AI** | **Playwright MCP** | Exploratory/regression | Agent-driven test execution |

### Why Vitest over Jest

The project currently uses Jest (v30). **Recommend migrating to Vitest:**
- Native ESM support (Next.js 16 is ESM-first)
- 2-5x faster (Vite's transform pipeline vs ts-jest)
- Same API as Jest (near-zero migration effort)
- Better TypeScript support without ts-jest
- Built-in UI mode for interactive debugging

### TDD Workflow

```
1. WRITE TEST → for new ui/ component (describe expected behavior)
2. IMPLEMENT → make the test pass
3. STORYBOOK → add story showing the component states
4. INTEGRATE → use component in page, replacing inline styles
5. E2E → add Playwright test for critical flows affected
```

### Playwright MCP Integration

Playwright has an MCP (Model Context Protocol) server that allows AI agents to:
- **Run specific tests** on demand ("run the agents page e2e test")
- **Generate tests** from natural language ("write a test that verifies the kanban drag-and-drop")
- **Debug failures** by reading test reports and screenshots
- **Visual validation** by taking screenshots and comparing

**Setup:**
```json
// In agent MCP config
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

This means SAGE (testing agent) can run and write Playwright tests directly via MCP, and any agent reviewing code can trigger test runs.

### Test File Structure

```
src/
├── components/ui/
│   ├── button.tsx
│   ├── button.test.tsx        # ← Co-located unit test
│   └── button.stories.tsx     # ← Co-located story
├── __tests__/
│   ├── api/                   # API route tests (keep existing)
│   └── integration/           # Cross-component integration tests
├── e2e/                       # ← Playwright tests (project root)
│   ├── agents.spec.ts
│   ├── dashboard.spec.ts
│   ├── kanban.spec.ts
│   └── navigation.spec.ts
```

---

## 3. Phased Rollout Plan

### Wave 0: Foundation (Week 1-2)
**"Set the stage — no visible changes yet"**

| Task | Owner | Details |
|------|-------|---------|
| Migrate Jest → Vitest | **SAGE** 🧙 | Update config, migrate 4 existing tests |
| Set up Storybook 8 | **PIXEL** 🎨 | Configure with Tailwind CSS 4, dark theme |
| Create `src/components/ui/` structure | **ARCH** 🏛️ | Folder structure, barrel exports, component template |
| Formalize design tokens in Tailwind `@theme` | **PIXEL** 🎨 | Migrate CSS vars → Tailwind theme tokens |
| Set up Playwright | **SAGE** 🧙 | Config, first smoke test (page loads) |
| Configure Playwright MCP for agents | **DEV** 💻 | Add to agent MCP server configs |
| Design system principles doc | **PIXEL** 🎨 | Written design guide (see Section 5) |
| Set up next-intl skeleton | **SCRIBE** 📝 | Config, English default messages file |

**Deliverable:** Infrastructure ready. No user-facing changes. Green CI pipeline.

### Wave 1: Core Primitives (Week 2-4)
**"Build the atoms — test-first"**

| Component | Owner | Test Coverage | Replaces |
|-----------|-------|---------------|----------|
| `Button` | **PIXEL** 🎨 | Vitest + Story | Inline button styles everywhere |
| `Card` | **PIXEL** 🎨 | Vitest + Story | `.grid-card` CSS + inline styles |
| `Badge` | **PIXEL** 🎨 | Vitest + Story | `PhaseBadge` + ad-hoc status badges |
| `StatusDot` | **PIXEL** 🎨 | Vitest + Story | `.status-dot` CSS class |
| `StatCard` | **PIXEL** 🎨 | Vitest + Story | `DashboardStats.StatCard` |
| `Input` | **PIXEL** 🎨 | Vitest + Story | Various input styles |
| `Dialog` (Radix) | **GRID** ⚡ | Vitest + Story | `ConfirmDialog` component |
| `Toast` (Radix) | **GRID** ⚡ | Vitest + Story | `ToastProvider` component |
| `DropdownMenu` (Radix) | **GRID** ⚡ | Vitest + Story | Nav `Dropdown` component |
| `Tooltip` (Radix) | **GRID** ⚡ | Vitest + Story | Various title attributes |
| `Skeleton` | **PIXEL** 🎨 | Vitest + Story | `.skeleton` CSS class |
| `PageHeader` | **PIXEL** 🎨 | Vitest + Story | Ad-hoc h1 + breadcrumb patterns |
| `Table` | **GRID** ⚡ | Vitest + Story | Multiple custom table implementations |

**Review:** All PRs reviewed by **BUG** 🐛
**Deliverable:** 15+ tested, documented components. Storybook catalogue.

### Wave 2: Page Migration — High-Impact (Week 4-6)
**"Adopt the system — pages start looking consistent"**

| Page | Owner | Priority | Notes |
|------|-------|----------|-------|
| Dashboard (home) | **GRID** ⚡ | P0 | First impression. Uses StatCard, ActivityFeed |
| Agents list | **GRID** ⚡ | P0 | High traffic. AgentCard → Card + StatusDot |
| Logs | **DEV** 💻 | P1 | Table-heavy. Good Table component showcase |
| Health | **DEV** 💻 | P1 | StatusDot + StatCard heavy |
| Errors | **DEV** 💻 | P1 | Similar to Logs |
| Settings (all sub-pages) | **DEV** 💻 | P1 | Forms → Input, Button, Dialog |
| NavBar refactor | **PIXEL** 🎨 | P0 | DropdownMenu from Radix, consistent |

**Parallel:**
- **SAGE** 🧙: Write Playwright e2e tests for each migrated page
- **SCRIBE** 📝: Extract all hardcoded strings → next-intl message keys
- **BUG** 🐛: Code review all migration PRs

**Deliverable:** Top 7 pages using design system. e2e coverage for critical flows.

### Wave 3: Complex Pages + Polish (Week 6-8)
**"The hard stuff"**

| Page | Owner | Notes |
|------|-------|-------|
| Kanban | **GRID** ⚡ | Drag-and-drop, complex state |
| Analytics (all sub-pages) | **GRID** ⚡ | Charts, data visualization |
| Office (isometric view) | **PIXEL** 🎨 | Unique — mostly SVG, less design system |
| Calendar | **GRID** ⚡ | Date handling, complex layout |
| Workflows | **GRID** ⚡ | Visual flow editor |
| Soul/Skills/Spawn | **DEV** 💻 | Form-heavy pages |
| Reports/Metrics | **DEV** 💻 | Chart + table combinations |
| Subagents | **DEV** 💻 | Tree visualization |

**Parallel:**
- **SCRIBE** 📝: Portuguese (pt-BR) translation (Evan's native language)
- **SAGE** 🧙: Full e2e suite, visual regression baseline
- **PIXEL** 🎨: a11y audit with axe-core, fix violations

**Deliverable:** All pages migrated. Full i18n. WCAG AA audit pass.

### Wave 4: Excellence (Week 8-10)
**"Polish and performance"**

| Task | Owner |
|------|-------|
| Dark/light theme refinement | **PIXEL** 🎨 |
| Animation/transition system | **PIXEL** 🎨 |
| Mobile responsive audit | **PIXEL** 🎨 + **GRID** ⚡ |
| Performance profiling (bundle size, render) | **ARCH** 🏛️ |
| Storybook documentation completion | **SCRIBE** 📝 |
| Visual regression CI integration | **SAGE** 🧙 |
| a11y automated testing in CI | **SAGE** 🧙 |
| Component API documentation | **SCRIBE** 📝 |

---

## 4. Team Assignments

### PIXEL 🎨 — Design System Lead
**Role:** Owns the visual language, component design, Storybook
- Creates all `ui/` primitives (design + implementation)
- Writes Storybook stories
- Defines design tokens, spacing, typography scale
- Leads a11y audit
- Migrates visually complex pages (Office, NavBar)
- **Workload:** Heavy in Wave 0-1, sustained through Wave 3

### GRID ⚡ — Integration Lead
**Role:** Owns complex component integrations and page migrations
- Implements Radix-based components (Dialog, Toast, Dropdown, Tabs)
- Migrates data-heavy pages (Dashboard, Agents, Analytics, Kanban)
- Handles Table component (sorting, filtering, pagination)
- **Workload:** Light in Wave 0, heavy in Wave 1-3

### DEV 💻 — Migration Workhorse
**Role:** Bulk page migrations, utility work
- Migrates settings pages, form-heavy pages
- Sets up Playwright MCP configuration
- Utility functions (cn() helper, token utils)
- **Workload:** Light in Wave 0-1, heavy in Wave 2-3

### SCRIBE 📝 — i18n + Documentation
**Role:** Owns all text content
- Sets up next-intl infrastructure
- Extracts all hardcoded strings to message files
- Writes English default messages
- Translates to Portuguese (pt-BR)
- Documents component APIs in Storybook
- **Workload:** Wave 0 (skeleton), then Wave 2-4

### SAGE 🧙 — Testing + QA
**Role:** Owns the testing pyramid
- Migrates Jest → Vitest
- Sets up Playwright + MCP
- Writes e2e tests for each migrated page
- Runs a11y automated testing (axe-core)
- Sets up visual regression pipeline
- **Workload:** Consistent across all waves

### ARCH 🏛️ — Architecture Guardian
**Role:** Technical decisions, code structure
- Defines folder structure and conventions
- Reviews architectural decisions (component API design)
- Performance profiling
- Bundle analysis
- **Workload:** Heavy in Wave 0, advisory in Wave 1-3, heavy in Wave 4

### BUG 🐛 — Code Review
**Role:** Quality gate
- Reviews all PRs before merge
- Checks for design system compliance
- Catches a11y violations
- Ensures test coverage
- **Workload:** Sustained across all waves

---

## 5. Design Principles & Direction

### Identity: "Mission Control for Agent Fleets"

**Visual Inspirations:**
- **Linear** — Clean, minimal, monochrome with one accent color
- **Vercel Dashboard** — Dense information, no wasted space, dark-first
- **Bloomberg Terminal** — Data density, monospace, functional beauty
- **SpaceX Mission Control** — Status indicators, real-time data, urgency

### The Five Principles

#### 1. **Monospace is Sacred**
JetBrains Mono everywhere. It's not just a font — it's the brand. Tabular numbers align naturally. Code and data feel at home. The dashboard IS a terminal, elevated.

#### 2. **Red Means Attention, Not Decoration**
`#ff4444` is reserved for:
- Interactive elements (primary buttons, links)
- Active states (current nav item)
- Critical alerts
- Brand identity (logo, accent line)

Never use it for backgrounds, large fills, or decoration. It should pop against the dark surface. When everything is red, nothing is red.

#### 3. **Information Density Over Whitespace**
This is a power user tool, not a marketing page. Prioritize:
- Compact spacing (8px/12px/16px scale, not 24px/32px)
- Data tables over cards-for-everything
- Multiple information layers (hover reveals details)
- Scannable at a glance

But density ≠ clutter. Use:
- Consistent alignment
- Clear visual hierarchy (size, weight, color)
- Whitespace *between* sections, not within components

#### 4. **States Tell the Story**
Every interactive element needs four visible states:
- **Default** — Calm, receded
- **Hover** — Subtly brighter border/background
- **Active/Focus** — Red accent, 2px outline
- **Disabled** — 50% opacity, no pointer events

Status indicators are first-class citizens:
- 🟢 Active/Success — `#22c55e` with glow
- 🟡 Idle/Warning — `#f59e0b`
- 🔴 Error/Critical — `#ef4444` with pulse
- 🔵 Busy/Info — `#3b82f6`
- ⚫ Offline/Inactive — `#555`

#### 5. **Progressive Disclosure**
Show the essential. Reveal the rest on interaction.
- Collapsed sections that expand
- Tooltips for additional context
- Slide-out panels for details (not new pages)
- Command palette (⌘K) for power users

### Typography Scale

```
xs:   11px — labels, metadata, timestamps
sm:   12px — body text, table cells, nav items
base: 13px — primary content
md:   14px — section headers, card titles
lg:   16px — page titles
xl:   20px — hero numbers (stat cards)
2xl:  28px — dashboard hero stats
```

All JetBrains Mono. Weight: 400 (body), 500 (emphasis), 700 (headings/numbers).

### Spacing Scale

```
1:  4px   — tight (inline elements, icon gaps)
2:  8px   — compact (within components)
3:  12px  — standard (between related items)
4:  16px  — section (component padding)
5:  20px  — comfortable (between components)
6:  24px  — generous (between sections)
8:  32px  — page (major section breaks)
```

### Color System

```
Backgrounds:
  bg-grid-bg          #0a0a0f    — Page background
  bg-grid-surface     #12121a    — Card/panel background
  bg-grid-surface-hover #1a1a28  — Hover state

Borders:
  border-grid-border       #1e1e2e    — Default
  border-grid-border-bright #2e2e44   — Hover/emphasis

Text:
  text-grid-text      #e0e0e0    — Primary
  text-grid-text-dim  #888       — Secondary
  text-grid-text-muted #555      — Tertiary/disabled

Accent:
  text-grid-accent    #ff4444    — Brand red
  bg-grid-accent-dim  rgba(255,68,68,0.15) — Subtle highlight

Semantic:
  success  #22c55e
  warning  #f59e0b
  error    #ef4444
  info     #3b82f6
```

---

## 6. i18n Strategy

### Tool: **next-intl**

Why next-intl:
- First-class Next.js App Router support
- Server component compatible
- Small bundle impact (~2KB)
- Maintained by Vercel-adjacent community
- Supports ICU MessageFormat (plurals, numbers, dates)

### Implementation Plan

```
src/
├── i18n/
│   ├── config.ts              # Locale config, default locale
│   ├── request.ts             # next-intl request config
│   └── messages/
│       ├── en.json            # English (default, source of truth)
│       ├── pt-BR.json         # Portuguese (Brazil) — Evan's language
│       └── ... (future)
├── middleware.ts              # Add locale detection
```

### Message Organization

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "loading": "Loading...",
    "error": "Something went wrong",
    "noData": "No data available"
  },
  "nav": {
    "dashboard": "Dashboard",
    "agents": "Agents",
    "office": "Office",
    "analytics": "Analytics"
  },
  "agents": {
    "title": "Agent Fleet",
    "status": {
      "active": "Active",
      "idle": "Idle",
      "busy": "Busy"
    }
  }
}
```

### Workflow
1. **SCRIBE** extracts all hardcoded strings during Wave 2 page migrations
2. Each page migration PR includes string extraction
3. English is the source of truth
4. Portuguese translation in Wave 3
5. Future languages added by duplicating message files

---

## 7. Accessibility (a11y) Strategy

### Target: **WCAG 2.1 AA**

### Current State (Audit)
- ✅ Focus visible styles exist (`:focus-visible` in globals.css)
- ✅ Some `aria-label` usage (7 files)
- ❌ Only 2 files use `role=` attributes
- ❌ No skip navigation
- ❌ Dropdown menus lack keyboard navigation (custom implementation)
- ❌ No screen reader announcements for dynamic content
- ❌ Color contrast not verified
- ❌ No reduced motion support

### The Fix (Built Into Every Wave)

**Wave 0:**
- Add `prefers-reduced-motion` media query support
- Add skip navigation link
- Install `eslint-plugin-jsx-a11y`

**Wave 1 (Radix handles most of this):**
- Dialog: focus trap, Escape, aria-modal ✅ (Radix)
- Dropdown: keyboard nav, arrow keys, typeahead ✅ (Radix)
- Toast: aria-live announcements ✅ (Radix)
- All interactive elements: proper focus management ✅ (Radix)

**Wave 2-3:**
- Page titles (document.title per page)
- Heading hierarchy (h1 → h2 → h3, no skips)
- Alt text for all meaningful images/icons
- Form labels for all inputs
- Error messages linked to form fields (aria-describedby)
- Table headers with proper scope

**Wave 4:**
- Automated axe-core testing in CI
- Manual screen reader testing (VoiceOver)
- Color contrast verification
- Keyboard-only navigation testing

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Technical Implementation Details

### Utility: `cn()` helper

```ts
// src/lib/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

This is the shadcn/ui pattern — merge Tailwind classes intelligently. Essential for component variant APIs.

### Component API Pattern

```tsx
// src/components/ui/button.tsx
import { cn } from '@/lib/cn';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-grid-accent text-white hover:bg-red-600',
  secondary: 'border border-grid-border bg-grid-surface text-grid-text hover:bg-grid-surface-hover',
  ghost: 'text-grid-text-dim hover:text-grid-text hover:bg-grid-surface-hover',
  danger: 'bg-grid-error text-white hover:bg-red-700',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'text-xs px-2 py-1',
  md: 'text-xs px-3 py-1.5',
  lg: 'text-sm px-4 py-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-mono transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grid-accent',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = 'Button';
```

### New Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-dropdown-menu": "^2.x",
    "@radix-ui/react-tooltip": "^1.x",
    "@radix-ui/react-toast": "^1.x",
    "@radix-ui/react-tabs": "^1.x",
    "@radix-ui/react-select": "^2.x",
    "@radix-ui/react-separator": "^1.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "next-intl": "^4.x"
  },
  "devDependencies": {
    "vitest": "^3.x",
    "@vitejs/plugin-react": "^4.x",
    "@testing-library/react": "^16.x",
    "@testing-library/user-event": "^14.x",
    "@playwright/test": "^1.x",
    "@storybook/nextjs": "^8.x",
    "@storybook/addon-a11y": "^8.x",
    "eslint-plugin-jsx-a11y": "^6.x",
    "axe-playwright": "^2.x"
  }
}
```

---

## 9. Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| **Migration breaks existing pages** | Gradual adoption — new components are additive, old code stays until explicitly migrated |
| **Bundle size increase from Radix** | Tree-shakeable. Each primitive ~3-5KB. Total impact <20KB gzipped for all we need |
| **Team velocity drop during transition** | Wave 0-1 are parallel to regular work. Page migrations happen one-at-a-time |
| **Design inconsistency during migration** | Component library enforces consistency. Old and new can coexist |
| **i18n string extraction is tedious** | Do it during page migration, not as separate pass. SCRIBE handles bulk |

---

## 10. Success Metrics

| Metric | Before | Target (Wave 4) |
|--------|--------|-----------------|
| Component test coverage | 0% | 80%+ for `ui/` |
| E2E test coverage | 0 tests | 15+ critical flows |
| Files using inline `style={{}}` | 30/52 | <5/52 |
| Storybook stories | 0 | 40+ |
| a11y violations (axe-core) | Unknown | 0 critical, <5 minor |
| Hardcoded strings | ~100% | <5% (rest in message files) |
| Languages supported | 1 (implicit) | 2 (en, pt-BR) |
| Lighthouse a11y score | Unknown | 90+ |
| Shared `ui/` components used | 0 | 15+ |

---

## Decision Required

**Evan — approve, modify, or reject:**

1. ✅ / ❌ Radix UI primitives (not raw shadcn/ui)
2. ✅ / ❌ Vitest migration (from Jest)
3. ✅ / ❌ Storybook for component documentation
4. ✅ / ❌ next-intl for i18n
5. ✅ / ❌ Phased rollout (4 waves, ~10 weeks)
6. ✅ / ❌ Team assignments as proposed
7. ✅ / ❌ Portuguese (pt-BR) as first translation target

Once approved, **Wave 0 begins immediately.**

---

*This document lives at `GRID-DESIGN-SYSTEM-STRATEGY.md` and will be updated as decisions are made.*
