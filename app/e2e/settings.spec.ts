import { test, expect } from '@playwright/test';
import { checkA11y } from './axe-helper';

test.describe('Settings Page', () => {
  test('should load successfully with Settings heading', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByText('Settings')).toBeVisible();
  });

  test('should render card with placeholder text', async ({ page }) => {
    await page.goto('/settings');
    
    // Look for card component
    const settingsCard = page.locator('[data-testid*="card"], [class*="card"], [class*="panel"]').or(
      page.locator('div').filter({ hasText: /settings|configuration|placeholder/i })
    );
    
    await expect(settingsCard.first()).toBeVisible({ timeout: 10000 });
    
    // Look for placeholder text within the card
    const placeholderText = page.getByText(/placeholder|coming soon|under construction|not implemented/i).or(
      page.locator('[data-testid*="placeholder"], [class*="placeholder"]')
    );
    
    await expect(placeholderText.first()).toBeVisible();
  });

  test('should have proper page structure', async ({ page }) => {
    await page.goto('/settings');
    
    // Ensure the page has loaded completely
    await page.waitForLoadState('networkidle');
    
    // The page should have the main settings heading
    await expect(page.getByText('Settings')).toBeVisible();
    
    // And should have some content (card or main content area)
    const mainContent = page.locator('main, [role="main"], .main-content').or(
      page.locator('[data-testid*="content"], [class*="content"]')
    );
    
    await expect(mainContent.first()).toBeVisible();
  });
});