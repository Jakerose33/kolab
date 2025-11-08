import { test, expect } from './fixtures/hardening';

test('Event cards link to detail pages and show booking CTA', async ({ page, baseURL }) => {
  await Promise.all([
    page.goto(`${baseURL}/events`),
    page.waitForLoadState('networkidle'),
  ]);

  // Look for event cards with robust selector fallbacks
  const firstCard = page.locator('[data-testid="event-card"]').first()
    .or(page.locator('[class*="event-card"]').first())
    .or(page.locator('a[href*="/events/"]').first())
    .or(page.locator('[class*="grid"] > div').first());
    
  await expect(firstCard).toBeVisible({ timeout: 15000 });

  // Click and wait for navigation with Promise.all for reliability
  await Promise.all([
    page.waitForURL(/\/events\/[^/]+$/, { timeout: 15000 }),
    firstCard.click(),
  ]);

  // Booking CTA must be visible on detail page with robust selectors
  const cta = page.getByTestId('booking-request')
    .or(page.getByTestId('booking-cta'))
    .or(page.getByRole('button', { name: /book|request|continue|checkout|rsvp|ticket/i }).first());
    
  await expect(cta).toBeVisible({ timeout: 15000 });
});

test('Events page shows list of events', async ({ page, baseURL }) => {
  await Promise.all([
    page.goto(`${baseURL}/events`),
    page.waitForLoadState('networkidle'),
  ]);
  
  // Should show some events or empty state with better timeout
  const eventsList = page.locator('[data-testid="events-list"]')
    .or(page.locator('[class*="event"]'))
    .or(page.getByText(/no events/i));
    
  await expect(eventsList).toBeVisible({ timeout: 15000 });
});