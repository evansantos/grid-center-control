# Accessibility Guide

## Overview

This project is committed to providing an inclusive and accessible experience for all users. We follow WCAG 2.1 Level AA standards and implement comprehensive accessibility testing in our CI/CD pipeline.

## Accessibility Standards

We test against the following accessibility standards:

- **WCAG 2.1 Level A**: Essential accessibility requirements
- **WCAG 2.1 Level AA**: Enhanced accessibility features
- **Heading Hierarchy**: Proper semantic structure
- **Keyboard Navigation**: Full keyboard accessibility
- **Skip Links**: Quick navigation for screen readers

## Automated Testing

### Continuous Integration

Our GitHub Actions workflow (`.github/workflows/a11y.yml`) runs accessibility tests on every push and pull request:

- **axe-core Integration**: Every e2e test includes axe-core accessibility scanning
- **Critical Violations**: CI fails on critical and serious accessibility violations
- **Comprehensive Reports**: Detailed accessibility reports generated for each run
- **PR Comments**: Automatic accessibility status comments on pull requests

### Testing Approach

#### 1. axe-core in E2E Tests

Every Playwright e2e test includes accessibility scanning:

```typescript
import { checkA11y, checkHeadingHierarchy } from './axe-helper';

test('my feature test', async ({ page }) => {
  await page.goto('/my-page');
  
  // Your regular test assertions...
  
  // Accessibility checks
  await checkA11y(page, 'My Page - feature name');
  await checkHeadingHierarchy(page);
});
```

#### 2. Axe Helper Functions

Our `axe-helper.ts` provides several testing utilities:

- `checkA11y(page, testName?)`: Runs axe-core scan with WCAG 2A/AA rules
- `checkHeadingHierarchy(page)`: Validates proper heading structure (h1 → h2 → h3, etc.)
- `checkSkipNavigation(page)`: Tests skip navigation functionality

#### 3. Violation Severity Levels

- **Critical**: Blocks CI, must be fixed immediately
- **Serious**: Blocks CI, should be addressed before merge
- **Moderate**: Warning, plan to fix in next iteration
- **Minor**: Advisory, consider fixing during refactoring

## Development Guidelines

### Code Standards

#### 1. Semantic HTML

Use proper HTML elements for their intended purpose:

```html
<!-- ✅ Good -->
<button onClick={handleClick}>Submit</button>
<nav aria-label="Main navigation">...</nav>
<main>...</main>

<!-- ❌ Bad -->
<div onClick={handleClick}>Submit</div>
<div className="nav">...</div>
<div className="content">...</div>
```

#### 2. ARIA Labels and Roles

Provide clear labels for interactive elements:

```typescript
// ✅ Good
<button aria-label="Close dialog">×</button>
<input aria-label="Search agents" placeholder="Search..." />
<div role="tabpanel" aria-labelledby="tab-1">...</div>

// ❌ Bad
<button>×</button>
<input placeholder="Search..." />
<div>...</div>
```

#### 3. Heading Hierarchy

Maintain logical heading structure:

```html
<!-- ✅ Good -->
<h1>Dashboard</h1>
  <h2>Quick Actions</h2>
  <h2>Recent Activity</h2>
    <h3>Today</h3>
    <h3>Yesterday</h3>

<!-- ❌ Bad -->
<h1>Dashboard</h1>
  <h3>Quick Actions</h3> <!-- Skip h2 -->
  <h2>Recent Activity</h2>
    <h4>Today</h4> <!-- Skip h3 -->
```

#### 4. Focus Management

Ensure keyboard navigation works correctly:

```typescript
// ✅ Good - manage focus after navigation
const handleNavigate = () => {
  router.push('/agents');
  // Focus will be managed by page load
};

// ✅ Good - skip to content link
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
```

#### 5. Color and Contrast

Don't rely on color alone to convey information:

```typescript
// ✅ Good - multiple indicators
<span className={`status-badge ${status}`} aria-label={`Status: ${status}`}>
  {status === 'active' && '●'} {status}
</span>

// ❌ Bad - color only
<span className={`status-${status}`}>{status}</span>
```

### React/Next.js Best Practices

#### 1. Form Accessibility

```typescript
// ✅ Good
<form>
  <label htmlFor="email">Email Address</label>
  <input 
    id="email" 
    type="email" 
    required 
    aria-describedby="email-error"
  />
  <div id="email-error" role="alert" aria-live="polite">
    {emailError}
  </div>
</form>
```

