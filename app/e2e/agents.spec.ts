import { test, expect } from '@playwright/test';

test.describe('Agents Page', () => {
  test('should load successfully with Agents heading', async ({ page }) => {
    await page.goto('/agents');
    await expect(page.getByText('Agents')).toBeVisible();
  });

  test('should render agent cards or loading/empty state', async ({ page }) => {
    await page.goto('/agents');
    
    // Check for agent cards or empty/loading state
    const agentCards = page.locator('[data-testid*="agent"], [class*="agent"], [class*="card"]');
    const emptyState = page.getByText(/no agents|empty|loading/i);
    const loadingState = page.locator('[data-testid="loading"], .loading, [role="progressbar"]');
    
    // At least one of these should be visible
    await expect(
      agentCards.first().or(emptyState.first()).or(loadingState.first())
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show status dots on agent cards when agents exist', async ({ page }) => {
    await page.goto('/agents');
    
    // Wait a bit for potential agent data to load
    await page.waitForTimeout(2000);
    
    // Look for agent cards first
    const agentCards = page.locator('[data-testid*="agent"], [class*="agent"], [class*="card"]');
    const cardCount = await agentCards.count();
    
    if (cardCount > 0) {
      // If there are agent cards, look for status indicators
      const statusDots = page.locator('[data-testid*="status"], [class*="status"], [class*="dot"], .status-indicator');
      await expect(statusDots.first()).toBeVisible();
    } else {
      // If no cards, that's also acceptable (empty state)
      console.log('No agent cards found - testing empty state scenario');
    }
  });

  test('should have configure buttons that are links when agents exist', async ({ page }) => {
    await page.goto('/agents');
    
    // Wait a bit for potential agent data to load
    await page.waitForTimeout(2000);
    
    // Look for configure buttons
    const configureButtons = page.getByRole('button', { name: /configure/i }).or(
      page.getByRole('link', { name: /configure/i })
    );
    
    const buttonCount = await configureButtons.count();
    
    if (buttonCount > 0) {
      // Test that configure buttons are clickable/navigable
      const firstButton = configureButtons.first();
      await expect(firstButton).toBeVisible();
      await expect(firstButton).toBeEnabled();
      
      // If it's a link, check it has an href
      const isLink = await firstButton.evaluate(el => el.tagName.toLowerCase() === 'a');
      if (isLink) {
        await expect(firstButton).toHaveAttribute('href');
      }
    } else {
      console.log('No configure buttons found - testing empty state scenario');
    }
  });
});