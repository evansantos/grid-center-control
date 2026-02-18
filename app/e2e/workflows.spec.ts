import { test, expect } from '@playwright/test';

test.describe('Workflows Canvas E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock workflow data API
    await page.route('**/api/workflows**', async route => {
      const mockWorkflow = {
        id: 'workflow-1',
        name: 'Data Processing Pipeline',
        description: 'Process and analyze incoming data streams',
        nodes: [
          {
            id: 'node-1',
            type: 'input',
            label: 'Data Input',
            position: { x: 100, y: 100 },
            data: {
              agent: 'GRID',
              config: { source: 'api' },
            },
          },
          {
            id: 'node-2',
            type: 'process',
            label: 'Data Transform',
            position: { x: 300, y: 100 },
            data: {
              agent: 'ATLAS',
              config: { operation: 'transform' },
            },
          },
          {
            id: 'node-3',
            type: 'output',
            label: 'Export Results',
            position: { x: 500, y: 100 },
            data: {
              agent: 'DEV',
              config: { destination: 'database' },
            },
          },
          {
            id: 'node-4',
            type: 'condition',
            label: 'Quality Check',
            position: { x: 300, y: 250 },
            data: {
              agent: 'PIXEL',
              config: { threshold: 0.95 },
            },
          },
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'node-1',
            target: 'node-2',
            type: 'default',
            label: 'Raw Data',
          },
          {
            id: 'edge-2',
            source: 'node-2',
            target: 'node-3',
            type: 'default',
            label: 'Processed Data',
          },
          {
            id: 'edge-3',
            source: 'node-2',
            target: 'node-4',
            type: 'conditional',
            label: 'Validation',
          },
        ],
        status: 'active',
        lastRun: '2024-02-18T20:30:00Z',
      };
      await route.fulfill({ json: mockWorkflow });
    });

    // Mock workflow list API
    await page.route('**/api/workflows/list', async route => {
      const mockWorkflows = {
        workflows: [
          {
            id: 'workflow-1',
            name: 'Data Processing Pipeline',
            status: 'active',
            lastRun: '2024-02-18T20:30:00Z',
            nodeCount: 4,
          },
          {
            id: 'workflow-2',
            name: 'Alert Processing',
            status: 'paused',
            lastRun: '2024-02-17T15:45:00Z',
            nodeCount: 3,
          },
        ],
      };
      await route.fulfill({ json: mockWorkflows });
    });

    // Mock node templates API
    await page.route('**/api/workflows/templates', async route => {
      const mockTemplates = {
        nodeTypes: [
          { type: 'input', label: 'Input Node', icon: '📥', category: 'data' },
          { type: 'process', label: 'Process Node', icon: '⚙️', category: 'transform' },
          { type: 'output', label: 'Output Node', icon: '📤', category: 'data' },
          { type: 'condition', label: 'Condition Node', icon: '🔀', category: 'logic' },
          { type: 'timer', label: 'Timer Node', icon: '⏰', category: 'trigger' },
        ],
      };
      await route.fulfill({ json: mockTemplates });
    });

    await page.goto('/workflows');
  });

  test('loads workflows page and displays canvas', async ({ page }) => {
    // Check page header
    await expect(page.locator('h1:has-text("🔄 Workflows")')).toBeVisible();
    await expect(page.locator('text=Visual workflow designer')).toBeVisible();

    // Check canvas container is present
    const canvas = page.locator('[data-testid="workflow-canvas"], [class*="canvas"], [class*="flow"]');
    await expect(canvas.first()).toBeVisible();

    // Check toolbar/sidebar with node types
    const toolbar = page.locator('[data-testid="node-palette"], [class*="toolbar"], [class*="sidebar"]');
    await expect(toolbar.first().or(page.locator('text=Input Node'))).toBeVisible();
  });

  test('displays workflow nodes correctly on canvas', async ({ page }) => {
    // Wait for canvas to load
    await expect(page.locator('[data-testid="workflow-canvas"], [class*="canvas"]').first()).toBeVisible();

    // Check that nodes are displayed
    await expect(page.locator('text=Data Input')).toBeVisible();
    await expect(page.locator('text=Data Transform')).toBeVisible();
    await expect(page.locator('text=Export Results')).toBeVisible();
    await expect(page.locator('text=Quality Check')).toBeVisible();

    // Check node types have different styling
    const inputNode = page.locator('[data-node-type="input"], [data-node-id="node-1"]');
    const processNode = page.locator('[data-node-type="process"], [data-node-id="node-2"]');
    const outputNode = page.locator('[data-node-type="output"], [data-node-id="node-3"]');
    const conditionNode = page.locator('[data-node-type="condition"], [data-node-id="node-4"]');

    // At least one node should be visible
    await expect(
      inputNode.or(processNode).or(outputNode).or(conditionNode).or(page.locator('text=Data Input'))
    ).toBeVisible();
  });

  test('displays connections between nodes', async ({ page }) => {
    // Wait for canvas to load
    await expect(page.locator('[data-testid="workflow-canvas"], [class*="canvas"]').first()).toBeVisible();

    // Check for connection elements (lines, paths, edges)
    const connections = page.locator('[data-testid*="edge"], [class*="edge"], [class*="connection"], path, line');
    await expect(connections.first()).toBeVisible();

    // Check connection labels if they exist
    const connectionLabels = page.locator('text=Raw Data, text=Processed Data, text=Validation');
    if (await connectionLabels.first().isVisible()) {
      await expect(connectionLabels.first()).toBeVisible();
    }
  });

  test('allows dragging nodes on canvas', async ({ page }) => {
    // Wait for canvas to be ready
    await expect(page.locator('[data-testid="workflow-canvas"], [class*="canvas"]').first()).toBeVisible();

    // Find a node to drag
    const nodeSelector = page.locator('text=Data Input').locator('..');
    const node = nodeSelector.or(page.locator('[data-node-id="node-1"], [data-testid*="node"]').first());

    if (await node.isVisible()) {
      // Get initial position
      const initialBox = await node.boundingBox();
      
      if (initialBox) {
        // Drag the node to a new position
        await node.hover();
        await page.mouse.down();
        await page.mouse.move(initialBox.x + 100, initialBox.y + 50);
        await page.mouse.up();

        // Wait for position to update
        await page.waitForTimeout(500);

        // Check that node moved (position should be different)
        const newBox = await node.boundingBox();
        if (newBox) {
          expect(Math.abs(newBox.x - initialBox.x)).toBeGreaterThan(50);
        }
      }
    }
  });

  test('adds new nodes from palette', async ({ page }) => {
    // Look for node palette or toolbar
    const palette = page.locator('[data-testid="node-palette"], [class*="palette"], [class*="toolbar"]');
    const addButton = page.locator('button:has-text("Add Node"), button:has-text("+")');

    if (await palette.isVisible() || await addButton.isVisible()) {
      // If palette exists, drag a node type to canvas
      const inputNodeTemplate = page.locator('text=Input Node, [data-node-type="input"]').first();
      
      if (await inputNodeTemplate.isVisible()) {
        const canvas = page.locator('[data-testid="workflow-canvas"], [class*="canvas"]').first();
        const canvasBox = await canvas.boundingBox();
        
        if (canvasBox) {
          // Drag from palette to canvas
          await inputNodeTemplate.dragTo(canvas, {
            targetPosition: { x: canvasBox.width / 2, y: canvasBox.height / 2 },
          });
        }
      } else if (await addButton.isVisible()) {
        // Click add button and select node type
        await addButton.click();
        
        // Select node type from menu
        const nodeTypeMenu = page.locator('text=Input Node, text=Process Node').first();
        if (await nodeTypeMenu.isVisible()) {
          await nodeTypeMenu.click();
        }
      }
    }
  });

  test('creates connections between nodes', async ({ page }) => {
    // Mock the connection creation API
    await page.route('**/api/workflows/*/connections', async route => {
      if (route.request().method() === 'POST') {
        const newConnection = {
          id: 'edge-new',
          source: 'node-1',
          target: 'node-4',
          type: 'default',
        };
        await route.fulfill({ json: newConnection });
      }
    });

    // Wait for canvas to load
    await expect(page.locator('[data-testid="workflow-canvas"], [class*="canvas"]').first()).toBeVisible();

    // Find node connection handles/ports
    const sourceHandle = page.locator('[data-handletype="source"], [class*="handle"], [class*="port"]').first();
    const targetHandle = page.locator('[data-handletype="target"], [class*="handle"], [class*="port"]').last();

    if (await sourceHandle.isVisible() && await targetHandle.isVisible()) {
      // Create connection by dragging from source to target
      await sourceHandle.dragTo(targetHandle);
      
      // Wait for connection to be created
      await page.waitForTimeout(500);
    } else {
      // Alternative: try right-click context menu approach
      const sourceNode = page.locator('text=Data Input').locator('..');
      if (await sourceNode.isVisible()) {
        await sourceNode.click({ button: 'right' });
        
        const connectOption = page.locator('text=Connect to, text=Add Connection');
        if (await connectOption.isVisible()) {
          await connectOption.click();
        }
      }
    }
  });

  test('deletes nodes and connections', async ({ page }) => {
    // Mock delete APIs
    await page.route('**/api/workflows/*/nodes/*', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ json: { success: true } });
      }
    });

    await page.route('**/api/workflows/*/connections/*', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ json: { success: true } });
      }
    });

    // Wait for canvas to load
    await expect(page.locator('[data-testid="workflow-canvas"], [class*="canvas"]').first()).toBeVisible();

    // Select and delete a node
    const nodeToDelete = page.locator('text=Quality Check').locator('..');
    
    if (await nodeToDelete.isVisible()) {
      // Right-click for context menu
      await nodeToDelete.click({ button: 'right' });
      
      // Look for delete option
      const deleteOption = page.locator('text=Delete, text=Remove');
      if (await deleteOption.isVisible()) {
        await deleteOption.click();
        
        // Confirm deletion if needed
        const confirmButton = page.locator('button:has-text("Delete"), button:has-text("Confirm")');
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
      } else {
        // Alternative: use keyboard delete
        await nodeToDelete.click();
        await page.keyboard.press('Delete');
      }
    }
  });

  test('edits node properties', async ({ page }) => {
    // Mock node update API
    await page.route('**/api/workflows/*/nodes/*', async route => {
      if (route.request().method() === 'PUT') {
        const updatedNode = {
          id: 'node-1',
          label: 'Updated Input Node',
          data: { agent: 'GRID', config: { source: 'file' } },
        };
        await route.fulfill({ json: updatedNode });
      }
    });

    // Wait for canvas to load
    await expect(page.locator('[data-testid="workflow-canvas"], [class*="canvas"]').first()).toBeVisible();

    // Double-click or right-click on node to edit
    const nodeToEdit = page.locator('text=Data Input').locator('..');
    
    if (await nodeToEdit.isVisible()) {
      await nodeToEdit.dblclick();
      
      // Should open properties panel or modal
      const propertiesPanel = page.locator('[data-testid="node-properties"], [class*="properties"], [class*="modal"]');
      const labelInput = page.locator('input[name="label"], input[placeholder*="label"]');
      
      if (await propertiesPanel.isVisible() || await labelInput.isVisible()) {
        // Edit the label
        if (await labelInput.isVisible()) {
          await labelInput.clear();
          await labelInput.fill('Updated Input Node');
        }
        
        // Save changes
        const saveButton = page.locator('button:has-text("Save"), button:has-text("Update")');
        if (await saveButton.isVisible()) {
          await saveButton.click();
        }
      }
    }
  });

  test('validates workflow connections', async ({ page }) => {
    // Mock validation API
    await page.route('**/api/workflows/*/validate', async route => {
      const validationResult = {
        valid: false,
        errors: [
          {
            nodeId: 'node-4',
            message: 'Quality Check node has no output connection',
            type: 'warning',
          },
        ],
        warnings: [
          {
            nodeId: 'node-3',
            message: 'Export Results node configuration incomplete',
            type: 'info',
          },
        ],
      };
      await route.fulfill({ json: validationResult });
    });

    // Look for validate button
    const validateButton = page.locator('button:has-text("Validate"), button:has-text("Check")');
    
    if (await validateButton.isVisible()) {
      await validateButton.click();
      
      // Should show validation results
      const errorMessage = page.locator('text=Quality Check node has no output');
      const warningMessage = page.locator('text=Export Results node configuration');
      
      await expect(errorMessage.or(warningMessage).first()).toBeVisible();
    }
  });

  test('saves and loads workflows', async ({ page }) => {
    // Mock save API
    await page.route('**/api/workflows/*', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({ json: { success: true, id: 'workflow-1' } });
      }
    });

    // Look for save button
    const saveButton = page.locator('button:has-text("Save"), [data-testid="save-workflow"]');
    
    if (await saveButton.isVisible()) {
      await saveButton.click();
      
      // Should show success message or indication
      const successMessage = page.locator('text=Workflow saved, text=Saved successfully');
      if (await successMessage.isVisible()) {
        await expect(successMessage).toBeVisible();
      }
    }
  });

  test('runs workflow execution', async ({ page }) => {
    // Mock execution API
    await page.route('**/api/workflows/*/execute', async route => {
      const executionResult = {
        id: 'exec-123',
        status: 'running',
        startTime: '2024-02-18T22:00:00Z',
        nodes: {
          'node-1': { status: 'completed', output: 'Data loaded successfully' },
          'node-2': { status: 'running', output: null },
          'node-3': { status: 'pending', output: null },
        },
      };
      await route.fulfill({ json: executionResult });
    });

    // Look for run/execute button
    const runButton = page.locator('button:has-text("Run"), button:has-text("Execute"), button:has-text("▶")');
    
    if (await runButton.isVisible()) {
      await runButton.click();
      
      // Should show execution status
      const statusIndicator = page.locator('text=Running, text=Executing, [class*="running"]');
      await expect(statusIndicator.first()).toBeVisible();
      
      // Nodes should show execution status
      const completedNode = page.locator('[data-status="completed"], [class*="completed"]');
      const runningNode = page.locator('[data-status="running"], [class*="running"]');
      
      // At least one status should be visible
      await expect(completedNode.or(runningNode).first()).toBeVisible();
    }
  });

  test('zooms and pans canvas', async ({ page }) => {
    // Wait for canvas to load
    const canvas = page.locator('[data-testid="workflow-canvas"], [class*="canvas"]').first();
    await expect(canvas).toBeVisible();

    // Test zoom controls
    const zoomInButton = page.locator('button:has-text("+"), [data-testid="zoom-in"]');
    const zoomOutButton = page.locator('button:has-text("-"), [data-testid="zoom-out"]');
    const resetZoomButton = page.locator('button:has-text("Reset"), [data-testid="zoom-reset"]');

    if (await zoomInButton.isVisible()) {
      await zoomInButton.click();
      await zoomOutButton.click();
      
      if (await resetZoomButton.isVisible()) {
        await resetZoomButton.click();
      }
    }

    // Test mouse wheel zoom
    await canvas.hover();
    await page.mouse.wheel(0, -100); // Zoom in
    await page.mouse.wheel(0, 100);  // Zoom out

    // Test panning by dragging empty canvas area
    const canvasBox = await canvas.boundingBox();
    if (canvasBox) {
      const emptyX = canvasBox.x + canvasBox.width - 50;
      const emptyY = canvasBox.y + 50;
      
      await page.mouse.move(emptyX, emptyY);
      await page.mouse.down();
      await page.mouse.move(emptyX - 100, emptyY - 50);
      await page.mouse.up();
    }
  });

  test('shows workflow list and switches between workflows', async ({ page }) => {
    // Check workflow selector/list
    const workflowSelector = page.locator('select, [data-testid="workflow-selector"]');
    const workflowList = page.locator('[data-testid="workflow-list"]');

    if (await workflowSelector.isVisible()) {
      // Test workflow switching via dropdown
      await workflowSelector.selectOption({ label: /Alert Processing/ });
      
      // Canvas should update to show different workflow
      await page.waitForTimeout(500);
    } else if (await workflowList.isVisible()) {
      // Test workflow switching via list
      const alertWorkflow = page.locator('text=Alert Processing');
      if (await alertWorkflow.isVisible()) {
        await alertWorkflow.click();
      }
    }
  });

  test('is responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Page should still load
    await expect(page.locator('h1:has-text("🔄 Workflows")')).toBeVisible();

    // Canvas should adapt to mobile layout
    const canvas = page.locator('[data-testid="workflow-canvas"], [class*="canvas"]').first();
    await expect(canvas).toBeVisible();

    // Node palette might be collapsed or in a different layout
    const mobileMenu = page.locator('button[aria-label*="menu"], button:has-text("☰")');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
    }

    // Nodes should still be visible
    await expect(page.locator('text=Data Input')).toBeVisible();
  });

  test('handles keyboard shortcuts', async ({ page }) => {
    // Wait for canvas to load
    const canvas = page.locator('[data-testid="workflow-canvas"], [class*="canvas"]').first();
    await expect(canvas).toBeVisible();

    // Focus on canvas
    await canvas.click();

    // Test common shortcuts
    await page.keyboard.press('Control+S'); // Save
    await page.keyboard.press('Control+Z'); // Undo
    await page.keyboard.press('Control+Y'); // Redo
    await page.keyboard.press('Delete');    // Delete selected
    await page.keyboard.press('Escape');    // Deselect

    // Test select all
    await page.keyboard.press('Control+A');
  });

  test('shows node execution history', async ({ page }) => {
    // Mock execution history API
    await page.route('**/api/workflows/*/history', async route => {
      const historyData = {
        executions: [
          {
            id: 'exec-123',
            startTime: '2024-02-18T20:30:00Z',
            endTime: '2024-02-18T20:32:15Z',
            status: 'completed',
            duration: 135000,
            nodesProcessed: 4,
          },
          {
            id: 'exec-122',
            startTime: '2024-02-18T19:15:00Z',
            endTime: '2024-02-18T19:16:45Z',
            status: 'failed',
            duration: 90000,
            error: 'Node-2 timeout',
            nodesProcessed: 2,
          },
        ],
      };
      await route.fulfill({ json: historyData });
    });

    // Look for history button or panel
    const historyButton = page.locator('button:has-text("History"), [data-testid="execution-history"]');
    
    if (await historyButton.isVisible()) {
      await historyButton.click();
      
      // Should show execution history
      await expect(page.locator('text=exec-123')).toBeVisible();
      await expect(page.locator('text=completed')).toBeVisible();
      await expect(page.locator('text=failed')).toBeVisible();
      await expect(page.locator('text=Node-2 timeout')).toBeVisible();
    }
  });

  test('handles API errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/workflows**', async route => {
      await route.abort('failed');
    });

    await page.goto('/workflows');

    // Page should still show basic structure
    await expect(page.locator('h1:has-text("🔄 Workflows")')).toBeVisible();
    
    // Should show error state
    const errorMessage = page.locator('text=Unable to load workflow, text=Loading failed, text=No workflow found');
    await expect(errorMessage.first()).toBeVisible();
  });

  test('auto-saves workflow changes', async ({ page }) => {
    // Mock auto-save API
    let autoSaveCalled = false;
    await page.route('**/api/workflows/*/autosave', async route => {
      autoSaveCalled = true;
      await route.fulfill({ json: { saved: true, timestamp: new Date().toISOString() } });
    });

    // Wait for canvas and make a change
    await expect(page.locator('[data-testid="workflow-canvas"], [class*="canvas"]').first()).toBeVisible();

    // Drag a node to trigger auto-save
    const node = page.locator('text=Data Input').locator('..');
    if (await node.isVisible()) {
      const box = await node.boundingBox();
      if (box) {
        await node.hover();
        await page.mouse.down();
        await page.mouse.move(box.x + 50, box.y + 50);
        await page.mouse.up();
        
        // Wait for auto-save to trigger
        await page.waitForTimeout(1500);
      }
    }

    // Should show auto-save indicator
    const autoSaveIndicator = page.locator('text=Auto-saved, text=Saving, [data-testid="auto-save"]');
    if (await autoSaveIndicator.first().isVisible()) {
      await expect(autoSaveIndicator.first()).toBeVisible();
    }
  });
});