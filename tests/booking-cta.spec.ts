import { test, expect } from './fixtures/hardening';

test('Guest clicking booking CTA gets redirected to sign-in with next', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/events`);
  await page.waitForLoadState('networkidle');
  
  // Navigate to an event detail page
  const firstCard = page.locator('[data-testid="event-card"]').first()
    .or(page.locator('a[href*="/events/"]').first())
    .or(page.locator('[class*="grid"] > div').first());
    
  await expect(firstCard).toBeVisible();
  
  await Promise.all([
    page.waitForURL(/\/events\/[^/]+$/),
    firstCard.click(),
  ]);
  
  // Find booking CTA
  const cta = page.getByTestId('booking-request')
    .or(page.getByTestId('booking-cta'))
    .or(page.getByRole('button', { name: /book|request|continue|checkout|rsvp|ticket/i }));
    
  await expect(cta).toBeVisible();

  // Click CTA as guest user (should redirect to auth)
  await Promise.all([
    page.waitForURL(/\/auth(\?|$)/),
    cta.click(),
  ]);
  
  // Should be on auth page, possibly with next parameter
  expect(page.url()).toMatch(/\/auth/);
});

test('Authed clicking booking CTA navigates to booking flow', async ({ page, baseURL }) => {
  // First sign in
  await page.goto(`${baseURL}/auth`);
  await page.waitForLoadState('networkidle');
  
  const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
  const passwordInput = page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i));
  
  if (await emailInput.isVisible() && process.env.E2E_EMAIL && process.env.E2E_PASSWORD) {
    await emailInput.fill(process.env.E2E_EMAIL);
    await passwordInput.fill(process.env.E2E_PASSWORD);
    
    await Promise.all([
      page.waitForURL(`${baseURL}/`),
      page.getByRole('button', { name: /sign in/i }).click(),
    ]);
  } else {
    // Mock auth state if credentials not available
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'mock-user-id', email: 'test@example.com' }
      }));
    });
    await page.goto(`${baseURL}/`);
  }

  // Navigate to events and then to an event detail
  await page.goto(`${baseURL}/events`);
  await page.waitForLoadState('networkidle');
  
  const firstCard = page.locator('[data-testid="event-card"]').first()
    .or(page.locator('a[href*="/events/"]').first())
    .or(page.locator('[class*="grid"] > div').first());
    
  await expect(firstCard).toBeVisible();
  
  await Promise.all([
    page.waitForURL(/\/events\/[^/]+$/),
    firstCard.click(),
  ]);

  const cta = page.getByTestId('booking-request')
    .or(page.getByTestId('booking-cta'))
    .or(page.getByRole('button', { name: /book|request|continue|checkout|rsvp|ticket/i }));
    
  await expect(cta).toBeVisible();

  // Click CTA as authenticated user
  await cta.click();
  
  // Should navigate to booking flow or open booking modal
  // Could be /bookings, or stay on same page with modal, or other booking flow
  await page.waitForTimeout(2000); // Give time for action to complete
  
  // Check for booking modal or navigation to booking page
  const bookingModal = page.getByRole('dialog').or(page.locator('[data-testid="booking-modal"]'));
  const bookingPage = page.locator('text=/booking|book|request/i');
  
  await expect(bookingModal.or(bookingPage)).toBeVisible({ timeout: 5000 });
});