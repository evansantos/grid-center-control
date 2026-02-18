import { test, expect } from '@playwright/test';
import { checkA11y, checkHeadingHierarchy } from './axe-helper';

test.describe('Dashboard Page', () => {
  test('should load successfully with Mission Control heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Mission Control' })).toBeVisible();
    
    // Run accessibility checks
    await checkA11y(page, 'Dashboard - basic load');
    await checkHeadingHierarchy(page);
  });

  test('should render layout preset buttons and be clickable', async ({ page }) => {
    await page.goto('/');
    
    // Wait for layout preset buttons to be rendered
    const layoutButtons = page.getByRole('button').filter({ hasText: /grid|list|compact/i });
    await expect(layoutButtons.first()).toBeVisible();
    
    // Test that buttons are clickable
    const firstButton = layoutButtons.first();
    await expect(firstButton).toBeEnabled();
    await firstButton.click();
    
    // Run accessibility checks after interaction
    await checkA11y(page, 'Dashboard - layout buttons');
  });

  test('should render widget cards with titles', async ({ page }) => {
    await page.goto('/');
    
    // Look for widget cards - they should have headings or titles
    const widgets = page.locator('[data-testid*="widget"], [class*="widget"], [class*="card"]').first();
    await expect(widgets).toBeVisible({ timeout: 10000 });
    
    // Check that at least one widget has a title/heading
    const widgetTitles = page.locator('h1, h2, h3, h4, h5, h6').filter({ hasText: /.+/ });
    await expect(widgetTitles.first()).toBeVisible();
    
    // Run accessibility checks
    await checkA11y(page, 'Dashboard - widget cards');
  });

  test('should show quick stats section with stats', async ({ page }) => {
    await page.goto('/');
    
    // Look for stats section - could be numbers, metrics, or data displays
    const statsElements = page.locator('[data-testid*="stat"], [class*="stat"], [class*="metric"]');
    
    // Alternative: look for sections with numbers or percentage signs
    const numberElements = page.locator('text=/\\d+[%]?|\\$\\d+/').first();
    
    await expect(
      statsElements.first().or(numberElements)
    ).toBeVisible({ timeout: 10000 });
    
    // Run accessibility checks
    await checkA11y(page, 'Dashboard - quick stats');
  });
});