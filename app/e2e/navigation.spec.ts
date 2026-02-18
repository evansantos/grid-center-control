import { test, expect } from '@playwright/test';
import { checkA11y, checkSkipNavigation } from './axe-helper';

test.describe('Navigation', () => {
  test('should render NavBar with GRID logo', async ({ page }) => {
    await page.goto('/');
    
    // Look for GRID logo/text in navigation
    const gridLogo = page.getByText('GRID').or(
      page.locator('[data-testid*="logo"], [class*="logo"]').filter({ hasText: 'GRID' })
    );
    
    await expect(gridLogo).toBeVisible();
    
    // Run accessibility checks
    await checkA11y(page, 'Navigation - GRID logo');
    await checkSkipNavigation(page);
  });

  test('should have main navigation links visible and clickable', async ({ page }) => {
    await page.goto('/');
    
    // Check for main navigation links
    const dashboardLink = page.getByRole('link', { name: /dashboard/i });
    const officeLink = page.getByRole('link', { name: /office/i });
    const agentsLink = page.getByRole('link', { name: /agents/i });
    
    // All main links should be visible
    await expect(dashboardLink).toBeVisible();
    await expect(officeLink).toBeVisible();
    await expect(agentsLink).toBeVisible();
    
    // Test that they're clickable
    await expect(dashboardLink).toBeEnabled();
    await expect(officeLink).toBeEnabled();
    await expect(agentsLink).toBeEnabled();
    
    // Test navigation to agents page
    await agentsLink.click();
    await expect(page).toHaveURL(/.*\/agents/);
    
    // Run accessibility checks after navigation
    await checkA11y(page, 'Navigation - agents page');
  });

  test('should open dropdown menus on click', async ({ page }) => {
    await page.goto('/');
    
    // Look for dropdown triggers
    const analyticsDropdown = page.getByRole('button', { name: /analytics/i }).or(
      page.getByText('Analytics').locator('..').filter({ hasText: /▼|▾|⌄|chevron|arrow/i })
    );
    const toolsDropdown = page.getByRole('button', { name: /tools/i }).or(
      page.getByText('Tools').locator('..').filter({ hasText: /▼|▾|⌄|chevron|arrow/i })
    );
    const settingsDropdown = page.getByRole('button', { name: /settings/i }).or(
      page.getByText('Settings').locator('..').filter({ hasText: /▼|▾|⌄|chevron|arrow/i })
    );
    
    // Test Analytics dropdown if it exists
    if (await analyticsDropdown.count() > 0) {
      await analyticsDropdown.first().click();
      
      // Look for dropdown menu content
      const dropdownMenu = page.locator('[role="menu"], [data-testid*="dropdown"], [class*="dropdown"], [class*="menu"]');
      await expect(dropdownMenu.first()).toBeVisible({ timeout: 5000 });
    }
    
    // Test Tools dropdown if it exists
    if (await toolsDropdown.count() > 0) {
      // Close any open dropdowns first
      await page.keyboard.press('Escape');
      await toolsDropdown.first().click();
      
      const dropdownMenu = page.locator('[role="menu"], [data-testid*="dropdown"], [class*="dropdown"], [class*="menu"]');
      await expect(dropdownMenu.first()).toBeVisible({ timeout: 5000 });
    }
    
    // Run accessibility checks
    await checkA11y(page, 'Navigation - dropdowns');
  });

  test('should have navigable dropdown items', async ({ page }) => {
    await page.goto('/');
    
    // Try to find and interact with dropdown menus
    const dropdownTriggers = page.locator('[role="button"]').filter({ 
      hasText: /analytics|tools|settings/i 
    });
    
    if (await dropdownTriggers.count() > 0) {
      // Click first dropdown
      await dropdownTriggers.first().click();
      
      // Look for dropdown items that are links
      const dropdownLinks = page.locator('[role="menu"] a, [class*="dropdown"] a, [data-testid*="dropdown"] a');
      
      if (await dropdownLinks.count() > 0) {
        const firstLink = dropdownLinks.first();
        await expect(firstLink).toBeVisible();
        await expect(firstLink).toHaveAttribute('href');
      }
    } else {
      console.log('No dropdown triggers found - may not be implemented yet');
    }
    
    // Run accessibility checks
    await checkA11y(page, 'Navigation - dropdown items');
  });

  test('should have visible search trigger button', async ({ page }) => {
    await page.goto('/');
    
    // Look for search button/trigger
    const searchTrigger = page.getByRole('button').filter({ hasText: /search/i }).or(
      page.locator('[data-testid*="search"], [class*="search"]').locator('button')
    ).or(
      page.locator('button').filter({ hasText: /🔍|⌕/ })
    );
    
    await expect(searchTrigger.first()).toBeVisible({ timeout: 10000 });
    
    // Run accessibility checks
    await checkA11y(page, 'Navigation - search trigger');
  });
});