#### 2. Modal Accessibility

```typescript
// ✅ Good
<Dialog>
  <Dialog.Content
    role="dialog"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
    aria-modal="true"
  >
    <Dialog.Title id="dialog-title">Settings</Dialog.Title>
    <Dialog.Description id="dialog-description">
      Update your preferences
    </Dialog.Description>
    {/* Content */}
  </Dialog.Content>
</Dialog>
```

#### 3. Table Accessibility

```typescript
// ✅ Good
<table>
  <caption>Agent Performance Metrics</caption>
  <thead>
    <tr>
      <th scope="col">Agent Name</th>
      <th scope="col">Tasks Completed</th>
      <th scope="col">Success Rate</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">GRID</th>
      <td>45</td>
      <td>98%</td>
    </tr>
  </tbody>
</table>
```

## Testing Locally

### Running Accessibility Tests

```bash
# Run all e2e tests (includes accessibility)
npm run test:e2e

# Run specific test with accessibility checks
npx playwright test dashboard.spec.ts

# Generate accessibility report
npm run test:e2e -- --reporter=html
```

### Manual Testing

#### Keyboard Testing

1. **Tab Navigation**: Use `Tab` to navigate through interactive elements
2. **Enter/Space**: Activate buttons and links
3. **Arrow Keys**: Navigate within components (dropdowns, tabs)
4. **Escape**: Close modals and dropdowns

#### Screen Reader Testing

Test with screen readers like:
- **macOS**: VoiceOver (`Cmd + F5`)
- **Windows**: NVDA (free), JAWS
- **Browser extensions**: axe DevTools, WAVE

### Browser DevTools

#### axe DevTools Extension

1. Install axe DevTools browser extension
2. Open DevTools → axe tab
3. Click "Scan ALL of my page"
4. Review and fix violations

#### Chrome DevTools Audit

1. Open DevTools → Lighthouse tab
2. Select "Accessibility" category
3. Run audit
4. Review recommendations

## Common Issues and Solutions

### 1. Missing Form Labels

```typescript
// ❌ Problem
<input placeholder="Search agents..." />

// ✅ Solution
<label htmlFor="search-agents">Search agents</label>
<input id="search-agents" placeholder="Search agents..." />

// ✅ Alternative with aria-label
<input aria-label="Search agents" placeholder="Search agents..." />
```

### 2. Insufficient Color Contrast

Check contrast ratios meet WCAG standards:
- **Normal text**: 4.5:1 minimum
- **Large text**: 3:1 minimum
- **UI components**: 3:1 minimum

### 3. Missing Focus Indicators

```css
/* ✅ Ensure visible focus indicators */
button:focus-visible {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
}
```

### 4. Inaccessible Custom Components

```typescript
// ❌ Problem - custom dropdown without accessibility
<div className="dropdown" onClick={toggleOpen}>
  {selectedItem}
</div>

// ✅ Solution - proper dropdown accessibility
<button
  role="combobox"
  aria-expanded={isOpen}
  aria-haspopup="listbox"
  onClick={toggleOpen}
>
  {selectedItem}
</button>
{isOpen && (
  <ul role="listbox" aria-label="Options">
    {options.map(option => (
      <li key={option.id} role="option" aria-selected={option.selected}>
        {option.label}
      </li>
    ))}
  </ul>
)}
```

## Resources

### Official Guidelines
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/)
- [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Accessibility Checklist](https://webaim.org/standards/wcag/checklist)

### Tools
- [axe-core](https://github.com/dequelabs/axe-core) - Automated accessibility testing
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluator
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)

### React/Next.js Specific
- [React Accessibility](https://reactjs.org/docs/accessibility.html)
- [Next.js Accessibility](https://nextjs.org/docs/accessibility)
- [Headless UI](https://headlessui.com/) - Accessible React components
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives

## Support

If you encounter accessibility issues or have questions:

1. **Check CI Reports**: Review accessibility test results in GitHub Actions
2. **Local Testing**: Run e2e tests locally with `npm run test:e2e`
3. **Create Issue**: File a GitHub issue with accessibility label
4. **Team Review**: Accessibility should be considered in all code reviews

Remember: Accessibility benefits everyone, not just users with disabilities. Building accessible interfaces leads to better UX for all users.