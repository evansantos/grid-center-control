import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    // GitHub Actions reporter removed due to type conflicts
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Capture video on failure */
    video: 'retain-on-failure',

    /* CI-specific optimizations */
    ...(process.env.CI && {
      // Animations disabled via CSS for consistent screenshots
      // Use consistent fonts and rendering
      ignoreHTTPSErrors: true,
      // Longer timeout for CI environments
      actionTimeout: 15000,
    }),
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against tablet viewports */
    {
      name: 'Tablet Chrome',
      use: { ...devices['iPad Pro'] },
    },

    /* Custom viewport sizes for specific testing */
    {
      name: 'Desktop Large',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    
    {
      name: 'Desktop Small',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 },
      },
    },

    /* Visual regression testing - consistent environment */
    {
      name: 'visual-regression',
      use: {
        ...devices['Desktop Chrome'],
        // Fixed viewport for consistent screenshots
        viewport: { width: 1280, height: 720 },
        // Consistent user agent and device pixel ratio
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        deviceScaleFactor: 1,
        // Disable animations for stable screenshots (handled by CSS)
        // Longer timeouts for visual tests
        actionTimeout: 30000,
        navigationTimeout: 30000,
        // Always take screenshots for visual regression
        screenshot: 'only-on-failure',
        // Additional CI optimizations
        ...(process.env.CI && {
          // Force GPU rendering off for consistency
          launchOptions: {
            args: [
              '--disable-gpu',
              '--disable-dev-shm-usage',
              '--disable-web-security',
              '--disable-background-timer-throttling',
              '--disable-backgrounding-occluded-windows',
              '--disable-renderer-backgrounding',
              '--disable-features=TranslateUI',
              '--no-first-run',
              '--no-default-browser-check',
              '--font-render-hinting=none',
              '--disable-font-subpixel-positioning',
            ],
          },
        }),
      },
      testMatch: '**/visual-regression.spec.ts',
    },
  ],

  /* Configure test match patterns */
  testMatch: [
    '**/*.spec.ts',
    '**/*.test.ts',
  ],

  /* Control which tests run in different contexts */
  testIgnore: process.env.CI && !process.env.VISUAL_REGRESSION_UPDATE_SNAPSHOTS && !process.env.RUN_VISUAL_TESTS
    ? ['**/visual-regression.spec.ts'] // Skip visual tests in regular CI runs
    : undefined,

  /* Global setup and teardown */
  globalSetup: require.resolve('./e2e/global-setup.ts'),
  globalTeardown: require.resolve('./e2e/global-teardown.ts'),

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'test-results/',

  /* Configure expect options */
  expect: {
    /* Maximum time expect() should wait for the condition to be met. */
    timeout: 10000,
    
    /* Threshold for screenshot comparisons - more lenient for CI */
    toHaveScreenshot: {
      threshold: process.env.CI ? 0.3 : 0.2,
      // CI-specific animation handling
      animations: process.env.CI ? 'disabled' : 'allow',
      // Clipping handled by viewport size and CSS
    },
    
    /* Threshold for visual comparisons */
    toMatchSnapshot: {
      threshold: process.env.CI ? 0.3 : 0.2,
    },
  },

  /* Web server configuration */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    
    /* How long to wait for the server to start */
    timeout: 120 * 1000,
    
    /* Environment variables for the web server */
    env: {
      NODE_ENV: 'test',
      // Disable analytics and external services in tests
      DISABLE_ANALYTICS: 'true',
      DISABLE_TELEMETRY: 'true',
      // Visual regression specific environment
      VISUAL_REGRESSION_MODE: 'true',
      // Disable animations and transitions for consistent screenshots
      DISABLE_ANIMATIONS: process.env.CI ? 'true' : 'false',
    },
  },

  /* Test timeout - longer for visual regression */
  timeout: process.env.CI ? 60 * 1000 : 30 * 1000,

  /* Metadata for visual regression tracking */
  metadata: {
    'visual-regression': {
      baselineDir: './e2e/visual-regression-screenshots',
      updateBaselines: process.env.VISUAL_REGRESSION_UPDATE_SNAPSHOTS === 'true',
      environment: process.env.CI ? 'ci' : 'local',
    },
  },
});