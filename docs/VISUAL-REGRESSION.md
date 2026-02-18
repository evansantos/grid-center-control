# Visual Regression Testing

This document describes the visual regression testing setup for the design system, ensuring visual consistency across changes and preventing unintended UI regressions.

## 📖 Overview

Visual regression testing automatically captures screenshots of UI components and compares them against baseline images to detect visual changes. This helps maintain design consistency and catch visual bugs before they reach production.

### Key Features

- 🤖 **Automated CI/CD Integration**: Tests run on every PR and push
- 📱 **Multi-viewport Testing**: Desktop, tablet, and mobile viewports
- 🎯 **Component-level Testing**: Individual component screenshot comparisons
- 📊 **Detailed Reporting**: Visual diffs with highlighted changes
- 🔄 **Baseline Management**: Easy baseline updates and version control

## 🚀 Quick Start

### Running Visual Regression Tests Locally

```bash
# Navigate to app directory
cd app

# Install dependencies (if not already done)
npm install

# Run visual regression tests
npm run test:e2e -- --project=visual-regression

# Generate new baselines (first time or when updating)
npm run test:e2e -- --project=visual-regression --update-snapshots
```

### First Time Setup

1. **Install Dependencies**:
   ```bash
   cd app
   npm install
   npx playwright install chromium
   ```

2. **Generate Initial Baselines**:
   ```bash
   npm run test:e2e -- --project=visual-regression --update-snapshots
   ```

3. **Commit Baselines**:
   ```bash
   git add e2e/visual-regression-screenshots/
   git commit -m "Add initial visual regression baselines"
   ```

## 🔧 Configuration

### Playwright Configuration

The visual regression tests are configured in `playwright.config.ts` with a dedicated project:

```typescript
{
  name: 'visual-regression',
  use: {
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    // ... additional configuration
  },
  testMatch: '**/visual-regression.spec.ts',
}
```

### Key Configuration Options

- **Viewport**: Fixed at 1280x720 for consistency
- **Reduced Motion**: Disabled animations for stable screenshots
- **Device Scale Factor**: Set to 1 for consistent pixel density
- **Threshold**: 0.2 locally, 0.3 in CI (more lenient for environment differences)

### Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `VISUAL_REGRESSION_UPDATE_SNAPSHOTS` | Update baselines instead of comparing | `false` |
| `RUN_VISUAL_TESTS` | Force visual tests to run in CI | `false` |
| `DISABLE_ANIMATIONS` | Disable CSS animations for stable screenshots | `false` (CI: `true`) |

## 📁 Project Structure

```
app/
├── e2e/
│   ├── visual-regression.spec.ts           # Visual regression tests
│   ├── visual-regression-screenshots/      # Baseline screenshots
│   │   ├── component-button-primary.png
│   │   ├── component-card-default.png
│   │   └── ...
│   └── ...
├── playwright.config.ts                    # Playwright configuration
└── ...
```

## ✍️ Writing Visual Regression Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Component Visual Regression', () => {
  test('button component variants', async ({ page }) => {
    await page.goto('/storybook');
    await page.goto('/storybook/iframe.html?id=button--primary');
    
    // Wait for component to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await expect(page).toHaveScreenshot('button-primary.png');
  });
  
  test('card component states', async ({ page }) => {
    await page.goto('/storybook/iframe.html?id=card--default');
    await page.waitForLoadState('networkidle');
    
    // Screenshot specific element
    const card = page.locator('[data-testid="card"]');
    await expect(card).toHaveScreenshot('card-default.png');
  });
});
```

### Best Practices

#### 1. **Wait for Stability**
```typescript
// Wait for network to be idle
await page.waitForLoadState('networkidle');

// Wait for specific elements
await page.waitForSelector('[data-testid="component"]');

// Wait for animations to complete
await page.waitForTimeout(500);
```

#### 2. **Handle Dynamic Content**
```typescript
// Mock dynamic content
await page.route('**/api/time', route => {
  route.fulfill({
    body: JSON.stringify({ time: '2024-01-01T00:00:00Z' })
  });
});

// Hide dynamic elements
await page.addStyleTag({
  content: `
    .timestamp { visibility: hidden !important; }
    .loading-spinner { display: none !important; }
  `
});
```

#### 3. **Test Component Variants**
```typescript
const variants = ['primary', 'secondary', 'danger'];

