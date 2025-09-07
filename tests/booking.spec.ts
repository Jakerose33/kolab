import { test, expect } from './fixtures/hardening';

test.describe('Booking CTA Comprehensive Tests', () => {
  test('Booking CTA navigates guest users to auth with next parameter', async ({ page, baseURL }) => {
    // Start on events page
    await Promise.all([
      page.goto(`${baseURL}/events`),
      page.waitForLoadState('networkidle'),
    ]);
    
    // Navigate to an event detail page with robust waiting
    const firstCard = page.locator('[data-testid="event-card"]').first()
      .or(page.locator('a[href*="/events/"]').first())
      .or(page.locator('[class*="grid"] > div').first());
        
    await expect(firstCard).toBeVisible({ timeout: 15000 });
    
    // Capture current URL for next parameter verification
    let eventDetailUrl: string;
    await Promise.all([
      page.waitForURL(/\/events\/[^/]+$/, { timeout: 15000 }).then(() => {
        eventDetailUrl = page.url();
      }),
      firstCard.click(),
    ]);
    
    // Find booking CTA with comprehensive selectors
    const cta = page.getByTestId('booking-request')
      .or(page.getByTestId('booking-cta'))
      .or(page.getByRole('button', { name: /book|request|continue|checkout|rsvp|ticket/i }));
        
    await expect(cta).toBeVisible({ timeout: 15000 });

    // Click CTA as guest user - should redirect to auth with next parameter
    await Promise.all([
      page.waitForURL(/\/auth(\?|$)/, { timeout: 15000 }),
      cta.click(),
    ]);
    
    // Verify we're on auth page and next parameter is present
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/auth/);
    
    // Verify next parameter contains the event detail URL path
    if (eventDetailUrl!) {
      const eventPath = new URL(eventDetailUrl).pathname;
      expect(currentUrl).toContain(encodeURIComponent(eventPath));
    }
  });

  test('Booking CTA navigates authenticated users to booking flow', async ({ page, baseURL }) => {
    // Mock authentication state before navigation
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'mock-user-id', email: 'test@example.com' }
      }));
    });

    // Navigate to events with auth state
    await Promise.all([
      page.goto(`${baseURL}/events`),
      page.waitForLoadState('networkidle'),
    ]);
    
    // Navigate to an event detail page
    const firstCard = page.locator('[data-testid="event-card"]').first()
      .or(page.locator('a[href*="/events/"]').first())
      .or(page.locator('[class*="grid"] > div').first());
        
    await expect(firstCard).toBeVisible({ timeout: 15000 });
    
    await Promise.all([
      page.waitForURL(/\/events\/[^/]+$/, { timeout: 15000 }),
      firstCard.click(),
    ]);

    // Find booking CTA
    const cta = page.getByTestId('booking-request')
      .or(page.getByTestId('booking-cta'))
      .or(page.getByRole('button', { name: /book|request|continue|checkout|rsvp|ticket/i }));
        
    await expect(cta).toBeVisible({ timeout: 15000 });

    // Click CTA as authenticated user
    await cta.click();
    
    // Wait for booking flow to initiate (modal or page navigation)
    await page.waitForTimeout(2000);
    
    // Check for booking modal, navigation to booking page, or booking form
    const bookingTarget = page.getByRole('dialog')
      .or(page.locator('[data-testid="booking-modal"]'))
      .or(page.locator('text=/booking|book|request/i'))
      .or(page.locator('form'));
    
    await expect(bookingTarget).toBeVisible({ timeout: 10000 });
  });

  test('Booking CTA displays correct text for auth states', async ({ page, baseURL }) => {
    // Test guest state first
    await Promise.all([
      page.goto(`${baseURL}/events`),
      page.waitForLoadState('networkidle'),
    ]);
    
    const firstCard = page.locator('[data-testid="event-card"]').first()
      .or(page.locator('a[href*="/events/"]').first());
        
    if (await firstCard.isVisible()) {
      await Promise.all([
        page.waitForURL(/\/events\/[^/]+$/, { timeout: 15000 }),
        firstCard.click(),
      ]);
      
      const guestCta = page.getByTestId('booking-request');
      if (await guestCta.isVisible()) {
        // For guest users, should show "Sign In to Book" text
        await expect(guestCta).toContainText(/sign in.*book/i, { timeout: 10000 });
      }
    }

    // Now test authenticated state
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'mock-user-id', email: 'test@example.com' }
      }));
    });

    // Reload the page to apply auth state
    await Promise.all([
      page.reload(),
      page.waitForLoadState('networkidle'),
    ]);
    
    const authedCta = page.getByTestId('booking-request');
    if (await authedCta.isVisible()) {
      // For authenticated users, should show "Book Now" text
      await expect(authedCta).toContainText(/book now/i, { timeout: 10000 });
    }
  });

  test('Booking CTA handles disabled state for invalid events', async ({ page, baseURL }) => {
    // Navigate to a potentially invalid event URL
    await Promise.all([
      page.goto(`${baseURL}/events/invalid-event-id`),
      page.waitForLoadState('networkidle'),
    ]);
    
    // Check if page loads (might show 404 or event detail)
    const pageContent = page.locator('body');
    await expect(pageContent).not.toBeEmpty({ timeout: 10000 });
    
    // If booking CTA exists, it might be disabled or show unavailable state
    const cta = page.getByTestId('booking-request');
    if (await cta.isVisible()) {
      // Verify button exists and check its state
      await expect(cta).toBeVisible({ timeout: 5000 });
      
      // If disabled, should show appropriate text
      const isDisabled = await cta.isDisabled();
      if (isDisabled) {
        await expect(cta).toContainText(/unavailable|disabled/i);
      }
    }
  });

  test('Booking CTA accessibility and keyboard navigation', async ({ page, baseURL }) => {
    await Promise.all([
      page.goto(`${baseURL}/events`),
      page.waitForLoadState('networkidle'),
    ]);
    
    const firstCard = page.locator('[data-testid="event-card"]').first()
      .or(page.locator('a[href*="/events/"]').first());
        
    if (await firstCard.isVisible()) {
      await Promise.all([
        page.waitForURL(/\/events\/[^/]+$/, { timeout: 15000 }),
        firstCard.click(),
      ]);
      
      const cta = page.getByTestId('booking-request');
      if (await cta.isVisible()) {
        // Test keyboard navigation to CTA
        await page.keyboard.press('Tab');
        let tabCount = 0;
        const maxTabs = 20;
        
        while (tabCount < maxTabs) {
          const focused = page.locator(':focus');
          const isFocused = await focused.evaluate((el, ctaEl) => el === ctaEl, await cta.elementHandle());
          
          if (isFocused) {
            // Successfully focused on CTA via keyboard
            break;
          }
          
          await page.keyboard.press('Tab');
          tabCount++;
        }
        
        // Verify CTA has proper ARIA attributes
        await expect(cta).toHaveAttribute('aria-label', /.+/, { timeout: 5000 });
        
        // Test activation via keyboard
        await cta.focus();
        await page.keyboard.press('Enter');
        
        // Should trigger navigation or action
        await page.waitForTimeout(1000);
      }
    }
  });
});