# Wave 11 Phase 4: Execution Plan

### Task 1: Split living-office.tsx into ≤300-line components [GRID]
Split `app/src/components/living-office.tsx` (1,454 lines) into ≤300-line components. Extract: state management hook, agent visualization components, animations, layout components. Main file becomes thin composition root. Verify build + no regressions.

### Task 2: Split isometric-office.tsx into ≤300-line components [GRID]
Split `app/src/components/isometric-office.tsx` (1,094 lines) similarly to Task 1. Extract: isometric rendering, tile system, agent placement, camera controls. ≤300 lines per component. Verify build.

### Task 3: Remove 181 commented-out code blocks [ATLAS]
Remove all 181 commented-out code blocks across the codebase as identified in docs/ATLAS-METRICS.md. Verify build passes after removal.

### Task 4: Standardize import patterns and add barrel exports [ATLAS]
Convert relative imports to `@/` absolute imports across codebase. Add barrel exports (index.ts) for component directories. Verify tsconfig paths configuration.

### Task 5: Replace SSE fs.watch with server-side poller [DEV]
Replace `fs.watch` in `app/src/app/api/stream/route.ts` and `app/src/app/api/agents/stream/route.ts` with a single server-side poller (2s interval) that broadcasts to all SSE clients. Fix macOS FSEvents reliability issues.

### Task 6: Add agent assignment indicators to Kanban task cards [PIXEL]
Add agent avatar/badge to Kanban task cards in `app/src/app/kanban/client.tsx`. Color-coded by agent role. Show assigned agent name on hover.

### Task 7: Build Task Distribution widget [PIXEL]
Build workload heatmap widget showing task count per agent per status. Queue depth indicators, bottleneck highlighting. Place on dashboard. Uses shared agent service.

### Task 8: Replace inline styles in kanban/client.tsx [PIXEL]
Convert all inline styles in `app/src/app/kanban/client.tsx` to CSS variables and Tailwind classes. Maintain exact visual parity.

### Task 9: Implement migration runner with version tracking [DEV]
Create `_migrations` table in grid.db for version tracking. Auto-run pending migrations on startup, ordered by version. Idempotent execution. Files in `engine/migrations/`.

### Task 10: BUG review all Phase 4 changes [BUG]
Review all Phase 4 changes for regressions. Verify build, component splits, import changes work correctly. Approve or request fixes.
