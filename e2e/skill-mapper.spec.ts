import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function dismissOnboarding(page: Page) {
  try {
    const skipButton = page.getByRole('button', { name: /skip and start from scratch/i });
    await skipButton.waitFor({ state: 'visible', timeout: 2000 });
    await skipButton.click();
  } catch {
    // already dismissed / not shown
  }
}

async function openUtility(page: Page, name: RegExp) {
  await page.getByRole('toolbar', { name: /utility tools/i }).getByRole('button', { name }).click();
}

test.describe('Skill Mapper - Core Functionality', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
    await expect(page.locator('aside[aria-label="Game statistics"]').getByText(/Operator/i)).toBeVisible();
    await expect(page.locator('aside[aria-label="Game statistics"]').getByText(/Lvl\s+\d+/i)).toBeVisible();
  });

  test('should display skill nodes', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
    const nodes = await page.locator('[data-id]').count();
    expect(nodes).toBeGreaterThan(0);
  });

  test('should allow clicking on available skills', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
    await dismissOnboarding(page);

    const availableSkill = page.locator('[data-status="available"]').first();
    if (await availableSkill.count() > 0) {
      await availableSkill.click();
      await expect(page.getByRole('dialog', { name: /.+/ })).toBeVisible();
    }
  });

  test('should toggle sound', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
    await dismissOnboarding(page);
    await page.getByRole('button', { name: /sound|volume/i }).click();
  });

  test('should open stats panel', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
    await dismissOnboarding(page);

    await openUtility(page, /view statistics|statistics/i);
    await expect(page.getByRole('dialog', { name: /learning statistics/i })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: /learning statistics/i })).not.toBeVisible();
  });

  test('should open analytics dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
    await dismissOnboarding(page);

    await openUtility(page, /analytics/i);
    await expect(page.getByRole('dialog', { name: /learning analytics|analytics/i })).toBeVisible();
  });

  test('should navigate with keyboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape');
  });
});

test.describe('Accessibility Tests', () => {
  test('should not have automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });

    const liveRegions = page.locator('[aria-live]');
    expect(await liveRegions.count()).toBeGreaterThan(0);

    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      const title = await button.getAttribute('title');

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
    await dismissOnboarding(page);

    await openUtility(page, /view statistics|statistics/i);
    await expect(page.getByRole('dialog', { name: /learning statistics/i })).toBeVisible();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Daily Challenge', exact: true }).click();
    await expect(page.getByText(/Daily Challenge:/i)).toBeVisible();
  });

  test('share progress can be opened from HUD', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.react-flow', { timeout: 10000 });
    await dismissOnboarding(page);

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

    const swSupported = await page.evaluate(() => 'serviceWorker' in navigator);
    expect(swSupported).toBeTruthy();

    // In development next-pwa is disabled; production serves /sw.js.
    const swResponse = await page.request.get('/sw.js');
    expect([200, 404]).toContain(swResponse.status());
  });
});
