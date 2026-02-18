import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Run axe accessibility scan on the current page
 * @param page - Playwright page object
 * @param testName - Name of the test for better error reporting
 * @param options - Additional options for axe scanning
 */
export async function checkA11y(
  page: Page, 
  testName?: string,
  options: {
    includeIncomplete?: boolean;
    disableRules?: string[];
    enableRules?: string[];
  } = {}
) {
  const builder = new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa']);

  // Apply optional configurations
  if (options.disableRules) {
    builder.disableRules(options.disableRules);
  }
  if (options.enableRules) {
    builder.withRules(options.enableRules);
  }

  const accessibilityScanResults = await builder.analyze();

  // Log summary
  const totalViolations = accessibilityScanResults.violations.length;
  const criticalCount = accessibilityScanResults.violations.filter(v => v.impact === 'critical').length;
  const seriousCount = accessibilityScanResults.violations.filter(v => v.impact === 'serious').length;
  const moderateCount = accessibilityScanResults.violations.filter(v => v.impact === 'moderate').length;
  const minorCount = accessibilityScanResults.violations.filter(v => v.impact === 'minor').length;

  if (totalViolations > 0) {
    console.log(`\n🔍 Accessibility scan results${testName ? ` for ${testName}` : ''}:`);
    console.log(`   Total violations: ${totalViolations}`);
    if (criticalCount > 0) console.log(`   Critical: ${criticalCount}`);
    if (seriousCount > 0) console.log(`   Serious: ${seriousCount}`);
    if (moderateCount > 0) console.log(`   Moderate: ${moderateCount}`);
    if (minorCount > 0) console.log(`   Minor: ${minorCount}`);
  }

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

  // Log success message if no violations
  if (totalViolations === 0) {
    console.log(`✅ No accessibility violations found${testName ? ` in ${testName}` : ''}`);
  }

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

/**
 * Check keyboard navigation functionality
 * @param page - Playwright page object
 */
export async function checkKeyboardNavigation(page: Page) {
  // Start from the beginning of the page
  await page.keyboard.press('Home');
  
  // Tab through interactive elements and ensure they're focusable
  const interactiveElements = await page.locator('button, a, input, select, textarea, [tabindex="0"]').all();
  
  if (interactiveElements.length === 0) {
    console.warn('⚠️  No interactive elements found for keyboard navigation test');
    return false;
  }
  
  let focusableElements = 0;
  
  // Tab through elements (limit to prevent infinite loops)
  for (let i = 0; i < Math.min(10, interactiveElements.length); i++) {
    await page.keyboard.press('Tab');
    const activeElement = page.locator(':focus');
    
    if (await activeElement.count() > 0) {
      focusableElements++;
    }
  }
  
  const success = focusableElements > 0;
  if (success) {
    console.log(`✅ Keyboard navigation working - ${focusableElements} elements focusable`);
  } else {
    console.warn('⚠️  Keyboard navigation may not be working properly');
  }
  
  return success;
}

/**
 * Check color contrast for text elements
 * @param page - Playwright page object
 */
export async function checkColorContrast(page: Page) {
  // This is a simplified check - axe-core does the comprehensive color contrast testing
  // This function serves as an additional manual check reminder
  
  const textElements = await page.locator('p, span, div, h1, h2, h3, h4, h5, h6, a, button').all();
  
  if (textElements.length === 0) {
    console.warn('⚠️  No text elements found for contrast checking');
    return false;
  }
  
  console.log(`ℹ️  Color contrast checked by axe-core for ${textElements.length} text elements`);
  console.log('   Ensure manual review for: gradients, images with text, dynamic colors');
  
  return true;
}

/**
 * Check form accessibility
 * @param page - Playwright page object
 */
export async function checkFormAccessibility(page: Page) {
  const formElements = await page.locator('form').all();
  
  if (formElements.length === 0) {
    console.log('ℹ️  No forms found on this page');
    return true;
  }
  
  let issuesFound = 0;
  
  for (let i = 0; i < formElements.length; i++) {
    const form = formElements[i];
    
    // Check for inputs without labels
    const inputs = await form.locator('input, textarea, select').all();
    
    for (const input of inputs) {
      const inputId = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      
      let hasLabel = false;
      
      if (inputId) {
        const label = await page.locator(`label[for="${inputId}"]`).count();
        if (label > 0) hasLabel = true;
      }
      
      if (ariaLabel || ariaLabelledby) {
        hasLabel = true;
      }
      
      if (!hasLabel) {
        const inputType = await input.getAttribute('type');
        const placeholder = await input.getAttribute('placeholder');
        console.warn(`⚠️  Input element (type: ${inputType}) missing proper label. Has placeholder: ${!!placeholder}`);
        issuesFound++;
      }
    }
  }
  
  const success = issuesFound === 0;
  if (success) {
    console.log(`✅ Form accessibility check passed for ${formElements.length} forms`);
  } else {
    console.warn(`⚠️  Found ${issuesFound} form accessibility issues`);
  }
  
  return success;
}

/**
 * Check ARIA attributes usage
 * @param page - Playwright page object
 */
export async function checkARIAUsage(page: Page) {
  const elementsWithAria = await page.locator('[aria-label], [aria-labelledby], [aria-describedby], [role]').all();
  
  if (elementsWithAria.length === 0) {
    console.log('ℹ️  No ARIA attributes found (this may be fine for simple pages)');
    return true;
  }
  
  console.log(`ℹ️  Found ${elementsWithAria.length} elements with ARIA attributes`);
  
  // Check for common ARIA issues
  let issuesFound = 0;
  
  for (const element of elementsWithAria) {
    const ariaLabelledby = await element.getAttribute('aria-labelledby');
    
    if (ariaLabelledby) {
      const referencedElements = await page.locator(`#${ariaLabelledby}`).count();
      if (referencedElements === 0) {
        console.warn(`⚠️  aria-labelledby references non-existent element: ${ariaLabelledby}`);
        issuesFound++;
      }
    }
  }
  
  const success = issuesFound === 0;
  if (success) {
    console.log('✅ ARIA usage check passed');
  }
  
  return success;
}

/**
 * Comprehensive accessibility check combining multiple tests
 * @param page - Playwright page object
 * @param testName - Name of the test for better error reporting
 */
export async function checkA11yComprehensive(page: Page, testName?: string) {
  console.log(`\n🔍 Running comprehensive accessibility checks${testName ? ` for ${testName}` : ''}...`);
  
  const results = {
    axeCore: await checkA11y(page, testName),
    headingHierarchy: await checkHeadingHierarchy(page),
    skipNavigation: await checkSkipNavigation(page),
    keyboardNavigation: await checkKeyboardNavigation(page),
    colorContrast: await checkColorContrast(page),
    formAccessibility: await checkFormAccessibility(page),
    ariaUsage: await checkARIAUsage(page)
  };
  
  console.log(`✨ Comprehensive accessibility check completed${testName ? ` for ${testName}` : ''}`);
  
  return results;
}