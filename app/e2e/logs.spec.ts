import { test, expect } from '@playwright/test';
import { checkA11y } from './axe-helper';

test.describe('Log Search Page', () => {
  test('should load successfully with Log Search heading', async ({ page }) => {
    await page.goto('/logs');
    await expect(page.getByText('Log Search')).toBeVisible();
  });

  test('should render search component', async ({ page }) => {
    await page.goto('/logs');
    
    // Look for search input field
    const searchInput = page.getByRole('textbox').or(
      page.locator('input[type="text"], input[type="search"]')
    ).or(
      page.locator('[data-testid*="search"], [class*="search"]').locator('input')
    );
    
    await expect(searchInput.first()).toBeVisible({ timeout: 10000 });
    
    // Also look for search button if it exists
    const searchButton = page.getByRole('button', { name: /search/i }).or(
      page.locator('[data-testid*="search-button"], [class*="search-button"]')
    );
    
    // Search button might not exist if it's a live search, so we don't require it
    // but if it exists, it should be visible
    if (await searchButton.count() > 0) {
      await expect(searchButton.first()).toBeVisible();
    }
  });

  test('should allow typing in search field', async ({ page }) => {
    await page.goto('/logs');
    
    const searchInput = page.getByRole('textbox').or(
      page.locator('input[type="text"], input[type="search"]')
    ).first();
    
    await expect(searchInput).toBeVisible();
    
    // Test that we can type in the search field
    await searchInput.fill('test query');
    await expect(searchInput).toHaveValue('test query');
  });
});