# CRITICAL BUGS - Wave 4 Sprint (P0)

## Emergency bug fixes reported by Evan - must be fixed BEFORE continuing Wave 4

---

### Task BUG-1: Office — Elementos sem contraste
**Owner:** PIXEL
**Priority:** P0 (CRÍTICO)

Fix critical contrast issues in isometric office:
- Elements in isometric office without visible contrast
- Verify design tokens are properly applied
- Test in both light/dark mode
- Ensure accessibility compliance

**Files:**
- `app/src/components/office/*`
- Design token CSS files
- Theme-related components

---

### Task BUG-2: Analytics — Páginas quebradas  
**Owner:** GRID
**Priority:** P0 (CRÍTICO)

Fix broken analytics pages:
- Analytics pages with broken API or requests
- Verify all endpoints are working
- Test all 5 sub-pages: performance, sessions, tokens, timeline, metrics
- Fix any routing or data fetching issues

**Files:**
- `app/src/app/analytics/*`
- API endpoint files
- Analytics components

---

### Task BUG-3: Tools — Quebrados
**Owner:** GRID
**Priority:** P0 (CRÍTICO)

Diagnose and fix broken tools:
- Tools are not functioning properly
- Diagnose which page/component is broken
- Fix all broken functionality
- Ensure all tool features work properly

**Files:**
- `app/src/app/tools/*` 
- Tool component files
- Related utilities and APIs