import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Running global teardown...');

  try {
    // Clean up test data
    // This could include:
    // - Removing test users
    // - Clearing test database
    // - Stopping mock services
    // - Cleaning up temporary files

    // Example: Clean up any test artifacts
    const fs = require('fs');
    const path = require('path');

    // Optional: Clean up old screenshot artifacts (keep last N runs)
    const maxScreenshotRuns = 5;
    const screenshotDir = path.join(process.cwd(), 'test-results');
    
    if (fs.existsSync(screenshotDir)) {
      const files = fs.readdirSync(screenshotDir);
      const screenshotFiles = files
        .filter((file: string) => file.includes('screenshot'))
        .sort()
        .reverse();

      // Keep only the most recent screenshot runs
      const filesToDelete = screenshotFiles.slice(maxScreenshotRuns);
      
      filesToDelete.forEach((file: string) => {
        const filePath = path.join(screenshotDir, file);
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.warn(`Could not delete ${file}:`, error);
        }
      });

      if (filesToDelete.length > 0) {
        console.log(`🗑️  Cleaned up ${filesToDelete.length} old screenshot files`);
      }
    }

    // Generate test summary
    const summaryPath = path.join(process.cwd(), 'test-results', 'test-summary.json');
    const summary = {
      timestamp: new Date().toISOString(),
      testRun: {
        completed: true,
        duration: Date.now() - (global as any).testStartTime,
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      config: {
        projects: config.projects?.map(p => p.name) || [],
        workers: config.workers,
        retries: config.retries,
      },
    };

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log('📊 Test summary written to test-results/test-summary.json');

    // Optional: Upload test results to external service
    // if (process.env.CI && process.env.UPLOAD_RESULTS) {
    //   await uploadTestResults();
    // }

    // Optional: Send notifications about test completion
    // if (process.env.SLACK_WEBHOOK_URL) {
    //   await sendSlackNotification(summary);
    // }

    console.log('✅ Global teardown completed successfully');

  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

// Helper function to upload test results (example)
async function uploadTestResults() {
  console.log('📤 Uploading test results...');
  // Implement your test result upload logic here
  // This could be to S3, test reporting service, etc.
}

// Helper function to send Slack notification (example)
async function sendSlackNotification(summary: any) {
  console.log('💬 Sending test completion notification...');
  // Implement Slack webhook notification here
  
  try {
    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (!webhook) return;

    const message = {
      text: `🧪 E2E Tests Completed`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*E2E Test Suite Completed*\n` +
                  `Duration: ${Math.round(summary.testRun.duration / 1000)}s\n` +
                  `Projects: ${summary.config.projects.join(', ')}\n` +
                  `Environment: ${summary.environment.platform} ${summary.environment.arch}`
          }
        }
      ]
    };

    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (response.ok) {
      console.log('✅ Slack notification sent');
    } else {
      console.warn('⚠️ Failed to send Slack notification');
    }
  } catch (error) {
    console.warn('⚠️ Slack notification error:', error);
  }
}

export default globalTeardown;