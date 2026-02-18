import { test, expect } from '@playwright/test';

test.describe('Kanban Board E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the API response for consistent testing
    await page.route('**/api/kanban', async route => {
      const mockData = {
        columns: {
          pending: [
            {
              id: '1',
              title: 'Design System Migration',
              agent: 'GRID',
              priority: 'high',
              status: 'pending',
            },
            {
              id: '2',
              title: 'Analytics Dashboard',
              agent: 'ATLAS',
              priority: 'medium',
              status: 'pending',
            },
          ],
          in_progress: [
            {
              id: '3',
              title: 'Bug Fixes',
              agent: 'DEV',
              priority: 'critical',
              status: 'in_progress',
            },
          ],
          review: [],
          done: [
            {
              id: '4',
              title: 'Documentation Update',
              agent: 'PIXEL',
              priority: 'low',
              status: 'done',
            },
          ],
        },
      };
      await route.fulfill({ json: mockData });
    });

    await page.goto('/kanban');
  });

  test('loads and displays kanban board correctly', async ({ page }) => {
    // Wait for the board to load
    await expect(page.locator('text=▥ KANBAN')).toBeVisible();

    // Check all columns are visible
    await expect(page.locator('text=Pending')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
    await expect(page.locator('text=Review')).toBeVisible();
    await expect(page.locator('text=Done')).toBeVisible();

    // Check tasks are visible
    await expect(page.locator('text=Design System Migration')).toBeVisible();
    await expect(page.locator('text=Analytics Dashboard')).toBeVisible();
    await expect(page.locator('text=Bug Fixes')).toBeVisible();
    await expect(page.locator('text=Documentation Update')).toBeVisible();
  });

  test('displays correct task counts in column badges', async ({ page }) => {
    // Check badge counts
    const pendingColumn = page.locator('text=Pending').locator('..');
    await expect(pendingColumn.locator('text=2')).toBeVisible();

    const progressColumn = page.locator('text=In Progress').locator('..');
    await expect(progressColumn.locator('text=1')).toBeVisible();

    const reviewColumn = page.locator('text=Review').locator('..');
    await expect(reviewColumn.locator('text=0')).toBeVisible();

    const doneColumn = page.locator('text=Done').locator('..');
    await expect(doneColumn.locator('text=1')).toBeVisible();
  });

  test('shows priority badges with correct styling', async ({ page }) => {
    // Check that priority badges are visible and styled
    await expect(page.locator('text=HIGH')).toBeVisible();
    await expect(page.locator('text=MEDIUM')).toBeVisible();
    await expect(page.locator('text=CRITICAL')).toBeVisible();
    await expect(page.locator('text=LOW')).toBeVisible();
  });

  test('displays agent initials correctly', async ({ page }) => {
    // Check agent initials are visible
    await expect(page.locator('[title="GRID"]')).toBeVisible();
    await expect(page.locator('[title="ATLAS"]')).toBeVisible();
    await expect(page.locator('[title="DEV"]')).toBeVisible();
    await expect(page.locator('[title="PIXEL"]')).toBeVisible();
  });

  test('refresh button works correctly', async ({ page }) => {
    // Mock a reload
    let reloadCalled = false;
    await page.addInitScript(() => {
      const originalReload = window.location.reload;
      window.location.reload = () => {
        (window as any).reloadCalled = true;
      };
    });

    // Click refresh button
    await page.click('text=Refresh');

    // Check if reload was triggered
    const wasReloaded = await page.evaluate(() => (window as any).reloadCalled);
    expect(wasReloaded).toBe(true);
  });

  test('task cards are keyboard accessible', async ({ page }) => {
    // Find the first task card
    const taskCard = page.locator('text=Design System Migration').locator('..');

    // Check it's focusable
    await taskCard.focus();
    await expect(taskCard).toBeFocused();

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    // The focus should move to the next focusable element
    // (This could be the next task card or the refresh button)
  });

  test('has proper accessibility attributes', async ({ page }) => {
    // Check main application role
    await expect(page.locator('[role="application"][aria-label="Kanban board"]')).toBeVisible();

    // Check column regions
    await expect(page.locator('[role="region"][aria-label*="Pending column"]')).toBeVisible();
    await expect(page.locator('[role="region"][aria-label*="In Progress column"]')).toBeVisible();
    await expect(page.locator('[role="region"][aria-label*="Review column"]')).toBeVisible();
    await expect(page.locator('[role="region"][aria-label*="Done column"]')).toBeVisible();

    // Check task list items
    await expect(page.locator('[role="listitem"]').first()).toBeVisible();
  });

  test('drag and drop visual feedback', async ({ page }) => {
    // Find a task to drag
    const taskCard = page.locator('text=Design System Migration').locator('..');

    // Start drag - check cursor changes
    await taskCard.hover();
    
    // Check if the card has the grab cursor
    const cursor = await taskCard.evaluate(el => getComputedStyle(el).cursor);
    expect(cursor).toContain('grab');
  });

  test('responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that the board still loads
    await expect(page.locator('text=▥ KANBAN')).toBeVisible();

    // On mobile, the grid should adapt (1 column on small screens)
    const gridContainer = page.locator('[role="application"]').first();
    await expect(gridContainer).toBeVisible();

    // All columns should still be visible but stacked
    await expect(page.locator('text=Pending')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
    await expect(page.locator('text=Review')).toBeVisible();
    await expect(page.locator('text=Done')).toBeVisible();
  });

  test('handles empty columns correctly', async ({ page }) => {
    // Check that empty review column shows 0 count
    const reviewColumn = page.locator('text=Review').locator('..');
    await expect(reviewColumn.locator('text=0')).toBeVisible();

    // The column should still be visible and properly structured
    await expect(reviewColumn).toBeVisible();
  });

  test('drag and drop functionality', async ({ page }) => {
    let moveApiCalled = false;
    
    // Mock the move API
    await page.route('**/api/kanban/move', async route => {
      moveApiCalled = true;
      await route.fulfill({ json: { success: true } });
    });

    // Find source and target
    const taskCard = page.locator('text=Design System Migration').locator('..');
    const targetColumn = page.locator('[role="region"][aria-label*="In Progress column"]');

    // Perform drag and drop
    const taskBoundingBox = await taskCard.boundingBox();
    const targetBoundingBox = await targetColumn.boundingBox();
    
    if (taskBoundingBox && targetBoundingBox) {
      // Start drag from center of task
      await page.mouse.move(
        taskBoundingBox.x + taskBoundingBox.width / 2,
        taskBoundingBox.y + taskBoundingBox.height / 2
      );
      await page.mouse.down();
      
      // Move to target column
      await page.mouse.move(
        targetBoundingBox.x + targetBoundingBox.width / 2,
        targetBoundingBox.y + targetBoundingBox.height / 2
      );
      await page.mouse.up();

      // Wait a bit for the async operation
      await page.waitForTimeout(500);
    }
  });

  test('handles API errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/kanban', async route => {
      await route.abort('failed');
    });

    // Navigate to page
    await page.goto('/kanban');

    // Should still show the basic structure
    await expect(page.locator('text=▥ KANBAN')).toBeVisible();
    
    // Columns should still be there (empty)
    await expect(page.locator('text=Pending')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
  });
});