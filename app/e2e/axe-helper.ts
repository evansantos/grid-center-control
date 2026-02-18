import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Run axe accessibility scan on the current page
 * @param page - Playwright page object
 * @param testName - Name of the test for better error reporting
 */
export async function checkA11y(page: Page, testName?: string) {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();

  // Log any violations found for debugging
  if (accessibilityScanResults.violations.length > 0) {
    console.log(`\n🚨 Accessibility violations found${testName ? ` in ${testName}` : ''}:`);
    accessibilityScanResults.violations.forEach((violation, index) => {
      console.log(`\n${index + 1}. ${violation.id} (${violation.impact})`);
      console.log(`   Description: ${violation.description}`);
      console.log(`   Help: ${violation.helpUrl}`);
      console.log(`   Nodes affected: ${violation.nodes.length}`);
      violation.nodes.forEach((node, nodeIndex) => {
        console.log(`     ${nodeIndex + 1}. ${node.target[0]} - ${node.failureSummary}`);
      });
    });
  }

  // Only fail on critical and serious violations for now
  const criticalViolations = accessibilityScanResults.violations.filter(
    violation => violation.impact === 'critical' || violation.impact === 'serious'
  );

  expect(criticalViolations, `Found ${criticalViolations.length} critical/serious accessibility violations`).toHaveLength(0);

  return accessibilityScanResults;
}

/**
 * Check for proper heading hierarchy on the page
 * @param page - Playwright page object
 */
export async function checkHeadingHierarchy(page: Page) {
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
  const headingLevels: number[] = [];
  
  for (const heading of headings) {
    const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
    const level = parseInt(tagName.charAt(1));
    headingLevels.push(level);
  }
  
  if (headingLevels.length === 0) {
    console.warn('⚠️  No headings found on the page');
    return;
  }
  
  // Check if it starts with h1
  expect(headingLevels[0], 'Page should start with h1').toBe(1);
  
  // Check for proper hierarchy (no skipping levels)
  for (let i = 1; i < headingLevels.length; i++) {
    const currentLevel = headingLevels[i];
    const prevLevel = headingLevels[i - 1];
    
    // Allow same level, one level down, or any level up
    const validTransition = 
      currentLevel === prevLevel ||           // Same level
      currentLevel === prevLevel + 1 ||      // One level down
      currentLevel < prevLevel;              // Any level up
    
    expect(validTransition, 
      `Invalid heading hierarchy: h${prevLevel} followed by h${currentLevel} at position ${i}`
    ).toBeTruthy();
  }
  
  console.log(`✅ Heading hierarchy check passed. Levels: ${headingLevels.join(' → ')}`);
}

/**
 * Check if skip navigation link is present and functional
 * @param page - Playwright page object
 */
export async function checkSkipNavigation(page: Page) {
  const skipLink = page.getByRole('link', { name: /skip to main content|skip navigation|skip to content/i });
  
  if (await skipLink.count() === 0) {
    console.warn('⚠️  No skip navigation link found');
    return false;
  }
  
  // Check if skip link is initially hidden but focusable
  await skipLink.focus();
  await expect(skipLink).toBeVisible();
  
  // Check if it has proper href
  const href = await skipLink.getAttribute('href');
  expect(href, 'Skip link should have href pointing to main content').toMatch(/#main|#content|#skip-target/);
  
  console.log('✅ Skip navigation link found and functional');
  return true;
}