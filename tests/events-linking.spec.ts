import { test, expect } from './fixtures/hardening';

test('Event cards link to detail pages and show booking CTA', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/events`);
  await page.waitForLoadState('networkidle');

  // Look for event cards (try multiple possible selectors)
  const firstCard = page.locator('[data-testid="event-card"]').first()
    .or(page.locator('[class*="event-card"]').first())
    .or(page.locator('a[href*="/events/"]').first())
    .or(page.locator('[class*="grid"] > div').first());
    
  await expect(firstCard).toBeVisible({ timeout: 10000 });

  // Click and wait for navigation to /events/:id
  await Promise.all([
    page.waitForURL(/\/events\/[^/]+$/),
    firstCard.click(),
  ]);

  // Booking CTA must be visible on detail page
  const cta = page.getByRole('button', { name: /book|request|continue|checkout|rsvp|ticket/i }).first()
    .or(page.getByTestId('booking-request'))
    .or(page.getByTestId('booking-cta'));
    
  await expect(cta).toBeVisible({ timeout: 10000 });
});

test('Events page shows list of events', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/events`);
  await page.waitForLoadState('networkidle');
  
  // Should show some events or empty state
  const eventsList = page.locator('[data-testid="events-list"]')
    .or(page.locator('[class*="event"]'))
    .or(page.getByText(/no events/i));
    
  await expect(eventsList).toBeVisible({ timeout: 10000 });
});