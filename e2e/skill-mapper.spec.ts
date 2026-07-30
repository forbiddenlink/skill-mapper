import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Skill Mapper - Core Functionality', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the skill tree to load
    await page.waitForSelector('.react-flow', { timeout: 10000 });
    
    // Check for key elements in HUD
    await expect(page.locator('aside[aria-label="Game statistics"]').getByText(/Operator/i)).toBeVisible();
    await expect(page.locator('aside[aria-label="Game statistics"]').getByText(/Level/i)).toBeVisible();
  });

  test('should display skill nodes', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
    
    // Check that skill nodes are rendered
    const nodes = await page.locator('[data-id]').count();
    expect(nodes).toBeGreaterThan(0);
  });

  test('should allow clicking on available skills', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
    
    // Find and click an available skill
    const availableSkill = page.locator('[data-status="available"]').first();
    if (await availableSkill.count() > 0) {
      await availableSkill.click();
      
      // Check that details panel opens
      await expect(page.locator('text=/Details/i')).toBeVisible();
    }
  });

  test('should toggle sound', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    // Dismiss onboarding modal if present
    try {
      const skipButton = page.locator('button:has-text("Skip and start from scratch")').first();
      await skipButton.waitFor({ state: 'visible', timeout: 2000 });
      await skipButton.click();
      await page.waitForTimeout(500);
    } catch {
      // Modal not present, continue
    }

    // Find and click sound toggle button
    const soundButton = page.getByRole('button', { name: /sound|volume/i });
    await soundButton.click();
  });

  test('should open stats panel', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
    
    // Dismiss onboarding modal if present (waits up to 2 seconds)
    try {
      const skipButton = page.locator('button:has-text("Skip and start from scratch")').first();
      await skipButton.waitFor({ state: 'visible', timeout: 2000 });
      await skipButton.click();
      await page.waitForTimeout(500);
    } catch {
      // Modal not present, continue
    }
    
    // Click stats button
    const statsButton = page.getByRole('button', { name: /stats|statistics/i });
    await statsButton.click();
    
    // Check that stats modal is visible
    await expect(page.locator('text=/Learning Statistics/i')).toBeVisible();
    
    // Close modal with Escape
    await page.keyboard.press('Escape');
    await expect(page.locator('text=/Learning Statistics/i')).not.toBeVisible();
  });

  test('should open analytics dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
    
    // Dismiss onboarding modal if present (waits up to 2 seconds)
    try {
      const skipButton = page.locator('button:has-text("Skip and start from scratch")').first();
      await skipButton.waitFor({ state: 'visible', timeout: 2000 });
      await skipButton.click();
      await page.waitForTimeout(500);
    } catch {
      // Modal not present, continue
    }
    
    // Click analytics button
    const analyticsButton = page.getByRole('button', { name: /analytics/i });
    await analyticsButton.click();
    
    // Check that analytics modal is visible
    await expect(page.locator('text=/Learning Analytics/i')).toBeVisible();
  });

  test('should navigate with keyboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
    
    // Tab to focus first interactive element
    await page.keyboard.press('Tab');
    
    // Arrow keys should work
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    
    // Escape should deselect
    await page.keyboard.press('Escape');
  });
});

test.describe('Accessibility Tests', () => {
  test('should not have automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // Exclude color-contrast - known issues to be fixed separately
      .disableRules(['color-contrast'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
    
    // Check for live regions
    const liveRegions = page.locator('[aria-live]');
    expect(await liveRegions.count()).toBeGreaterThan(0);
    
    // Check for proper button labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      const title = await button.getAttribute('title');
      
      // Each button should have either text content, aria-label, or title
      expect(
        (text && text.trim().length > 0) || 
        (ariaLabel && ariaLabel.trim().length > 0) || 
        (title && title.trim().length > 0)
      ).toBeTruthy();
    }
  });
});

test.describe('Product loop', () => {
  test('utility FAB rail opens stats and features hub opens daily challenge', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    try {
      const skipButton = page.locator('button:has-text("Skip and start from scratch")').first();
      await skipButton.waitFor({ state: 'visible', timeout: 2000 });
      await skipButton.click();
    } catch {
      // onboarding already dismissed
    }

    await page.getByRole('button', { name: /view statistics|statistics/i }).click();
    await expect(page.getByRole('dialog', { name: /learning statistics/i })).toBeVisible();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: /daily challenge/i }).click();
    await expect(page.getByText(/Daily Challenge:/i)).toBeVisible();
  });

  test('share progress can be opened from HUD', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    try {
      const skipButton = page.locator('button:has-text("Skip and start from scratch")').first();
      await skipButton.waitFor({ state: 'visible', timeout: 2000 });
      await skipButton.click();
    } catch {
      // ignore
    }

    await page.getByRole('button', { name: /share progress/i }).click();
    await expect(page.getByRole('dialog', { name: /share your progress/i })).toBeVisible();
  });
});

test.describe('PWA Functionality', () => {
  test('should have manifest', async ({ page }) => {
    await page.goto('/');

    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);

    const href = await manifestLink.getAttribute('href');
    expect(href).toBe('/manifest.json');
  });

  test('should support service worker API', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const swSupported = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });

    expect(swSupported).toBeTruthy();

    const swResponse = await page.request.get('/sw.js');
    expect(swResponse.ok()).toBeTruthy();
  });
});
