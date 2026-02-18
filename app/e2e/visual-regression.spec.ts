import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  // Configure viewport for consistent screenshots
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport size
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Mock APIs for consistent visual states
    await page.route('**/api/kanban', async route => {
      const mockData = {
        columns: {
          pending: [
            {
              id: '1',
              title: 'Visual Test Task',
              agent: 'GRID',
              priority: 'high',
              status: 'pending',
            },
          ],
          in_progress: [
            {
              id: '2',
              title: 'In Progress Task',
              agent: 'ATLAS',
              priority: 'medium',
              status: 'in_progress',
            },
          ],
          review: [],
          done: [
            {
              id: '3',
              title: 'Completed Task',
              agent: 'DEV',
              priority: 'low',
              status: 'done',
            },
          ],
        },
      };
      await route.fulfill({ json: mockData });
    });

    await page.route('**/api/analytics/performance', async route => {
      const mockData = {
        overview: {
          activeAgents: 4,
          totalTasks: 100,
          avgResponseTime: 250,
          successRate: 96,
        },
        agents: [
          {
            id: '1',
            name: 'GRID',
            tasks_completed: 25,
            avg_response_time: 200,
            success_rate: 98,
            status: 'active',
          },
        ],
      };
      await route.fulfill({ json: mockData });
    });

    await page.route('**/api/office/agents', async route => {
      const mockData = {
        agents: [
          {
            id: 'grid',
            name: 'GRID',
            position: { x: 150, y: 200, z: 0 },
            status: 'active',
            currentTask: 'Processing data',
          },
          {
            id: 'atlas',
            name: 'ATLAS',
            position: { x: 300, y: 150, z: 0 },
            status: 'idle',
            currentTask: null,
          },
        ],
        office: {
          layout: 'open_plan',
          dimensions: { width: 500, height: 400 },
        },
      };
      await route.fulfill({ json: mockData });
    });

    // Disable animations for consistent screenshots
    await page.addInitScript(() => {
      // Disable CSS animations and transitions
      const style = document.createElement('style');
      style.innerHTML = `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `;
      document.head.appendChild(style);
    });
  });

  test('Home page - Office isometric view', async ({ page }) => {
    await page.goto('/');
    
    // Wait for content to load
    await expect(page.locator('h1:has-text("Mission Control")')).toBeVisible();
    await page.waitForTimeout(2000); // Allow office view to render
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('home-office-view.png');
    
    // Take screenshot of just the office area
    const officeContainer = page.locator('[data-testid="office-view"], [data-testid="isometric-view"], canvas, svg').first();
    if (await officeContainer.isVisible()) {
      await expect(officeContainer).toHaveScreenshot('office-isometric-container.png');
    }
  });

  test('Kanban board - All views', async ({ page }) => {
    await page.goto('/kanban');
    
    // Wait for board to load
    await expect(page.locator('text=▥ KANBAN')).toBeVisible();
    await expect(page.locator('text=Visual Test Task')).toBeVisible();
    
    // Full page screenshot
    await expect(page).toHaveScreenshot('kanban-board-full.png');
    
    // Screenshot of just the board area
    const boardContainer = page.locator('[role="application"], [data-testid="kanban-board"]').first();
    if (await boardContainer.isVisible()) {
      await expect(boardContainer).toHaveScreenshot('kanban-board-container.png');
    }

    // Test different priority badges
    const highPriorityTask = page.locator('text=Visual Test Task').locator('..');
    if (await highPriorityTask.isVisible()) {
      await expect(highPriorityTask).toHaveScreenshot('kanban-task-high-priority.png');
    }

    // Test empty column
    const reviewColumn = page.locator('text=Review').locator('..');
    if (await reviewColumn.isVisible()) {
      await expect(reviewColumn).toHaveScreenshot('kanban-empty-column.png');
    }
  });

  test('Analytics - Performance page', async ({ page }) => {
    await page.goto('/analytics/performance');
    
    // Wait for data to load
    await expect(page.locator('h1:has-text("Performance Analytics")')).toBeVisible();
    await page.waitForTimeout(1000);
    
    // Full page screenshot
    await expect(page).toHaveScreenshot('analytics-performance.png');
    
    // KPI cards section
    const kpiSection = page.locator('[class*="grid"], [class*="stats"]').first();
    if (await kpiSection.isVisible()) {
      await expect(kpiSection).toHaveScreenshot('analytics-kpi-cards.png');
    }

    // Agent performance table
    const agentTable = page.locator('table, [data-testid*="table"], [class*="table"]').first();
    if (await agentTable.isVisible()) {
      await expect(agentTable).toHaveScreenshot('analytics-agent-table.png');
    }
  });

  test('Analytics - Sessions page', async ({ page }) => {
    await page.route('**/api/analytics/sessions', async route => {
      const mockData = {
        overview: {
          totalSessions: 50,
          activeSessions: 8,
          avgDuration: 1800,
        },
        sessions: [
          {
            sessionKey: 'sess-visual-test',
            agentId: 'GRID',
            messageCount: 25,
            status: 'active',
          },
        ],
      };
      await route.fulfill({ json: mockData });
    });

    await page.goto('/analytics/sessions');
    
    await expect(page.locator('h1:has-text("Session Analytics")')).toBeVisible();
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('analytics-sessions.png');

    // Test filter buttons
    const filterButtons = page.locator('button:has-text("active"), button:has-text("completed")');
    if (await filterButtons.first().isVisible()) {
      await expect(filterButtons.first().locator('..')).toHaveScreenshot('analytics-session-filters.png');
    }
  });

  test('Analytics - Token usage page', async ({ page }) => {
    await page.route('**/api/analytics/tokens**', async route => {
      const mockData = {
        overview: {
          totalTokens: 250000,
          totalCost: 75.50,
          totalRequests: 500,
        },
        models: [
          {
            model: 'anthropic/claude-sonnet-3.5',
            totalTokens: 200000,
            cost: 65.00,
            requests: 400,
          },
        ],
      };
      await route.fulfill({ json: mockData });
    });

    await page.goto('/analytics/tokens');
    
    await expect(page.locator('h1:has-text("Token Analytics")')).toBeVisible();
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('analytics-tokens.png');

    // Test period selector
    const periodButtons = page.locator('button:has-text("Last 24 Hours"), button:has-text("Last 7 Days")');
    if (await periodButtons.first().isVisible()) {
      await expect(periodButtons.first().locator('..')).toHaveScreenshot('analytics-period-selector.png');
    }
  });

  test('Analytics - Metrics dashboard', async ({ page }) => {
    await page.route('**/api/analytics/metrics', async route => {
      const mockData = {
        metrics: {
          performance: {
            uptime: 345600,
            responseTime: 180,
            throughput: 65,
            errorRate: 1.5,
          },
          resources: {
            memoryUsage: 45,
            cpuUsage: 30,
            diskUsage: 65,
          },
        },
        alerts: [
          {
            id: 'alert-1',
            type: 'warning',
            message: 'Disk usage at 65%',
            timestamp: '2024-02-18T21:00:00Z',
          },
        ],
      };
      await route.fulfill({ json: mockData });
    });

    await page.goto('/analytics/metrics');
    
    await expect(page.locator('h1:has-text("Metrics Dashboard")')).toBeVisible();
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('analytics-metrics.png');

    // Alert section
    const alertSection = page.locator('text=🚨 Active Alerts').locator('..');
    if (await alertSection.isVisible()) {
      await expect(alertSection).toHaveScreenshot('metrics-alerts-section.png');
    }
  });

  test('Analytics - Timeline visualization', async ({ page }) => {
    await page.route('**/api/analytics/timeline**', async route => {
      const mockData = {
        sessions: [
          {
            key: 'sess-timeline-1',
            agentId: 'GRID',
            date: '2024-02-18T20:00:00Z',
            messageCount: 30,
            duration: 3600,
          },
        ],
        overview: {
          totalEvents: 500,
          activeSessions: 2,
        },
      };
      await route.fulfill({ json: mockData });
    });

    await page.goto('/analytics/timeline');
    
    await expect(page.locator('h1:has-text("Session Timeline")')).toBeVisible();
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('analytics-timeline.png');
  });

  test('Calendar - Month view', async ({ page }) => {
    await page.route('**/api/calendar/events**', async route => {
      const mockEvents = {
        events: [
          {
            id: '1',
            title: 'Team Meeting',
            start: '2024-02-18T10:00:00Z',
            end: '2024-02-18T11:00:00Z',
            type: 'meeting',
          },
          {
            id: '2',
            title: 'Code Review',
            start: '2024-02-19T14:00:00Z',
            end: '2024-02-19T15:00:00Z',
            type: 'planning',
          },
        ],
      };
      await route.fulfill({ json: mockEvents });
    });

    await page.goto('/calendar');
    
    await expect(page.locator('h1:has-text("📅 Calendar")')).toBeVisible();
    await page.waitForTimeout(1000);
    
    // Month view (default)
    await expect(page).toHaveScreenshot('calendar-month-view.png');
    
    // Calendar container only
    const calendarContainer = page.locator('[data-testid="calendar-container"], [class*="calendar"]').first();
    if (await calendarContainer.isVisible()) {
      await expect(calendarContainer).toHaveScreenshot('calendar-month-container.png');
    }
  });

  test('Calendar - Week view', async ({ page }) => {
    await page.route('**/api/calendar/events**', async route => {
      const mockEvents = { events: [] };
      await route.fulfill({ json: mockEvents });
    });

    await page.goto('/calendar');
    
    await expect(page.locator('h1:has-text("📅 Calendar")')).toBeVisible();
    
    // Switch to week view
    const weekButton = page.locator('button:has-text("Week")');
    if (await weekButton.isVisible()) {
      await weekButton.click();
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('calendar-week-view.png');
    }
  });

  test('Calendar - Day view', async ({ page }) => {
    await page.route('**/api/calendar/events**', async route => {
      const mockEvents = { events: [] };
      await route.fulfill({ json: mockEvents });
    });

    await page.goto('/calendar');
    
    await expect(page.locator('h1:has-text("📅 Calendar")')).toBeVisible();
    
    // Switch to day view
    const dayButton = page.locator('button:has-text("Day")');
    if (await dayButton.isVisible()) {
      await dayButton.click();
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('calendar-day-view.png');
    }
  });

  test('Workflows - Canvas view', async ({ page }) => {
    await page.route('**/api/workflows**', async route => {
      const mockWorkflow = {
        id: 'workflow-visual',
        name: 'Visual Test Workflow',
        nodes: [
          {
            id: 'node-1',
            type: 'input',
            label: 'Start',
            position: { x: 100, y: 100 },
          },
          {
            id: 'node-2',
            type: 'process',
            label: 'Process',
            position: { x: 300, y: 100 },
          },
          {
            id: 'node-3',
            type: 'output',
            label: 'End',
            position: { x: 500, y: 100 },
          },
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'node-1',
            target: 'node-2',
          },
          {
            id: 'edge-2',
            source: 'node-2',
            target: 'node-3',
          },
        ],
      };
      await route.fulfill({ json: mockWorkflow });
    });

    await page.goto('/workflows');
    
    await expect(page.locator('h1:has-text("🔄 Workflows")')).toBeVisible();
    await page.waitForTimeout(1500); // Allow canvas to render
    
    await expect(page).toHaveScreenshot('workflows-canvas.png');
    
    // Canvas area only
    const canvas = page.locator('[data-testid="workflow-canvas"], [class*="canvas"]').first();
    if (await canvas.isVisible()) {
      await expect(canvas).toHaveScreenshot('workflows-canvas-area.png');
    }
  });

  test('Spawn - Form page', async ({ page }) => {
    await page.goto('/spawn');
    
    await expect(page.locator('h1:has-text("Spawn"), h1:has-text("🚀")').first()).toBeVisible();
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('spawn-form.png');
    
    // Form container
    const form = page.locator('form, [data-testid="spawn-form"]').first();
    if (await form.isVisible()) {
      await expect(form).toHaveScreenshot('spawn-form-container.png');
    }
  });

  test('Reports - Export page', async ({ page }) => {
    await page.route('**/api/reports**', async route => {
      const mockData = {
        reports: [
          {
            id: 'report-1',
            name: 'Performance Report',
            type: 'performance',
            lastGenerated: '2024-02-18T20:00:00Z',
          },
        ],
      };
      await route.fulfill({ json: mockData });
    });

    await page.goto('/reports');
    
    await expect(page.locator('h1:has-text("Reports"), h1:has-text("📊")').first()).toBeVisible();
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('reports-page.png');
  });

  test('Subagents - Tree view', async ({ page }) => {
    await page.route('**/api/subagents**', async route => {
      const mockData = {
        agents: [
          {
            id: 'main-agent',
            name: 'Main Agent',
            status: 'active',
            children: [
              {
                id: 'sub-1',
                name: 'Analytics Sub-agent',
                status: 'running',
                task: 'Processing analytics',
              },
            ],
          },
        ],
      };
      await route.fulfill({ json: mockData });
    });

    await page.goto('/subagents');
    
    await expect(page.locator('h1:has-text("Subagents"), h1:has-text("🌳")').first()).toBeVisible();
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('subagents-tree.png');
    
    // Tree container
    const treeContainer = page.locator('[data-testid="agent-tree"], [class*="tree"]').first();
    if (await treeContainer.isVisible()) {
      await expect(treeContainer).toHaveScreenshot('subagents-tree-container.png');
    }
  });

  test('Mobile viewport - Home page', async ({ page }) => {
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await expect(page.locator('h1:has-text("Mission Control")')).toBeVisible();
    await page.waitForTimeout(1500);
    
    await expect(page).toHaveScreenshot('mobile-home.png');
  });

  test('Mobile viewport - Kanban board', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/kanban');
    await expect(page.locator('text=▥ KANBAN')).toBeVisible();
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('mobile-kanban.png');
  });

  test('Mobile viewport - Analytics', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/analytics/performance');
    await expect(page.locator('h1:has-text("Performance Analytics")')).toBeVisible();
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('mobile-analytics.png');
  });

  test('Tablet viewport - Calendar', async ({ page }) => {
    // Tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/calendar');
    await expect(page.locator('h1:has-text("📅 Calendar")')).toBeVisible();
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('tablet-calendar.png');
  });

  test('Dark theme variations (if supported)', async ({ page }) => {
    // Check if dark mode toggle exists
    const darkModeToggle = page.locator('button[aria-label*="dark"], button[aria-label*="theme"], [data-testid="theme-toggle"]');
    
    if (await darkModeToggle.isVisible()) {
      // Switch to dark mode
      await darkModeToggle.click();
      await page.waitForTimeout(500);
      
      // Take dark mode screenshots
      await page.goto('/');
      await expect(page.locator('h1:has-text("Mission Control")')).toBeVisible();
      await page.waitForTimeout(1500);
      await expect(page).toHaveScreenshot('dark-mode-home.png');
      
      await page.goto('/kanban');
      await expect(page.locator('text=▥ KANBAN')).toBeVisible();
      await page.waitForTimeout(1000);
      await expect(page).toHaveScreenshot('dark-mode-kanban.png');
    }
  });

  test('Error states - 404 page', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // Wait for 404 page to load
    await page.waitForTimeout(1000);
    
    // Check for 404 content
    const notFound = page.locator('text=404, text=Not Found, text=Page not found');
    if (await notFound.first().isVisible()) {
      await expect(page).toHaveScreenshot('error-404.png');
    }
  });

  test('Loading states', async ({ page }) => {
    // Add artificial delay to capture loading state
    await page.route('**/api/kanban', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto('/kanban');
    
    // Capture loading state before data arrives
    const loadingIndicator = page.locator('text=Loading, [class*="loading"], [class*="spinner"]');
    if (await loadingIndicator.first().isVisible()) {
      await expect(page).toHaveScreenshot('loading-state.png');
    }
  });
});