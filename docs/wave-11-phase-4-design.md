# Wave 11 Phase 4: Polish & UX — Design

## Overview
Final phase of Wave 11. Refactor oversized components, clean dead code, polish UX, improve infrastructure.

## Components

### W11-26: Split living-office.tsx (GRID)
- Extract: state management hook (`useLivingOfficeState`), agent visualization (`AgentAvatar`, `AgentCluster`), animations (`OfficeAnimations`), layout (`OfficeFloor`, `OfficeRoom`)
- Target: ≤300 lines per file, main component becomes composition root

### W11-27: Split isometric-office.tsx (GRID)
- Same pattern as W11-26: extract isometric rendering, tile system, agent placement, camera controls
- Depends on W11-26 patterns

### W11-28: Remove commented-out code (ATLAS)
- Remove all 181 commented-out blocks identified in ATLAS-METRICS.md
- Verify build passes after each batch

### W11-29: Standardize imports (ATLAS)
- Convert relative imports to `@/` absolute imports
- Add barrel exports (index.ts) for component directories
- Update tsconfig paths if needed

### W11-30: Replace SSE fs.watch (DEV)
- Replace fs.watch with polling interval (2s)
- Single poller instance broadcasts to all connected SSE clients
- Fix macOS FSEvents reliability issues

### W11-31: Task Distribution widget (PIXEL)
- Heatmap showing task count per agent per status
- Queue depth indicators, bottleneck highlighting
- Uses shared agent service from W11-13

### W11-32: Agent assignment indicators on Kanban (PIXEL)
- Show agent avatar/badge on task cards
- Color-coded by agent role

### W11-33: Replace inline styles in kanban/client.tsx (PIXEL)
- Convert inline styles to CSS variables and Tailwind classes
- Maintain visual parity

### W11-34: Migration runner (DEV)
- Version tracking table in grid.db
- Auto-run pending migrations on startup
- Idempotent, ordered by version number

### W11-35: BUG review all Phase 4 (BUG)

## Rounds
- Round 1: W11-26 + W11-28 + W11-30 + W11-32 (parallel)
- Round 2: W11-27 + W11-29 + W11-31 + W11-33 + W11-34 (parallel)
- Round 3: W11-35 (BUG review)
- Build verification between rounds
