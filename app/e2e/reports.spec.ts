import { test, expect } from '@playwright/test';

test.describe('Reports Page', () => {
  const mockReportData = {
    period: {
      range: 'week',
      startDate: '2024-01-01',
      endDate: '2024-01-07',
    },
    summary: {
      totalEvents: 150,
      tasksCompleted: 45,
      activeProjects: 8,
      generatedAt: '2024-01-07T10:00:00Z',
    },
    timeline: [
      { date: '2024-01-01', events: 20 },
      { date: '2024-01-02', events: 25 },
      { date: '2024-01-03', events: 30 },
      { date: '2024-01-04', events: 15 },
      { date: '2024-01-05', events: 35 },
      { date: '2024-01-06', events: 25 },
    ],
    tasks: {
      completed: 45,
      pending: 12,
      failed: 3,
    },
    agents: [
      { agent: 'main-agent', events: 80 },
      { agent: 'backup-agent', events: 45 },
      { agent: 'scheduler-agent', events: 25 },
    ],
    projects: [
      { name: 'Project Alpha', phase: 'development', status: 'active' },
      { name: 'Project Beta', phase: 'testing', status: 'active' },
      { name: 'Project Gamma', phase: 'deployment', status: 'completed' },
    ],
  };

  test.beforeEach(async ({ page }) => {
    // Mock the reports API
    await page.route('/api/reports*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockReportData),
      });
    });

    await page.goto('/reports');
  });

  test('should display page header and report configuration', async ({ page }) => {
    // Check page header
    await expect(page.getByText('📊 Reports & Analytics')).toBeVisible();
    await expect(page.getByText('Generate comprehensive activity reports with visualizations and export options')).toBeVisible();

    // Check report configuration section
    await expect(page.getByText('Report Configuration')).toBeVisible();
    await expect(page.getByText('Date Range')).toBeVisible();
  });

  test('should display executive summary with stat cards', async ({ page }) => {
    // Check executive summary section
    await expect(page.getByText('Executive Summary')).toBeVisible();

    // Check stat cards
    await expect(page.getByText('Total Events')).toBeVisible();
    await expect(page.getByText('150')).toBeVisible();
    
    await expect(page.getByText('Tasks Completed')).toBeVisible();
    await expect(page.getByText('45')).toBeVisible();
    
    await expect(page.getByText('Active Projects')).toBeVisible();
    await expect(page.getByText('8')).toBeVisible();

    // Check report period
    await expect(page.getByText('Report period: 2024-01-01 to 2024-01-07')).toBeVisible();
  });

  test('should display activity timeline chart', async ({ page }) => {
    // Check timeline section
    await expect(page.getByText('Activity Timeline')).toBeVisible();
    
    // The chart should be rendered (we can't easily test SVG content in e2e)
    // but we can check that the chart container exists
    const chartContainer = page.locator('canvas, svg').first();
    await expect(chartContainer).toBeVisible();
  });

  test('should display task completion breakdown', async ({ page }) => {
    // Check task completion section
    await expect(page.getByText('Task Completion')).toBeVisible();
    
    // Check task counts
    await expect(page.getByText('Completed')).toBeVisible();
    await expect(page.getByText('45')).toBeVisible();
    
    await expect(page.getByText('Pending')).toBeVisible();
    await expect(page.getByText('12')).toBeVisible();
    
    await expect(page.getByText('Failed')).toBeVisible();
    await expect(page.getByText('3')).toBeVisible();

    // Check progress bar exists
    const progressBar = page.locator('.bg-green-500, .bg-yellow-500, .bg-red-500').first();
    await expect(progressBar).toBeVisible();
  });

  test('should display agent activity section', async ({ page }) => {
    // Check agent activity section
    await expect(page.getByText('Agent Activity')).toBeVisible();
    
    // Check agent names and event counts
    await expect(page.getByText('main-agent')).toBeVisible();
    await expect(page.getByText('80')).toBeVisible();
    
    await expect(page.getByText('backup-agent')).toBeVisible();
    await expect(page.getByText('45')).toBeVisible();
    
    await expect(page.getByText('scheduler-agent')).toBeVisible();
    await expect(page.getByText('25')).toBeVisible();
  });

  test('should display project status section', async ({ page }) => {
    // Check project status section
    await expect(page.getByText('Project Status')).toBeVisible();
    
    // Check project details
    await expect(page.getByText('Project Alpha')).toBeVisible();
    await expect(page.getByText('development')).toBeVisible();
    
    await expect(page.getByText('Project Beta')).toBeVisible();
    await expect(page.getByText('testing')).toBeVisible();
    
    await expect(page.getByText('Project Gamma')).toBeVisible();
    await expect(page.getByText('deployment')).toBeVisible();
    await expect(page.getByText('completed')).toBeVisible();
  });

  test('should support date range selection', async ({ page }) => {
    // Test date range selector
    await page.getByLabel('Date Range').click();
    
    // Should see options
    await expect(page.getByText('This Week')).toBeVisible();
    await expect(page.getByText('This Month')).toBeVisible();
    await expect(page.getByText('Custom Range')).toBeVisible();
    
    // Select month
    await page.getByText('This Month').click();
    
    // Should trigger new API call (we can verify by checking network requests)
  });

  test('should support custom date range', async ({ page }) => {
    // Select custom range
    await page.getByLabel('Date Range').click();
    await page.getByText('Custom Range').click();
    
    // Should show date inputs
    await expect(page.getByLabel('From')).toBeVisible();
    await expect(page.getByLabel('To')).toBeVisible();
    
    // Fill custom dates
    await page.getByLabel('From').fill('2024-01-01');
    await page.getByLabel('To').fill('2024-01-31');
    
    // Should trigger API call with custom dates
  });

  test('should support export functionality', async ({ page }) => {
    // Check export buttons
    await expect(page.getByRole('button', { name: /copy markdown/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /export csv/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /export json/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /print/i })).toBeVisible();
  });

  test('should handle CSV export', async ({ page }) => {
    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download');
    
    // Click CSV export
    await page.getByRole('button', { name: /export csv/i }).click();
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/activity-report.*\.csv$/);
  });

  test('should handle JSON export', async ({ page }) => {
    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download');
    
    // Click JSON export
    await page.getByRole('button', { name: /export json/i }).click();
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/activity-report.*\.json$/);
  });

  test('should handle markdown copy', async ({ page }) => {
    // Mock clipboard API
    await page.addInitScript(() => {
      let clipboardText = '';
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: (text: string) => {
            clipboardText = text;
            return Promise.resolve();
          },
          readText: () => Promise.resolve(clipboardText),
        },
      });
    });

    // Click markdown copy
    await page.getByRole('button', { name: /copy markdown/i }).click();
    
    // Should show some feedback (like alert or toast)
    // This depends on implementation - could be a toast notification
  });

  test('should handle print functionality', async ({ page }) => {
    // Mock window.print
    await page.addInitScript(() => {
      window.print = () => console.log('Print called');
    });

    // Click print button
    await page.getByRole('button', { name: /print/i }).click();
    
    // Print function should be called
    // We can't easily verify this in e2e, but the button should be clickable
  });

  test('should show loading state', async ({ page }) => {
    // Mock slow response
    await page.route('/api/reports*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockReportData),
      });
    });

    await page.reload();

    // Should show loading skeletons
    await expect(page.locator('[data-testid*="skeleton"]')).toBeVisible();
    
    // Wait for loading to complete
    await expect(page.getByText('Executive Summary')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock error response
    await page.route('/api/reports*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    await page.reload();

    // Should still render page structure
    await expect(page.getByText('📊 Reports & Analytics')).toBeVisible();
    await expect(page.getByText('Report Configuration')).toBeVisible();
    
    // Should handle error gracefully (might show empty state or error message)
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Page should still be usable
    await expect(page.getByText('📊 Reports & Analytics')).toBeVisible();
    await expect(page.getByText('Executive Summary')).toBeVisible();
    
    // Stat cards should stack vertically on mobile
    // (Grid should change from 3 columns to 1 column)
  });

  test('should update report when date range changes', async ({ page }) => {
    let requestCount = 0;
    
    // Mock API with counter
    await page.route('/api/reports*', async (route) => {
      requestCount++;
      const modifiedData = {
        ...mockReportData,
        summary: {
          ...mockReportData.summary,
          totalEvents: 150 + requestCount * 10,
        },
      };
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(modifiedData),
      });
    });

    await page.reload();
    
    // Initial load
    await expect(page.getByText('150')).toBeVisible();
    
    // Change date range
    await page.getByLabel('Date Range').click();
    await page.getByText('This Month').click();
    
    // Should update with new data
    await expect(page.getByText('160')).toBeVisible();
  });

  test('should maintain form state during report generation', async ({ page }) => {
    // Select custom range
    await page.getByLabel('Date Range').click();
    await page.getByText('Custom Range').click();
    
    // Fill dates
    await page.getByLabel('From').fill('2024-01-15');
    await page.getByLabel('To').fill('2024-01-20');
    
    // Values should persist
    await expect(page.getByLabel('From')).toHaveValue('2024-01-15');
    await expect(page.getByLabel('To')).toHaveValue('2024-01-20');
    
    // Even after report updates
    await page.waitForTimeout(100);
    await expect(page.getByLabel('From')).toHaveValue('2024-01-15');
    await expect(page.getByLabel('To')).toHaveValue('2024-01-20');
  });
});