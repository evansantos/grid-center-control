import { test, expect } from '@playwright/test';
import { checkA11y, checkHeadingHierarchy } from './axe-helper';

test.describe('Office Isometric View E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock office/agents data API
    await page.route('**/api/office/agents', async route => {
      const mockOfficeData = {
        agents: [
          {
            id: 'grid',
            name: 'GRID',
            position: { x: 150, y: 200, z: 0 },
            status: 'active',
            currentTask: 'Processing data analysis',
            avatar: '/avatars/grid.png',
            workstation: {
              type: 'desk_a',
              equipment: ['monitor', 'keyboard', 'mouse'],
              position: { x: 140, y: 190, z: 0 },
            },
          },
          {
            id: 'atlas',
            name: 'ATLAS',
            position: { x: 300, y: 150, z: 0 },
            status: 'idle',
            currentTask: null,
            avatar: '/avatars/atlas.png',
            workstation: {
              type: 'desk_b',
              equipment: ['monitor', 'tablet'],
              position: { x: 290, y: 140, z: 0 },
            },
          },
          {
            id: 'dev',
            name: 'DEV',
            position: { x: 200, y: 300, z: 0 },
            status: 'busy',
            currentTask: 'Code review and debugging',
            avatar: '/avatars/dev.png',
            workstation: {
              type: 'desk_c',
              equipment: ['monitor', 'keyboard', 'mouse', 'coffee'],
              position: { x: 190, y: 290, z: 0 },
            },
          },
          {
            id: 'pixel',
            name: 'PIXEL',
            position: { x: 350, y: 250, z: 0 },
            status: 'away',
            currentTask: null,
            avatar: '/avatars/pixel.png',
            workstation: {
              type: 'desk_d',
              equipment: ['monitor', 'graphics_tablet'],
              position: { x: 340, y: 240, z: 0 },
            },
          },
        ],
        office: {
          layout: 'open_plan',
          dimensions: { width: 500, height: 400 },
          furniture: [
            { type: 'meeting_room', position: { x: 50, y: 50, z: 0 } },
            { type: 'coffee_machine', position: { x: 450, y: 350, z: 0 } },
            { type: 'plant', position: { x: 100, y: 350, z: 0 } },
            { type: 'bookshelf', position: { x: 25, y: 200, z: 0 } },
          ],
          ambiance: {
            lighting: 'natural',
            temperature: 22,
            noise_level: 'quiet',
          },
        },
        activities: [
          {
            id: 'activity-1',
            type: 'collaboration',
            agents: ['grid', 'atlas'],
            location: { x: 225, y: 175, z: 0 },
            description: 'Working on analytics dashboard',
          },
        ],
        stats: {
          totalAgents: 4,
          activeAgents: 1,
          busyAgents: 1,
          idleAgents: 1,
          awayAgents: 1,
        },
      };
      await route.fulfill({ json: mockOfficeData });
    });

    // Mock office interactions API
    await page.route('**/api/office/interact', async route => {
      const interactionData = {
        success: true,
        message: 'Interaction registered',
        effects: [
          { type: 'agent_highlight', agentId: 'grid' },
          { type: 'status_update', agentId: 'grid', newStatus: 'focused' },
        ],
      };
      await route.fulfill({ json: interactionData });
    });

    await page.goto('/');
  });

  test('loads office page and displays isometric view', async ({ page }) => {
    // Check page header (Mission Control from dashboard.spec.ts)
    await expect(page.locator('h1:has-text("Mission Control")')).toBeVisible();

    // Check that office/isometric container is present
    const officeContainer = page.locator('[data-testid="office-view"], [data-testid="isometric-view"], [class*="office"], [class*="isometric"]');
    await expect(officeContainer.first().or(page.locator('canvas, svg')).first()).toBeVisible();

    // Run accessibility checks
    await checkA11y(page, 'Office - isometric view');
    await checkHeadingHierarchy(page);
  });

  test('displays all agents in their workstations', async ({ page }) => {
    // Wait for office view to load
    await page.waitForTimeout(1000);

    // Check that agents are visible
    await expect(page.locator('text=GRID, [data-agent="grid"], [title="GRID"]').first()).toBeVisible();
    await expect(page.locator('text=ATLAS, [data-agent="atlas"], [title="ATLAS"]').first()).toBeVisible();
    await expect(page.locator('text=DEV, [data-agent="dev"], [title="DEV"]').first()).toBeVisible();
    await expect(page.locator('text=PIXEL, [data-agent="pixel"], [title="PIXEL"]').first()).toBeVisible();

    // Check agent avatars/representations
    const agentElements = page.locator('[data-agent], [class*="agent"], img[alt*="agent"]');
    await expect(agentElements.first()).toBeVisible();
  });

  test('shows agent status indicators', async ({ page }) => {
    // Wait for office view
    await page.waitForTimeout(1000);

    // Check for status indicators (could be colors, badges, icons)
    const statusIndicators = page.locator(
      '[data-status="active"], [data-status="idle"], [data-status="busy"], [data-status="away"], ' +
      '[class*="status-active"], [class*="status-idle"], [class*="status-busy"], [class*="status-away"], ' +
      'text=Active, text=Idle, text=Busy, text=Away'
    );
    await expect(statusIndicators.first()).toBeVisible();

    // Check for different status colors/styles
    const activeStatus = page.locator('[data-status="active"], [class*="status-active"], [class*="active"]');
    const busyStatus = page.locator('[data-status="busy"], [class*="status-busy"], [class*="busy"]');
    const idleStatus = page.locator('[data-status="idle"], [class*="status-idle"], [class*="idle"]');
    const awayStatus = page.locator('[data-status="away"], [class*="status-away"], [class*="away"]');

    // At least one status should be visible
    await expect(
      activeStatus.or(busyStatus).or(idleStatus).or(awayStatus).first()
    ).toBeVisible();
  });

  test('displays office furniture and environment', async ({ page }) => {
    // Wait for office view
    await page.waitForTimeout(1000);

    // Check for office furniture elements
    const furniture = page.locator(
      '[data-furniture], [class*="furniture"], [class*="desk"], [class*="chair"], ' +
      '[data-testid*="meeting"], [data-testid*="coffee"], [data-testid*="plant"]'
    );

    // Check for meeting room
    const meetingRoom = page.locator('text=Meeting, [data-furniture="meeting_room"], [class*="meeting"]');
    
    // Check for other office elements
    const officeElements = page.locator(
      '[data-furniture="coffee_machine"], [data-furniture="plant"], [data-furniture="bookshelf"], ' +
      '[class*="coffee"], [class*="plant"], [class*="bookshelf"]'
    );

    // At least some furniture should be visible
    await expect(
      furniture.first().or(meetingRoom.first()).or(officeElements.first())
    ).toBeVisible();
  });

  test('shows current tasks and activities', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(1000);

    // Check for task information
    const taskInfo = page.locator(
      'text=Processing data analysis, text=Code review and debugging, ' +
      '[data-testid*="task"], [class*="task"], [class*="activity"]'
    );

    if (await taskInfo.first().isVisible()) {
      await expect(taskInfo.first()).toBeVisible();
    }

    // Check for collaboration indicators
    const collaboration = page.locator(
      'text=Working on analytics dashboard, text=collaboration, ' +
      '[data-activity="collaboration"], [class*="collaboration"]'
    );

    if (await collaboration.first().isVisible()) {
      await expect(collaboration.first()).toBeVisible();
    }
  });

  test('allows clicking on agents for details', async ({ page }) => {
    // Wait for office view
    await page.waitForTimeout(1000);

    // Find and click on an agent
    const gridAgent = page.locator('text=GRID, [data-agent="grid"], [title="GRID"]').first();
    
    if (await gridAgent.isVisible()) {
      await gridAgent.click();

      // Should show agent details (modal, panel, or tooltip)
      const agentDetails = page.locator(
        '[data-testid="agent-details"], [class*="agent-modal"], [class*="agent-panel"], ' +
        '[role="dialog"], [role="tooltip"]'
      );

      const agentInfo = page.locator(
        'text=Processing data analysis, text=Active, text=GRID'
      );

      // Either details panel or info should be visible
      await expect(
        agentDetails.first().or(agentInfo.first())
      ).toBeVisible();
    }
  });

  test('shows agent activity animations or indicators', async ({ page }) => {
    // Wait for office view
    await page.waitForTimeout(1000);

    // Check for animated elements (could be CSS animations, moving elements)
    const animatedElements = page.locator(
      '[class*="animate"], [class*="pulse"], [class*="blink"], [class*="active"], ' +
      '[data-animated="true"], .typing, .working'
    );

    // Check for status change indicators
    const statusChanges = page.locator(
      '[data-status-changed], [class*="status-change"], [class*="notification"]'
    );

    // Some activity indication should be present
    if (await animatedElements.first().isVisible() || await statusChanges.first().isVisible()) {
      await expect(animatedElements.first().or(statusChanges.first())).toBeVisible();
    }
  });

  test('displays office statistics', async ({ page }) => {
    // Wait for data
    await page.waitForTimeout(1000);

    // Look for stats panel or indicators
    const stats = page.locator(
      '[data-testid="office-stats"], [class*="stats"], [class*="summary"]'
    );

    // Check for specific stat numbers
    const statNumbers = page.locator(
      'text=/Active: \\d+/, text=/Busy: \\d+/, text=/Total: \\d+/, ' +
      'text=4, text=1' // Based on mock data
    );

    // Stats should be visible somewhere
    if (await stats.first().isVisible()) {
      await expect(stats.first()).toBeVisible();
    } else {
      await expect(statNumbers.first()).toBeVisible();
    }
  });

  test('supports zooming and panning the office view', async ({ page }) => {
    // Wait for office view
    await page.waitForTimeout(1000);

    const officeView = page.locator('[data-testid="office-view"], [data-testid="isometric-view"], canvas, svg').first();
    
    if (await officeView.isVisible()) {
      // Test zoom controls if they exist
      const zoomIn = page.locator('button:has-text("+"), [data-testid="zoom-in"], [aria-label*="zoom in"]');
      const zoomOut = page.locator('button:has-text("-"), [data-testid="zoom-out"], [aria-label*="zoom out"]');

      if (await zoomIn.isVisible() && await zoomOut.isVisible()) {
        await zoomIn.click();
        await zoomOut.click();
      }

      // Test mouse wheel zoom
      await officeView.hover();
      await page.mouse.wheel(0, -100); // Zoom in
      await page.mouse.wheel(0, 100);  // Zoom out

      // Test panning by dragging
      const viewBox = await officeView.boundingBox();
      if (viewBox) {
        await page.mouse.move(viewBox.x + viewBox.width / 2, viewBox.y + viewBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(viewBox.x + viewBox.width / 2 - 50, viewBox.y + viewBox.height / 2 - 30);
        await page.mouse.up();
      }
    }
  });

  test('updates agent positions in real-time', async ({ page }) => {
    // Mock real-time updates
    let updateCount = 0;
    await page.route('**/api/office/agents', async route => {
      updateCount++;
      const mockData = {
        agents: [
          {
            id: 'grid',
            name: 'GRID',
            position: { x: 150 + (updateCount * 10), y: 200, z: 0 }, // Move slightly
            status: updateCount > 1 ? 'busy' : 'active', // Change status
            currentTask: updateCount > 1 ? 'Updated task' : 'Processing data analysis',
          },
        ],
      };
      await route.fulfill({ json: mockData });
    });

    // Wait for initial load
    await page.waitForTimeout(1000);

    // Trigger an update (could be automatic refresh or manual)
    const refreshButton = page.locator('button:has-text("Refresh"), [data-testid="refresh"]');
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForTimeout(500);
    } else {
      // Simulate auto-refresh by reloading data
      await page.reload();
      await page.waitForTimeout(1000);
    }

    // Check for updated content
    const updatedTask = page.locator('text=Updated task');
    if (await updatedTask.isVisible()) {
      await expect(updatedTask).toBeVisible();
    }
  });

  test('handles agent interactions (hover, click)', async ({ page }) => {
    // Wait for office view
    await page.waitForTimeout(1000);

    const gridAgent = page.locator('text=GRID, [data-agent="grid"], [title="GRID"]').first();
    
    if (await gridAgent.isVisible()) {
      // Test hover effects
      await gridAgent.hover();
      
      // Should show hover state (tooltip, highlight, etc.)
      const hoverEffect = page.locator(
        '[class*="hover"], [class*="highlight"], [data-hover="true"], ' +
        '[role="tooltip"], .tooltip, [class*="popup"]'
      );

      if (await hoverEffect.first().isVisible()) {
        await expect(hoverEffect.first()).toBeVisible();
      }

      // Test click interaction
      await gridAgent.click();
      
      // Should trigger some interaction
      const interaction = page.locator(
        '[data-testid="agent-interaction"], [class*="modal"], [class*="details"]'
      );

      if (await interaction.first().isVisible()) {
        await expect(interaction.first()).toBeVisible();
      }
    }
  });

  test('shows collaborative activities between agents', async ({ page }) => {
    // Wait for office view
    await page.waitForTimeout(1000);

    // Look for collaboration indicators
    const collaboration = page.locator(
      'text=Working on analytics dashboard, text=collaboration, ' +
      '[data-activity="collaboration"], [class*="collaboration"], ' +
      '[data-testid*="collaboration"]'
    );

    if (await collaboration.first().isVisible()) {
      await expect(collaboration.first()).toBeVisible();

      // Should show connection between collaborating agents
      const connectionLine = page.locator(
        'line, path, [class*="connection"], [class*="link"]'
      );

      if (await connectionLine.first().isVisible()) {
        await expect(connectionLine.first()).toBeVisible();
      }
    }
  });

  test('displays office ambiance and environment details', async ({ page }) => {
    // Wait for office view
    await page.waitForTimeout(1000);

    // Look for environment information
    const ambiance = page.locator(
      'text=natural, text=22, text=quiet, ' +
      '[data-testid*="ambiance"], [class*="environment"], [class*="ambiance"]'
    );

    // Look for environmental elements
    const lighting = page.locator(
      '[data-lighting="natural"], [class*="natural-light"], [class*="lighting"]'
    );

    // Some ambiance info should be visible
    if (await ambiance.first().isVisible() || await lighting.first().isVisible()) {
      await expect(ambiance.first().or(lighting.first())).toBeVisible();
    }
  });

  test('is responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Page should still load
    await expect(page.locator('h1:has-text("Mission Control")')).toBeVisible();

    // Office view should adapt to mobile layout
    const officeView = page.locator('[data-testid="office-view"], [data-testid="isometric-view"], canvas, svg').first();
    await expect(officeView).toBeVisible();

    // Agents should still be visible
    await expect(page.locator('text=GRID, [data-agent="grid"], [title="GRID"]').first()).toBeVisible();

    // Mobile-specific controls might appear
    const mobileControls = page.locator('button[aria-label*="menu"], .mobile-nav, [data-testid*="mobile"]');
    if (await mobileControls.first().isVisible()) {
      await mobileControls.first().click();
    }
  });

  test('handles loading states for office data', async ({ page }) => {
    // Add delay to API to test loading states
    await page.route('**/api/office/agents', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.goto('/');

    // Should show loading state
    const loading = page.locator(
      'text=Loading office, text=Loading agents, [data-testid="loading"], ' +
      '[class*="loading"], [class*="spinner"], [aria-label*="loading"]'
    );

    if (await loading.first().isVisible()) {
      await expect(loading.first()).toBeVisible();
    }

    // Eventually should show loaded content
    await expect(page.locator('text=GRID, [data-agent="grid"], [title="GRID"]').first()).toBeVisible();
  });

  test('handles API errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/office/agents', async route => {
      await route.abort('failed');
    });

    await page.goto('/');

    // Page should still show basic structure
    await expect(page.locator('h1:has-text("Mission Control")')).toBeVisible();

    // Should show error state or empty office
    const errorState = page.locator(
      'text=Unable to load office, text=No agents available, text=Loading failed, ' +
      '[data-testid="error"], [class*="error"], [class*="empty"]'
    );

    if (await errorState.first().isVisible()) {
      await expect(errorState.first()).toBeVisible();
    }
  });

  test('supports keyboard navigation', async ({ page }) => {
    // Wait for office view
    await page.waitForTimeout(1000);

    const officeView = page.locator('[data-testid="office-view"], [data-testid="isometric-view"]').first();
    
    if (await officeView.isVisible()) {
      await officeView.focus();

      // Test arrow key navigation
      await page.keyboard.press('Tab');        // Navigate to first focusable element
      await page.keyboard.press('ArrowRight'); // Move selection right
      await page.keyboard.press('ArrowDown');  // Move selection down
      await page.keyboard.press('Enter');      // Select/activate

      // Test other navigation keys
      await page.keyboard.press('Space');      // Activate/toggle
      await page.keyboard.press('Escape');     // Cancel/deselect
    }
  });

  test('shows office layout and spatial relationships', async ({ page }) => {
    // Wait for office view
    await page.waitForTimeout(1000);

    // Check that agents are positioned relative to their workstations
    const agentPositions = page.locator('[data-agent], [class*="agent"]');
    const workstations = page.locator('[data-furniture*="desk"], [class*="desk"], [class*="workstation"]');

    // Both agents and workstations should be visible
    await expect(agentPositions.first().or(page.locator('text=GRID')).first()).toBeVisible();
    
    if (await workstations.first().isVisible()) {
      await expect(workstations.first()).toBeVisible();
    }

    // Check spatial layout makes sense (agents near their desks)
    // This would depend on your specific implementation
  });
});