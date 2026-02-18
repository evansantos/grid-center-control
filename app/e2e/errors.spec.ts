import { test, expect } from '@playwright/test';
import { checkA11y } from './axe-helper';

test.describe('Errors Page', () => {
  test('should load successfully with breadcrumb navigation', async ({ page }) => {
    await page.goto('/errors');
    
    // Look for breadcrumb navigation
    const breadcrumb = page.locator('[data-testid*="breadcrumb"], [class*="breadcrumb"], nav[aria-label*="breadcrumb"]').or(
      page.locator('nav').filter({ hasText: /home|dashboard|errors/i })
    );
    
    await expect(breadcrumb.first()).toBeVisible({ timeout: 10000 });
  });

  test('should render error dashboard component', async ({ page }) => {
    await page.goto('/errors');
    
    // Look for error dashboard content
    const errorDashboard = page.locator('[data-testid*="error-dashboard"], [class*="error-dashboard"], [class*="dashboard"]').or(
      page.locator('text=/error|dashboard/i').locator('..')
    ).or(
      // Look for typical error dashboard elements
      page.locator('[class*="chart"], [class*="graph"], [class*="metric"], [class*="stat"]')
    );
    
    await expect(errorDashboard.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have breadcrumb Dashboard link pointing to /', async ({ page }) => {
    await page.goto('/errors');
    
    // Look for Dashboard link in breadcrumb
    const dashboardBreadcrumbLink = page.getByRole('link', { name: /dashboard/i }).or(
      page.locator('[data-testid*="breadcrumb"], [class*="breadcrumb"]').getByRole('link', { name: /dashboard/i })
    ).or(
      page.locator('nav').getByRole('link', { name: /dashboard|home/i })
    );
    
    await expect(dashboardBreadcrumbLink.first()).toBeVisible();
    await expect(dashboardBreadcrumbLink.first()).toHaveAttribute('href', '/');
  });

  test('should be able to navigate back to dashboard via breadcrumb', async ({ page }) => {
    await page.goto('/errors');
    
    const dashboardLink = page.getByRole('link', { name: /dashboard|home/i }).first();
    await expect(dashboardLink).toBeVisible();
    
    // Click the breadcrumb link
    await dashboardLink.click();
    
    // Should navigate to dashboard
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Mission Control')).toBeVisible();
  });
});