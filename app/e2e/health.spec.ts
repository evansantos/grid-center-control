import { test, expect } from '@playwright/test';

test.describe('System Health Page', () => {
  test('should load successfully with System Health heading', async ({ page }) => {
    await page.goto('/health');
    await expect(page.getByText('System Health')).toBeVisible();
  });

  test('should render health status circle', async ({ page }) => {
    await page.goto('/health');
    
    // Look for health status circle/indicator
    const healthCircle = page.locator('[data-testid*="health-status"], [class*="health-status"], [class*="status-circle"]').or(
      page.locator('circle, [role="img"]').filter({ hasText: /health|status/i })
    ).or(
      page.locator('[class*="circle"], [class*="indicator"], [class*="badge"]')
    );
    
    await expect(healthCircle.first()).toBeVisible({ timeout: 10000 });
  });

  test('should render individual health checks', async ({ page }) => {
    await page.goto('/health');
    
    // Look for individual health check items
    const healthChecks = page.locator('[data-testid*="health-check"], [class*="health-check"], [class*="check-item"]').or(
      page.locator('li, [role="listitem"]').filter({ hasText: /check|status|health/i })
    ).or(
      // Look for common health check patterns
      page.locator('text=/database|api|service|connection|memory|cpu|disk/i').locator('..')
    );
    
    await expect(healthChecks.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have clickable refresh button', async ({ page }) => {
    await page.goto('/health');
    
    // Look for refresh button
    const refreshButton = page.getByRole('button', { name: /refresh/i }).or(
      page.getByRole('button').filter({ hasText: /🔄|↻|⟲/ })
    ).or(
      page.locator('[data-testid*="refresh"], [class*="refresh"]').locator('button')
    );
    
    await expect(refreshButton.first()).toBeVisible();
    await expect(refreshButton.first()).toBeEnabled();
    
    // Test that it's clickable
    await refreshButton.first().click();
  });
});