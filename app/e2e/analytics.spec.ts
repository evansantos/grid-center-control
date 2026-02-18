import { test, expect } from '@playwright/test';
import { checkA11y, checkHeadingHierarchy } from './axe-helper';

test.describe('Analytics Pages E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for consistent testing
    await page.route('**/api/analytics/performance', async route => {
      const mockData = {
        overview: {
          activeAgents: 5,
          totalTasks: 150,
          avgResponseTime: 320,
          successRate: 94,
        },
        agents: [
          {
            id: '1',
            name: 'GRID',
            tasks_completed: 45,
            avg_response_time: 280,
            success_rate: 98,
            status: 'active',
            last_active: '2024-02-18T21:00:00Z',
          },
          {
            id: '2', 
            name: 'ATLAS',
            tasks_completed: 32,
            avg_response_time: 350,
            success_rate: 92,
            status: 'idle',
            last_active: '2024-02-18T20:45:00Z',
          },
        ],
        trends: {
          performance: 'up',
          tasks: 'up',
          responseTime: 'down',
        },
      };
      await route.fulfill({ json: mockData });
    });

    await page.route('**/api/analytics/sessions', async route => {
      const mockData = {
        overview: {
          totalSessions: 89,
          activeSessions: 12,
          avgDuration: 1800,
          totalMessages: 2340,
        },
        sessions: [
          {
            sessionKey: 'sess-abc123def456',
            agentId: 'GRID',
            startTime: '2024-02-18T20:30:00Z',
            messageCount: 45,
            duration: 2100,
            status: 'active',
            channel: 'telegram',
          },
          {
            sessionKey: 'sess-xyz789ghi012',
            agentId: 'ATLAS',
            startTime: '2024-02-18T19:15:00Z',
            endTime: '2024-02-18T20:00:00Z',
            messageCount: 78,
            duration: 2700,
            status: 'completed',
            channel: 'discord',
          },
        ],
        trends: {
          sessions: 'up',
          duration: 'neutral',
          messages: 'up',
        },
      };
      await route.fulfill({ json: mockData });
    });

    await page.route('**/api/analytics/tokens**', async route => {
      const mockData = {
        overview: {
          totalTokens: 450000,
          totalCost: 125.75,
          totalRequests: 890,
          avgCostPerRequest: 0.1413,
        },
        models: [
          {
            model: 'anthropic/claude-sonnet-3.5',
            inputTokens: 320000,
            outputTokens: 100000,
            totalTokens: 420000,
            cost: 115.50,
            requests: 720,
            avgTokensPerRequest: 583,
          },
          {
            model: 'anthropic/claude-haiku-3',
            inputTokens: 20000,
            outputTokens: 10000,
            totalTokens: 30000,
            cost: 10.25,
            requests: 170,
            avgTokensPerRequest: 176,
          },
        ],
        trends: {
          tokens: 'up',
          cost: 'up',
          requests: 'up',
        },
        period: {
          start: '2024-02-17T21:00:00Z',
          end: '2024-02-18T21:00:00Z',
        },
      };
      await route.fulfill({ json: mockData });
    });

    await page.route('**/api/analytics/metrics', async route => {
      const mockData = {
        metrics: {
          performance: {
            uptime: 345600, // 4 days
            responseTime: 185,
            throughput: 67,
            errorRate: 1.2,
          },
          resources: {
            memoryUsage: 54,
            cpuUsage: 38,
            diskUsage: 72,
            networkIO: 2097152, // 2MB
          },
          agents: {
            totalAgents: 6,
            activeAgents: 5,
            idleAgents: 1,
            errorAgents: 0,
          },
          activity: {
            totalSessions: 1890,
            totalMessages: 24500,
            totalTokens: 5600000,
            totalCost: 1250.75,
          },
        },
        alerts: [
          {
            id: 'alert-disk',
            type: 'warning',
            metric: 'Disk Usage',
            message: 'Disk usage is at 72% - consider cleanup',
            timestamp: '2024-02-18T21:15:00Z',
            acknowledged: false,
          },
        ],
        trends: {
          performance: 'up',
          resources: 'neutral',
          activity: 'up',
        },
      };
      await route.fulfill({ json: mockData });
    });
  });

  test('Performance Analytics page loads and displays metrics', async ({ page }) => {
    await page.goto('/analytics/performance');

    // Check page header
    await expect(page.locator('h1:has-text("Performance Analytics")')).toBeVisible();
    await expect(page.locator('text=Real-time agent performance metrics')).toBeVisible();

    // Check KPI cards
    await expect(page.locator('text=Active Agents')).toBeVisible();
    await expect(page.locator('text=5')).toBeVisible(); // Active agents count
    await expect(page.locator('text=Total Tasks')).toBeVisible();
    await expect(page.locator('text=150')).toBeVisible(); // Total tasks

    // Check agent performance table
    await expect(page.locator('text=Agent Performance Details')).toBeVisible();
    await expect(page.locator('text=GRID')).toBeVisible();
    await expect(page.locator('text=ATLAS')).toBeVisible();

    // Check refresh functionality
    const refreshButton = page.locator('text=Refresh');
    await expect(refreshButton).toBeVisible();
    await refreshButton.click();

    // Run accessibility checks
    await checkA11y(page, 'Analytics - Performance page');
    await checkHeadingHierarchy(page);
  });

  test('Session Analytics page displays session data and filters', async ({ page }) => {
    await page.goto('/analytics/sessions');

    // Check page header  
    await expect(page.locator('h1:has-text("Session Analytics")')).toBeVisible();
    await expect(page.locator('text=Monitor active sessions')).toBeVisible();

    // Check overview stats
    await expect(page.locator('text=Total Sessions')).toBeVisible();
    await expect(page.locator('text=89')).toBeVisible();
    await expect(page.locator('text=Active Sessions')).toBeVisible(); 
    await expect(page.locator('text=12')).toBeVisible();

    // Check filter buttons
    await expect(page.locator('button:has-text("all")')).toBeVisible();
    await expect(page.locator('button:has-text("active")')).toBeVisible();
    await expect(page.locator('button:has-text("completed")')).toBeVisible();

    // Test filtering
    await page.click('button:has-text("active")');
    
    // Check session table
    await expect(page.locator('text=Sessions')).toBeVisible();
    await expect(page.locator('text=sess-abc123')).toBeVisible(); // Truncated session key
    await expect(page.locator('text=telegram')).toBeVisible();

    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('GRID');
    // Should filter to show only GRID sessions

    // Run accessibility checks
    await checkA11y(page, 'Analytics - Session page with filters');
  });

  test('Token Analytics page shows usage and cost data', async ({ page }) => {
    await page.goto('/analytics/tokens');

    // Check page header
    await expect(page.locator('h1:has-text("Token Analytics")')).toBeVisible();
    await expect(page.locator('text=Track API token usage')).toBeVisible();

    // Check period selector
    await expect(page.locator('button:has-text("Last 24 Hours")')).toBeVisible();
    await expect(page.locator('button:has-text("Last 7 Days")')).toBeVisible();
    
    // Test period switching
    await page.click('button:has-text("Last 7 Days")');

    // Check overview stats
    await expect(page.locator('text=Total Tokens')).toBeVisible();
    await expect(page.locator('text=450.0K')).toBeVisible(); // Formatted number
    await expect(page.locator('text=Total Cost')).toBeVisible();
    await expect(page.locator('text=$125.7500')).toBeVisible(); // Formatted currency

    // Check model breakdown table
    await expect(page.locator('text=Usage by Model')).toBeVisible();
    await expect(page.locator('text=anthropic/claude-sonnet-3.5')).toBeVisible();
    await expect(page.locator('text=Most Used')).toBeVisible(); // Badge for top model

    // Check table data
    await expect(page.locator('text=420.0K')).toBeVisible(); // Model total tokens
    await expect(page.locator('text=$115.5000')).toBeVisible(); // Model cost
  });

  test('Metrics Dashboard shows system health and alerts', async ({ page }) => {
    await page.goto('/analytics/metrics');

    // Check page header
    await expect(page.locator('h1:has-text("Metrics Dashboard")')).toBeVisible();
    await expect(page.locator('text=Real-time system metrics')).toBeVisible();

    // Check active alerts section
    await expect(page.locator('text=🚨 Active Alerts')).toBeVisible();
    await expect(page.locator('text=Disk Usage')).toBeVisible();
    await expect(page.locator('text=Disk usage is at 72%')).toBeVisible();

    // Test alert acknowledgment
    const ackButton = page.locator('text=Ack');
    await expect(ackButton).toBeVisible();
    await ackButton.click();

    // Check all metric sections
    await expect(page.locator('text=System Performance')).toBeVisible();
    await expect(page.locator('text=Resource Usage')).toBeVisible(); 
    await expect(page.locator('text=Agent Status')).toBeVisible();
    await expect(page.locator('text=Activity Overview')).toBeVisible();

    // Check specific metrics
    await expect(page.locator('text=4d 0h')).toBeVisible(); // Uptime formatting
    await expect(page.locator('text=185ms')).toBeVisible(); // Response time
    await expect(page.locator('text=72%')).toBeVisible(); // Disk usage (should be warning color)

    // Test auto-refresh toggle
    const autoButton = page.locator('text=Auto ON');
    await expect(autoButton).toBeVisible();
    await autoButton.click();
    await expect(page.locator('text=Auto OFF')).toBeVisible();
  });

  test('Timeline page displays session visualization', async ({ page }) => {
    // Mock timeline-specific endpoints
    await page.route('**/api/analytics/timeline?list=true', async route => {
      const mockData = {
        sessions: [
          {
            key: 'sess-timeline-abc123',
            agentId: 'GRID',
            date: '2024-02-18T20:00:00Z',
            messageCount: 56,
            duration: 3600,
            status: 'completed',
          },
          {
            key: 'sess-timeline-def456',
            agentId: 'ATLAS', 
            date: '2024-02-18T19:00:00Z',
            messageCount: 23,
            duration: 1800,
            status: 'active',
          },
        ],
      };
      await route.fulfill({ json: mockData });
    });

    await page.route('**/api/analytics/timeline/stats', async route => {
      const mockData = {
        overview: {
          totalEvents: 1250,
          activeSessions: 3,
          avgEventRate: 12.5,
          peakConcurrency: 8,
        },
      };
      await route.fulfill({ json: mockData });
    });

    await page.goto('/analytics/timeline');

    // Check page header
    await expect(page.locator('h1:has-text("Session Timeline")')).toBeVisible();
    await expect(page.locator('text=Flame graph visualization')).toBeVisible();

    // Check overview stats
    await expect(page.locator('text=Total Events')).toBeVisible();
    await expect(page.locator('text=1250')).toBeVisible();

    // Check session selector
    await expect(page.locator('text=Select Session')).toBeVisible();
    const sessionSelect = page.locator('select');
    await expect(sessionSelect).toBeVisible();

    // Should have sessions in dropdown
    await expect(sessionSelect.locator('option:has-text("GRID")')).toBeVisible();
    await expect(sessionSelect.locator('option:has-text("ATLAS")')).toBeVisible();

    // Test session selection
    await sessionSelect.selectOption({ label: /ATLAS/ });
  });

  test('Navigation between analytics pages works', async ({ page }) => {
    await page.goto('/analytics/performance');

    // Navigate to different analytics pages (assuming there's a nav menu)
    // This would depend on your actual navigation structure
    
    // Direct navigation test
    await page.goto('/analytics/sessions');
    await expect(page.locator('h1:has-text("Session Analytics")')).toBeVisible();

    await page.goto('/analytics/tokens');
    await expect(page.locator('h1:has-text("Token Analytics")')).toBeVisible();

    await page.goto('/analytics/metrics');
    await expect(page.locator('h1:has-text("Metrics Dashboard")')).toBeVisible();

    await page.goto('/analytics/timeline');
    await expect(page.locator('h1:has-text("Session Timeline")')).toBeVisible();
  });

  test('Analytics pages are responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/analytics/performance');
    
    // Check that content is still visible and properly laid out
    await expect(page.locator('h1:has-text("Performance Analytics")')).toBeVisible();
    
    // Stats should stack vertically on mobile
    const statsGrid = page.locator('[class*="grid-cols"]').first();
    await expect(statsGrid).toBeVisible();

    // Test other pages on mobile
    await page.goto('/analytics/tokens');
    await expect(page.locator('h1:has-text("Token Analytics")')).toBeVisible();
    
    // Period buttons should be responsive
    await expect(page.locator('button:has-text("Last 24 Hours")')).toBeVisible();
  });

  test('Analytics pages handle loading states', async ({ page }) => {
    // Add delay to API responses to test loading states
    await page.route('**/api/analytics/performance', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.goto('/analytics/performance');

    // Should show loading state initially
    await expect(page.locator('text=Loading agent performance metrics')).toBeVisible();
    
    // Then show loaded content
    await expect(page.locator('h1:has-text("Performance Analytics")')).toBeVisible();
  });

  test('Analytics pages handle API errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/analytics/tokens**', async route => {
      await route.abort('failed');
    });

    await page.goto('/analytics/tokens');

    // Should still show the page structure
    await expect(page.locator('h1:has-text("Token Analytics")')).toBeVisible();
    
    // Should show empty state or error handling
    await expect(page.locator('text=No token usage data')).toBeVisible();
  });
});