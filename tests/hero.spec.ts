import { test, expect } from '@playwright/test';

test('Hero image loads and is not broken', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/`);
  
  // Find the hero image
  const heroImg = page.locator('img[alt*="Kolab"][src]').first();
  await expect(heroImg).toBeVisible();
  
  // Wait for image to load and verify it's not broken
  await heroImg.waitFor({ state: 'visible' });
  const naturalWidth = await heroImg.evaluate((img: HTMLImageElement) => img.naturalWidth);
  expect(naturalWidth).toBeGreaterThan(0);
  
  // Verify the source is not the fallback placeholder
  const src = await heroImg.getAttribute('src');
  expect(src).not.toBe('/placeholder.svg');
});

test('Hero image fallback works when primary fails', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/`);
  
  // Inject a script to simulate image load failure
  await page.evaluate(() => {
    const heroImg = document.querySelector('img[alt*="Kolab"]') as HTMLImageElement;
    if (heroImg) {
      // Trigger the error handler
      heroImg.dispatchEvent(new Event('error'));
    }
  });
  
  // Wait a bit for the fallback to trigger
  await page.waitForTimeout(500);
  
  // Verify fallback is now showing
  const heroImg = page.locator('img[alt*="Kolab"]').first();
  const finalSrc = await heroImg.getAttribute('src');
  expect(finalSrc).toBe('/placeholder.svg');
});

test('Hero image has proper loading attributes for LCP optimization', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/`);
  
  const heroImg = page.locator('img[alt*="Kolab"]').first();
  
  // Check performance-critical attributes
  const loading = await heroImg.getAttribute('loading');
  const fetchPriority = await heroImg.getAttribute('fetchpriority');
  const width = await heroImg.getAttribute('width');
  const height = await heroImg.getAttribute('height');
  
  expect(loading).toBe('eager');
  expect(fetchPriority).toBe('high');
  expect(width).toBe('1920');
  expect(height).toBe('1080');
});

test('No broken images on home page', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/`);
  
  // Wait for page to fully load
  await page.waitForLoadState('networkidle');
  
  // Count broken images (naturalWidth === 0 and complete === true means broken)
  const brokenImageCount = await page.locator('img').evaluateAll((images: HTMLImageElement[]) => {
    return images.filter(img => img.naturalWidth === 0 && img.complete).length;
  });
  
  expect(brokenImageCount).toBe(0);
});