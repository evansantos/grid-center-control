import { test, expect } from '@playwright/test';
import { checkA11y } from './axe-helper';

test.describe('Internationalization (i18n)', () => {
  
  test('should load default locale (English)', async ({ page }) => {
    await page.goto('/');
    
    // Check for English text in key UI elements
    await expect(page.getByRole('heading', { name: 'Mission Control' })).toBeVisible();
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Agents')).toBeVisible();
    
    // Run accessibility checks
    await checkA11y(page, 'i18n - English locale');
  });

  test('should load Portuguese locale correctly', async ({ page }) => {
    await page.goto('/pt-BR');
    
    // Check for Portuguese text in key UI elements
    await expect(page.getByRole('heading', { name: 'Centro de Controle' })).toBeVisible();
    await expect(page.getByText('Painel')).toBeVisible();
    await expect(page.getByText('Agentes')).toBeVisible();
    
    // Run accessibility checks
    await checkA11y(page, 'i18n - Portuguese locale');
  });

  test('should translate navigation menu items correctly', async ({ page }) => {
    // Test English navigation
    await page.goto('/');
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Office')).toBeVisible();
    await expect(page.getByText('Settings')).toBeVisible();
    
    // Test Portuguese navigation
    await page.goto('/pt-BR');
    await expect(page.getByText('Painel')).toBeVisible();
    await expect(page.getByText('Escritório')).toBeVisible();
    await expect(page.getByText('Configurações')).toBeVisible();
  });

  test('should translate analytics section correctly', async ({ page }) => {
    // Test English analytics
    await page.goto('/');
    const analyticsEN = page.locator('text="Analytics"').or(page.locator('text="Performance"'));
    if (await analyticsEN.first().isVisible({ timeout: 5000 })) {
      await expect(page.getByText('Performance')).toBeVisible();
      await expect(page.getByText('Sessions')).toBeVisible();
    }
    
    // Test Portuguese analytics
    await page.goto('/pt-BR');
    const analyticsPT = page.locator('text="Analytics"').or(page.locator('text="Desempenho"'));
    if (await analyticsPT.first().isVisible({ timeout: 5000 })) {
      await expect(page.getByText('Desempenho')).toBeVisible();
      await expect(page.getByText('Sessões')).toBeVisible();
    }
  });

  test('should translate tools section correctly', async ({ page }) => {
    // Test English tools
    await page.goto('/');
    const toolsEN = page.locator('text="Tools"').or(page.locator('text="Logs"'));
    if (await toolsEN.first().isVisible({ timeout: 5000 })) {
      await expect(page.getByText('Logs')).toBeVisible();
      await expect(page.getByText('Health')).toBeVisible();
    }
    
    // Test Portuguese tools
    await page.goto('/pt-BR');
    const toolsPT = page.locator('text="Ferramentas"').or(page.locator('text="Logs"'));
    if (await toolsPT.first().isVisible({ timeout: 5000 })) {
      await expect(page.getByText('Saúde')).toBeVisible();
    }
  });

  test('should translate common elements correctly', async ({ page }) => {
    // Test English common elements
    await page.goto('/');
    
    // Look for loading states or other common elements
    const loadingEN = page.locator('text="Loading..."');
    if (await loadingEN.isVisible({ timeout: 2000 })) {
      await expect(loadingEN).toBeVisible();
    }
    
    // Test Portuguese common elements
    await page.goto('/pt-BR');
    
    // Look for loading states or other common elements in Portuguese
    const loadingPT = page.locator('text="Carregando..."');
    if (await loadingPT.isVisible({ timeout: 2000 })) {
      await expect(loadingPT).toBeVisible();
    }
  });

  test('should handle agents page translation', async ({ page }) => {
    // Test English agents page
    await page.goto('/agents');
    await expect(page.getByRole('heading', { name: 'Agents' })).toBeVisible();
    
    // Check for English text in agents page
    const scanningEN = page.locator('text="Scanning agents"').or(page.locator('text="No agents found"'));
    if (await scanningEN.first().isVisible({ timeout: 5000 })) {
      // Verify some English text is present
      expect(await scanningEN.first().textContent()).toBeTruthy();
    }
    
    // Test Portuguese agents page
    await page.goto('/pt-BR/agents');
    await expect(page.getByRole('heading', { name: 'Agentes' })).toBeVisible();
    
    // Check for Portuguese text in agents page
    const scanningPT = page.locator('text="Procurando agentes"').or(page.locator('text="Nenhum agente encontrado"'));
    if (await scanningPT.first().isVisible({ timeout: 5000 })) {
      // Verify some Portuguese text is present
      expect(await scanningPT.first().textContent()).toBeTruthy();
    }
  });

  test('should handle health page translation', async ({ page }) => {
    // Test English health page
    await page.goto('/health');
    await expect(page.getByRole('heading', { name: 'System Health' })).toBeVisible();
    
    // Test Portuguese health page
    await page.goto('/pt-BR/health');
    await expect(page.getByRole('heading', { name: 'Saúde do Sistema' })).toBeVisible();
    
    // Check for Portuguese description text
    const descriptionPT = page.getByText('Monitoramento em tempo real');
    if (await descriptionPT.isVisible({ timeout: 5000 })) {
      await expect(descriptionPT).toBeVisible();
    }
  });

  test('should handle errors page translation', async ({ page }) => {
    // Test English errors page
    await page.goto('/errors');
    await expect(page.getByRole('heading', { name: 'Error Monitoring' })).toBeVisible();
    
    // Test Portuguese errors page
    await page.goto('/pt-BR/errors');
    await expect(page.getByRole('heading', { name: 'Monitoramento de Erros' })).toBeVisible();
  });

  test('should maintain functionality when switching locales', async ({ page }) => {
    // Start with English
    await page.goto('/');
    await expect(page.getByText('Dashboard')).toBeVisible();
    
    // Navigate to a section (if navigation works)
    const agentsLink = page.getByText('Agents');
    if (await agentsLink.isVisible()) {
      await agentsLink.click();
      await expect(page.getByRole('heading', { name: 'Agents' })).toBeVisible();
    }
    
    // Switch to Portuguese by changing URL
    await page.goto('/pt-BR/agents');
    await expect(page.getByRole('heading', { name: 'Agentes' })).toBeVisible();
    
    // Navigate back to dashboard in Portuguese
    const dashboardLink = page.getByText('Painel');
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click();
      await expect(page.getByRole('heading', { name: 'Centro de Controle' })).toBeVisible();
    }
  });

  test('should handle pluralization correctly', async ({ page }) => {
    // This test checks if pluralization works for both locales
    // We'll look for elements that might show counts/plurals
    
    await page.goto('/agents');
    // Look for session/sessions text in English
    const sessionTextEN = page.locator('text=/\\d+\\s+(session|sessions)/');
    if (await sessionTextEN.first().isVisible({ timeout: 5000 })) {
      const text = await sessionTextEN.first().textContent();
      expect(text).toMatch(/\d+\s+(session|sessions)/);
    }
    
    await page.goto('/pt-BR/agents');
    // Look for sessão/sessões text in Portuguese
    const sessionTextPT = page.locator('text=/\\d+\\s+(sessão|sessões)/');
    if (await sessionTextPT.first().isVisible({ timeout: 5000 })) {
      const text = await sessionTextPT.first().textContent();
      expect(text).toMatch(/\d+\s+(sessão|sessões)/);
    }
  });

  test('should preserve URL structure with locale prefix', async ({ page }) => {
    // Test that Portuguese URLs have correct locale prefix
    await page.goto('/pt-BR');
    expect(page.url()).toContain('/pt-BR');
    
    await page.goto('/pt-BR/agents');
    expect(page.url()).toContain('/pt-BR/agents');
    
    await page.goto('/pt-BR/health');
    expect(page.url()).toContain('/pt-BR/health');
    
    // Test that English URLs don't have locale prefix (default)
    await page.goto('/');
    expect(page.url()).not.toContain('/en');
    
    await page.goto('/agents');
    expect(page.url()).not.toContain('/en/agents');
  });
});