for (const variant of variants) {
  test(`button ${variant}`, async ({ page }) => {
    await page.goto(`/storybook/iframe.html?id=button--${variant}`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot(`button-${variant}.png`);
  });
}
```

#### 4. **Responsive Testing**
```typescript
test.describe('Responsive Components', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 },
  ];

  for (const viewport of viewports) {
    test(`navigation ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await expect(page.locator('nav')).toHaveScreenshot(`nav-${viewport.name}.png`);
    });
  }
});
```

## 🔄 CI/CD Integration

### GitHub Actions Workflow

The visual regression tests run automatically on:

- **Pull Requests**: Compare against main branch baselines
- **Pushes to main/develop**: Validate baselines
- **Manual Dispatch**: Update baselines when needed

### Workflow Triggers

1. **Automatic on PR**: Tests run and report visual differences
2. **Baseline Updates**: Include `[update-baselines]` in commit message
3. **Manual Trigger**: Use GitHub Actions workflow dispatch

### Handling Test Failures

When visual regression tests fail in CI:

1. **Review the Changes**: Download test artifacts to see visual diffs
2. **Intentional Changes**: Update baselines locally and push
3. **Unintentional Changes**: Fix the code causing visual regression

### Updating Baselines in CI

#### Method 1: Commit Message
```bash
git commit -m "Update button component styles [update-baselines]"
```

#### Method 2: Manual Workflow Dispatch
1. Go to GitHub Actions
2. Select "Visual Regression Testing" workflow
3. Click "Run workflow"
4. Provide reason for baseline update

## 🛠️ Troubleshooting

### Common Issues

#### 1. **Font Rendering Differences**
```typescript
// Solution: Use consistent fonts
await page.addStyleTag({
  content: `
    * { 
      font-family: -apple-system, sans-serif !important;
      -webkit-font-smoothing: antialiased !important;
    }
  `
});
```

#### 2. **Animation/Transition Issues**
```typescript
// Solution: Disable animations
await page.addStyleTag({
  content: `
    *, *::before, *::after {
      animation-duration: 0s !important;
      transition-duration: 0s !important;
      animation-delay: 0s !important;
      transition-delay: 0s !important;
    }
  `
});
```

#### 3. **Flaky Tests Due to Dynamic Content**
```typescript
// Solution: Mock or hide dynamic content
await page.route('**/api/**', route => route.abort());
await page.evaluate(() => {
  document.querySelectorAll('[data-dynamic]').forEach(el => {
    el.textContent = 'Static Content';
  });
});
```

#### 4. **Baseline Differences Between Environments**
- **Use consistent browser versions**: Pin Playwright version
- **Font consistency**: Install same fonts in CI
- **GPU rendering**: Disable in CI with `--disable-gpu` flag

### Debug Commands

```bash
# Run with debug mode
npx playwright test --project=visual-regression --debug

# Update specific test
npx playwright test button.spec.ts --project=visual-regression --update-snapshots

# Generate test report
npx playwright show-report

# Compare specific screenshots
npx playwright test --project=visual-regression --reporter=html
```

### Local vs CI Differences

| Aspect | Local | CI |
|--------|-------|-----|
| **Threshold** | 0.2 | 0.3 |
| **Animations** | Allowed | Disabled |
| **GPU** | Enabled | Disabled |
| **Fonts** | System | Ubuntu fonts |
| **Retries** | 0 | 2 |

## 📊 Monitoring and Reporting

### Test Results

Visual regression tests provide:
- **Screenshots**: Before/after comparison
- **Diff Images**: Highlighted changes
- **HTML Report**: Interactive comparison viewer
- **JUnit XML**: CI integration
- **JSON Results**: Programmatic access

### Metrics to Track

- **Test Coverage**: Number of components tested
- **Failure Rate**: Percentage of failing visual tests
- **Baseline Age**: How often baselines are updated
- **Test Duration**: Time taken for visual regression suite

### Integration with Monitoring

```typescript
// Example: Report metrics to monitoring service
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status === 'failed') {
    await reportVisualRegressionFailure({
      test: testInfo.title,
      component: extractComponentName(testInfo.title),
      timestamp: new Date().toISOString()
    });
  }
});
```

## 🔮 Advanced Usage

### Custom Screenshot Comparison

```typescript
// Custom threshold for specific test
await expect(page).toHaveScreenshot('component.png', {
  threshold: 0.1,
  animations: 'disabled'
});

// Mask dynamic regions
await expect(page).toHaveScreenshot('page.png', {
  mask: [page.locator('[data-timestamp]')]
});

// Full page screenshot
await expect(page).toHaveScreenshot('full-page.png', {
  fullPage: true
});
```

### Integration with Storybook

```typescript
// Test all Storybook stories
import { getStorybook, configure } from '@storybook/test-runner';

test.describe('Storybook Visual Regression', () => {
  const stories = getStorybook();
  
  for (const story of stories) {
    test(`${story.title} - ${story.name}`, async ({ page }) => {
      await page.goto(`/storybook/iframe.html?id=${story.id}`);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot(`${story.id}.png`);
    });
  }
});
```

### Performance Optimization

```typescript
// Parallel test execution
test.describe.configure({ mode: 'parallel' });

// Skip expensive operations
if (process.env.VISUAL_REGRESSION_FAST_MODE) {
  test.skip('expensive visual test');
}

// Conditional screenshot taking
if (process.env.UPDATE_SCREENSHOTS === 'true') {
  await expect(page).toHaveScreenshot('component.png');
}
```

## 📚 Resources

### Links

- [Playwright Visual Comparisons](https://playwright.dev/docs/test-screenshots)
- [GitHub Actions for Playwright](https://playwright.dev/docs/ci-github-actions)
- [Visual Regression Testing Best Practices](https://docs.cypress.io/guides/tooling/visual-testing)

### Tools

- **Playwright**: Testing framework
- **GitHub Actions**: CI/CD pipeline
- **Storybook**: Component development and testing
- **Visual Diff Viewers**: Compare screenshot changes

---

## 📞 Support

For issues with visual regression testing:

1. **Check this documentation** for common solutions
2. **Review GitHub Actions logs** for CI failures
3. **Compare local vs CI environments** for consistency issues
4. **Update baselines** when intentional changes are made

**Remember**: Visual regression tests are meant to catch unintended changes. If tests fail, investigate whether the changes are intentional before updating baselines.