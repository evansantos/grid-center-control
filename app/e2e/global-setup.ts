import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Create a browser instance for initial setup
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the application to ensure it's running
    console.log('🚀 Setting up test environment...');
    await page.goto(config.webServer?.url || 'http://localhost:3000');
    
    // Wait for the app to be ready
    await page.waitForSelector('h1', { timeout: 30000 });
    console.log('✅ Application is ready for testing');

    // Optional: Seed test data or perform authentication
    // This could include:
    // - Creating test users
    // - Seeding database with test data
    // - Setting up mock services
    // - Generating authentication tokens

    // Example: Clear any existing data and seed fresh test data
    try {
      // Mock API calls during setup if needed
      await page.route('**/api/**', async (route) => {
        // Allow API calls during setup
        await route.continue();
      });

      // Perform any initialization API calls
      // await page.request.post('/api/test/seed', { data: testData });
      
    } catch (error) {
      console.warn('Warning: Could not seed test data:', error);
    }

    // Create baseline screenshots directory if it doesn't exist
    const fs = require('fs');
    const path = require('path');
    
    const screenshotDirs = [
      'test-results',
      'test-results/screenshots',
      'test-results/visual-regression',
    ];

    screenshotDirs.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    });

    console.log('🎯 Global setup completed successfully');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await page.close();
    await browser.close();
  }
}

export default globalSetup;