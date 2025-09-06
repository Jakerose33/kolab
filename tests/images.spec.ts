import { test, expect } from '@playwright/test';

test('Hero image loads', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/`);
  const hero = page.locator('img[alt*="Kolab"]').first();
  await expect(hero).toBeVisible();
  await expect(hero).toHaveJSProperty('naturalWidth', (v: number) => v > 1);
});

test('Event grid images load', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/events`);
  const firstImg = page.locator('img').first();
  await expect(firstImg).toBeVisible();
  // Wait for the image to load
  await firstImg.waitFor({ state: 'visible' });
  const naturalWidth = await firstImg.evaluate((img: HTMLImageElement) => img.naturalWidth);
  expect(naturalWidth).toBeGreaterThan(1);
});

test('City guide images load', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/`);
  // Scroll to city guide section
  await page.locator('text=City Guide').scrollIntoViewIfNeeded();
  const cityGuideImages = page.locator('img[alt*="guide"], img[alt*="Guide"]');
  await expect(cityGuideImages.first()).toBeVisible();
  
  // Check first few images load properly
  const count = await cityGuideImages.count();
  for (let i = 0; i < Math.min(3, count); i++) {
    const img = cityGuideImages.nth(i);
    await expect(img).toBeVisible();
    const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(1);
  }
});

test('No broken image placeholders on home page', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/`);
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Check for broken images (naturalWidth === 0 means broken)
  const brokenImages = await page.locator('img').evaluateAll((images: HTMLImageElement[]) => {
    return images.filter(img => img.naturalWidth === 0 && img.complete).length;
  });
  
  expect(brokenImages).toBe(0);
});

test('Images have proper fallback behavior', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/`);
  
  // Inject a test image with bad src to verify fallback
  await page.evaluate(() => {
    const img = document.createElement('img');
    img.src = 'https://invalid-url.example.com/bad-image.jpg';
    img.alt = 'Test fallback image';
    img.className = 'test-fallback-img';
    document.body.appendChild(img);
  });
  
  // Wait for the error to trigger
  await page.waitForTimeout(1000);
  
  // Check that the image src was changed to placeholder
  const testImg = page.locator('.test-fallback-img');
  const finalSrc = await testImg.getAttribute('src');
  expect(finalSrc).toBe('/placeholder.svg');
});