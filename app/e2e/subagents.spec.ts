import { test, expect } from '@playwright/test';

test.describe('Subagents Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/subagents');
  });

  test('should display page header and empty state when no agents', async ({ page }) => {
    // Mock empty response
    await page.route('/api/subagents', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ agents: [] }),
      });
    });

    await page.reload();

    // Check page header
    await expect(page.getByText('🌳 Agent Hierarchy')).toBeVisible();
    await expect(page.getByText('View, steer, and manage the hierarchical tree of agents and their subagents')).toBeVisible();

    // Check empty state
    await expect(page.getByText('No Active Sub-Agents')).toBeVisible();
    await expect(page.getByText('Sub-agents will appear here when they are spawned')).toBeVisible();
  });

  test('should display agent hierarchy correctly', async ({ page }) => {
    // Mock agents response
    await page.route('/api/subagents', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          agents: [
            {
              sessionKey: 'main-session-123',
              agentId: 'main-agent',
              status: 'running',
              parentSession: null,
              task: 'Main coordination task',
              runtime: 150,
              startedAt: '2024-01-01T00:00:00Z',
              children: [
                {
                  sessionKey: 'sub-session-456',
                  agentId: 'sub-agent-1',
                  status: 'completed',
                  parentSession: 'main-session-123',
                  task: 'Process data files',
                  runtime: 45,
                  startedAt: '2024-01-01T00:01:00Z',
                  children: [],
                },
                {
                  sessionKey: 'sub-session-789',
                  agentId: 'sub-agent-2',
                  status: 'error',
                  parentSession: 'main-session-123',
                  task: 'Generate reports',
                  runtime: 30,
                  startedAt: '2024-01-01T00:02:00Z',
                  children: [],
                },
              ],
            },
          ],
        }),
      });
    });

    await page.reload();

    // Check agent count
    await expect(page.getByText('1 Active Agent')).toBeVisible();

    // Check main agent
    await expect(page.getByText('main-agent')).toBeVisible();
    await expect(page.getByText('Main coordination task')).toBeVisible();
    await expect(page.getByText('running')).toBeVisible();
    await expect(page.getByText('2m 30s')).toBeVisible(); // 150 seconds

    // Check sub-agents
    await expect(page.getByText('sub-agent-1')).toBeVisible();
    await expect(page.getByText('sub-agent-2')).toBeVisible();
    await expect(page.getByText('Process data files')).toBeVisible();
    await expect(page.getByText('Generate reports')).toBeVisible();
    await expect(page.getByText('completed')).toBeVisible();
    await expect(page.getByText('error')).toBeVisible();
  });

  test('should support expand/collapse functionality', async ({ page }) => {
    // Mock agents response
    await page.route('/api/subagents', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          agents: [
            {
              sessionKey: 'main-session-123',
              agentId: 'main-agent',
              status: 'running',
              parentSession: null,
              task: 'Main coordination task',
              runtime: 150,
              startedAt: '2024-01-01T00:00:00Z',
              children: [
                {
                  sessionKey: 'sub-session-456',
                  agentId: 'sub-agent-1',
                  status: 'completed',
                  parentSession: 'main-session-123',
                  task: 'Process data files',
                  runtime: 45,
                  startedAt: '2024-01-01T00:01:00Z',
                  children: [],
                },
              ],
            },
          ],
        }),
      });
    });

    await page.reload();

    // Initially expanded - sub-agent should be visible
    await expect(page.getByText('sub-agent-1')).toBeVisible();

    // Click collapse button
    const collapseButton = page.getByRole('button', { name: '▼' });
    await collapseButton.click();

    // Should show expand button
    await expect(page.getByRole('button', { name: '▶' })).toBeVisible();

    // Click expand button
    const expandButton = page.getByRole('button', { name: '▶' });
    await expandButton.click();

    // Should show collapse button again and sub-agent
    await expect(page.getByRole('button', { name: '▼' })).toBeVisible();
    await expect(page.getByText('sub-agent-1')).toBeVisible();
  });

  test('should support steering functionality', async ({ page }) => {
    // Mock agents response
    await page.route('/api/subagents', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          agents: [
            {
              sessionKey: 'main-session-123',
              agentId: 'main-agent',
              status: 'running',
              parentSession: null,
              task: 'Main coordination task',
              runtime: 150,
              startedAt: '2024-01-01T00:00:00Z',
              children: [],
            },
          ],
        }),
      });
    });

    // Mock steering API
    await page.route('/api/subagents/steer', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.reload();

    // Hover over agent card to reveal actions
    const agentCard = page.getByText('main-agent').locator('..');
    await agentCard.hover();

    // Click steer button
    await page.getByRole('button', { name: /steer/i }).click();

    // Should show steering input
    const steerInput = page.getByPlaceholder('Enter steering message...');
    await expect(steerInput).toBeVisible();

    // Type steering message
    const steerMessage = 'Please prioritize task A';
    await steerInput.fill(steerMessage);

    // Submit steering message
    await page.getByRole('button', { name: 'Send' }).click();

    // Input should be hidden after successful submission
    await expect(steerInput).not.toBeVisible();
  });

  test('should support kill confirmation flow', async ({ page }) => {
    // Mock agents response
    await page.route('/api/subagents', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          agents: [
            {
              sessionKey: 'main-session-123',
              agentId: 'main-agent',
              status: 'running',
              parentSession: null,
              task: 'Main coordination task',
              runtime: 150,
              startedAt: '2024-01-01T00:00:00Z',
              children: [],
            },
          ],
        }),
      });
    });

    // Mock kill API
    await page.route('/api/subagents/kill', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.reload();

    // Hover over agent card to reveal actions
    const agentCard = page.getByText('main-agent').locator('..');
    await agentCard.hover();

    // Click kill button
    await page.getByRole('button', { name: /kill/i }).click();

    // Should show confirmation dialog
    await expect(page.getByText('Are you sure you want to kill this agent?')).toBeVisible();

    // Cancel first
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('Are you sure you want to kill this agent?')).not.toBeVisible();

    // Try kill again
    await page.getByRole('button', { name: /kill/i }).click();
    await expect(page.getByText('Are you sure you want to kill this agent?')).toBeVisible();

    // Confirm kill
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Confirmation dialog should disappear
    await expect(page.getByText('Are you sure you want to kill this agent?')).not.toBeVisible();
  });

  test('should support refresh functionality', async ({ page }) => {
    let requestCount = 0;
    
    // Mock agents response with counter
    await page.route('/api/subagents', async (route) => {
      requestCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          agents: [
            {
              sessionKey: 'main-session-123',
              agentId: `main-agent-${requestCount}`,
              status: 'running',
              parentSession: null,
              task: 'Main coordination task',
              runtime: 150,
              startedAt: '2024-01-01T00:00:00Z',
              children: [],
            },
          ],
        }),
      });
    });

    await page.reload();

    // Should show first request data
    await expect(page.getByText('main-agent-1')).toBeVisible();

    // Click refresh button
    await page.getByRole('button', { name: /refresh/i }).click();

    // Should show updated data
    await expect(page.getByText('main-agent-2')).toBeVisible();
  });

  test('should support keyboard shortcuts', async ({ page }) => {
    let requestCount = 0;
    
    // Mock agents response
    await page.route('/api/subagents', async (route) => {
      requestCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          agents: [
            {
              sessionKey: 'main-session-123',
              agentId: `main-agent-${requestCount}`,
              status: 'running',
              parentSession: null,
              task: 'Main coordination task',
              runtime: 150,
              startedAt: '2024-01-01T00:00:00Z',
              children: [],
            },
          ],
        }),
      });
    });

    await page.reload();
    await expect(page.getByText('main-agent-1')).toBeVisible();

    // Test Ctrl+R for refresh
    await page.keyboard.press('Control+r');

    // Should trigger refresh
    await expect(page.getByText('main-agent-2')).toBeVisible();
  });

  test('should show loading state', async ({ page }) => {
    // Mock slow response
    await page.route('/api/subagents', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ agents: [] }),
      });
    });

    await page.reload();

    // Should show loading skeletons
    await expect(page.locator('[data-testid*="skeleton"]')).toBeVisible();

    // Wait for loading to complete
    await expect(page.getByText('No Active Sub-Agents')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock error response
    await page.route('/api/subagents', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    await page.reload();

    // Should still render page without crashing
    await expect(page.getByText('🌳 Agent Hierarchy')).toBeVisible();
    
    // Should show empty state or handle error gracefully
    // (The component should handle this gracefully without showing error message)
    await expect(page.getByText('No Active Sub-Agents')).toBeVisible();
  });

  test('should auto-refresh every 15 seconds', async ({ page }) => {
    let requestCount = 0;
    
    // Mock agents response with counter
    await page.route('/api/subagents', async (route) => {
      requestCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          agents: [
            {
              sessionKey: 'main-session-123',
              agentId: `main-agent-${requestCount}`,
              status: 'running',
              parentSession: null,
              task: 'Main coordination task',
              runtime: 150,
              startedAt: '2024-01-01T00:00:00Z',
              children: [],
            },
          ],
        }),
      });
    });

    await page.reload();
    await expect(page.getByText('main-agent-1')).toBeVisible();

    // Wait for auto-refresh (we'll wait a bit less than 15s for test efficiency)
    await page.waitForTimeout(16000);

    // Should have auto-refreshed
    await expect(page.getByText('main-agent-2')).toBeVisible();
  });

  test('should display agent session key and runtime correctly', async ({ page }) => {
    // Mock agents response
    await page.route('/api/subagents', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          agents: [
            {
              sessionKey: 'main-session-abcdef123456',
              agentId: 'main-agent',
              status: 'running',
              parentSession: null,
              task: 'Main coordination task',
              runtime: 3665, // 1 hour, 1 minute, 5 seconds
              startedAt: '2024-01-01T00:00:00Z',
              children: [],
            },
          ],
        }),
      });
    });

    await page.reload();

    // Should show last 12 characters of session key
    await expect(page.getByText('ef123456')).toBeVisible();

    // Should format runtime as hours, minutes, seconds
    await expect(page.getByText('1h 1m')).toBeVisible();
  });
});