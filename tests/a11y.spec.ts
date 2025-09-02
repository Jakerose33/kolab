import { test, expect } from './fixtures/hardening';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/events', '/venues', '/auth', '/auth/signup', '/auth/forgot-password'];

for (const route of routes) {
  test(`Accessibility scan: ${route}`, async ({ page, baseURL }) => {
    await page.goto(`${baseURL}${route}`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
}

test('Keyboard navigation works', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/`);
  await page.waitForLoadState('networkidle');

  // Test tab navigation
  await page.keyboard.press('Tab');
  const focusedElement = page.locator(':focus');
  await expect(focusedElement).toBeVisible();
  
  // Should be able to navigate to main interactive elements
  let tabCount = 0;
  const maxTabs = 10;
  
  while (tabCount < maxTabs) {
    await page.keyboard.press('Tab');
    tabCount++;
    
    const currentFocus = page.locator(':focus');
    if (await currentFocus.isVisible()) {
      // Found a focusable element
      break;
    }
  }
  
  // At least one element should be focusable
  await expect(page.locator(':focus')).toBeVisible();
});

test('Screen reader landmarks present', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/`);
  await page.waitForLoadState('networkidle');

  // Check for semantic landmarks
  await expect(
    page.locator('main').or(page.locator('[role="main"]'))
  ).toBeVisible();
  
  // Navigation should be present
  await expect(
    page.locator('nav').or(page.locator('[role="navigation"]'))
  ).toBeVisible();
});