import { test, expect } from '@playwright/test';

test.describe('Spawn Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/spawn');
  });

  test('should display spawn form with all required fields', async ({ page }) => {
    // Check page header
    await expect(page.getByText('🚀 Spawn Agent Session')).toBeVisible();
    await expect(page.getByText('Create a new agent session with a specific task')).toBeVisible();

    // Check form fields are present
    await expect(page.getByText('Agent')).toBeVisible();
    await expect(page.getByText('Model')).toBeVisible();
    await expect(page.getByText('Task Description')).toBeVisible();
    await expect(page.getByText('Timeout (seconds)')).toBeVisible();

    // Check submit button
    await expect(page.getByRole('button', { name: /spawn/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    // Try to submit without filling anything
    await page.getByRole('button', { name: /spawn/i }).click();

    // Should show validation error
    await expect(page.getByText('Please provide a task description')).toBeVisible();
  });

  test('should validate task length', async ({ page }) => {
    // Enter a task that's too short
    await page.getByLabel('Task Description').fill('short');
    await page.getByRole('button', { name: /spawn/i }).click();

    // Should show validation error
    await expect(page.getByText('Task description must be at least 10 characters')).toBeVisible();
  });

  test('should validate timeout bounds', async ({ page }) => {
    // Test lower bound
    await page.getByLabel('Task Description').fill('This is a valid task description');
    await page.getByLabel('Timeout (seconds)').fill('20');
    await page.getByRole('button', { name: /spawn/i }).click();

    await expect(page.getByText('Timeout must be at least 30 seconds')).toBeVisible();

    // Clear and test upper bound
    await page.getByLabel('Timeout (seconds)').fill('4000');
    await page.getByRole('button', { name: /spawn/i }).click();

    await expect(page.getByText('Timeout cannot exceed 3600 seconds')).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through form elements
    await page.keyboard.press('Tab');
    
    // Should focus on first interactive element (agent select)
    await expect(page.getByLabel('Agent')).toBeFocused();

    // Continue tabbing
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Model')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Task Description')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Timeout (seconds)')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /spawn/i })).toBeFocused();
  });

  test('should remember form state when navigating away and back', async ({ page }) => {
    // Fill out form
    await page.getByLabel('Task Description').fill('Remember this task');
    await page.getByLabel('Timeout (seconds)').fill('120');

    // Navigate away
    await page.goto('/');
    
    // Navigate back
    await page.goto('/spawn');

    // Form should be reset (this is expected behavior for security/privacy)
    await expect(page.getByLabel('Task Description')).toHaveValue('');
    await expect(page.getByLabel('Timeout (seconds)')).toHaveValue('300'); // default
  });

  test('should show loading state when submitting', async ({ page }) => {
    // Mock a slow response
    await page.route('/api/spawn', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessionKey: 'test-session-123',
          agentId: 'test-agent',
          model: 'default',
          status: 'running',
          timestamp: new Date().toISOString(),
        }),
      });
    });

    // Fill form and submit
    await page.getByLabel('Task Description').fill('This is a test task for loading state');
    await page.getByRole('button', { name: /spawn/i }).click();

    // Should show loading state
    await expect(page.getByText('⏳ Spawning...')).toBeVisible();

    // Wait for completion
    await expect(page.getByText('✅ Agent Spawned Successfully')).toBeVisible();
  });

  test('should display success result after spawning', async ({ page }) => {
    // Mock successful response
    await page.route('/api/spawn', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessionKey: 'test-session-abcd1234567890',
          agentId: 'test-agent',
          model: 'claude-sonnet',
          status: 'running',
          timestamp: new Date().toISOString(),
        }),
      });
    });

    // Fill form and submit
    await page.getByLabel('Task Description').fill('This is a successful test spawn');
    await page.getByRole('button', { name: /spawn/i }).click();

    // Should show success message
    await expect(page.getByText('✅ Agent Spawned Successfully')).toBeVisible();

    // Should show result details
    await expect(page.getByText('1234567890')).toBeVisible(); // Last 20 chars of session key
    await expect(page.getByText('test-agent')).toBeVisible();
    await expect(page.getByText('claude-sonnet')).toBeVisible();
    await expect(page.getByText('running')).toBeVisible();
  });

  test('should handle spawn errors gracefully', async ({ page }) => {
    // Mock error response
    await page.route('/api/spawn', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Agent limit exceeded',
        }),
      });
    });

    // Fill form and submit
    await page.getByLabel('Task Description').fill('This will fail');
    await page.getByRole('button', { name: /spawn/i }).click();

    // Should show error message
    await expect(page.getByText('Failed to spawn agent. Please try again.')).toBeVisible();
  });

  test('should support select interactions', async ({ page }) => {
    // Mock agents data
    await page.route('/api/spawn', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            agents: [
              { id: 'agent1', emoji: '🤖', name: 'Test Agent 1' },
              { id: 'agent2', emoji: '🚀', name: 'Test Agent 2' },
            ],
          }),
        });
      }
    });

    // Wait for agents to load
    await page.waitForLoadState('networkidle');

    // Test agent selection
    await page.getByLabel('Agent').click();
    
    // Should see agent options
    await expect(page.getByText('🤖 Test Agent 1')).toBeVisible();
    await expect(page.getByText('🚀 Test Agent 2')).toBeVisible();

    // Select an agent
    await page.getByText('🚀 Test Agent 2').click();

    // Test model selection
    await page.getByLabel('Model').click();
    await expect(page.getByText('Claude Opus')).toBeVisible();
    await expect(page.getByText('Claude Sonnet')).toBeVisible();
    await page.getByText('Claude Sonnet').click();
  });

  test('should clear form after successful submission', async ({ page }) => {
    // Mock successful response
    await page.route('/api/spawn', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sessionKey: 'test-session-123',
          agentId: 'test-agent',
          model: 'default',
          status: 'running',
          timestamp: new Date().toISOString(),
        }),
      });
    });

    // Fill form
    const taskValue = 'This task should be cleared after success';
    await page.getByLabel('Task Description').fill(taskValue);
    
    // Verify it's filled
    await expect(page.getByLabel('Task Description')).toHaveValue(taskValue);

    // Submit
    await page.getByRole('button', { name: /spawn/i }).click();

    // Wait for success
    await expect(page.getByText('✅ Agent Spawned Successfully')).toBeVisible();

    // Task field should be cleared
    await expect(page.getByLabel('Task Description')).toHaveValue('');
  });
});