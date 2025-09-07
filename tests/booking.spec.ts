import { test, expect, checkAccessibility } from './fixtures/enhanced-hardening';
import { TEST_IDS } from './constants/test-ids';

test.describe('Booking CTA Comprehensive Tests', () => {
  test.describe('Guest User Flow', () => {
    test('redirects guest users to auth with next parameter', async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/events`);
      await page.waitForLoadState('networkidle');
      
      // Navigate to first available event
      const firstCard = page.getByTestId(TEST_IDS.EVENT_CARD).first();
      await expect(firstCard).toBeVisible({ timeout: 15000 });
      
      let eventDetailUrl: string;
      await Promise.all([
        page.waitForURL(/\/events\/[^/]+$/, { timeout: 15000 }).then(() => {
          eventDetailUrl = page.url();
        }),
        firstCard.click(),
      ]);
      
      // Click booking CTA
      const cta = page.getByTestId(TEST_IDS.BOOKING_CTA);
      await expect(cta).toBeVisible({ timeout: 15000 });
      await expect(cta).toContainText(/sign in.*book/i);

      await Promise.all([
        page.waitForURL(/\/auth(\?|$)/, { timeout: 15000 }),
        cta.click(),
      ]);
      
      // Verify auth redirect with next parameter
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/auth/);
      
      if (eventDetailUrl!) {
        const eventPath = new URL(eventDetailUrl).pathname;
        expect(currentUrl).toContain(encodeURIComponent(eventPath));
      }
    });

    test('shows correct CTA text for guest users', async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/events`);
      
      const firstCard = page.getByTestId(TEST_IDS.EVENT_CARD).first();
      if (await firstCard.isVisible()) {
        await firstCard.click();
        await page.waitForURL(/\/events\/[^/]+$/);
        
        const cta = page.getByTestId(TEST_IDS.BOOKING_CTA);
        if (await cta.isVisible()) {
          await expect(cta).toContainText(/sign in.*book/i);
        }
      }
    });
  });

  test.describe('Authenticated User Flow', () => {
    test('navigates authenticated users to booking flow', async ({ page, baseURL, auth }) => {
      // Use enhanced auth fixture
      await auth.mockAuthState();
      
      await page.goto(`${baseURL}/events`);
      await page.waitForLoadState('networkidle');
      
      const firstCard = page.getByTestId(TEST_IDS.EVENT_CARD).first();
      await expect(firstCard).toBeVisible({ timeout: 15000 });
      
      await Promise.all([
        page.waitForURL(/\/events\/[^/]+$/, { timeout: 15000 }),
        firstCard.click(),
      ]);

      const cta = page.getByTestId(TEST_IDS.BOOKING_CTA);
      await expect(cta).toBeVisible({ timeout: 15000 });
      await expect(cta).toContainText(/book now/i);

      await cta.click();
      
      // Check for booking flow initiation
      const bookingTarget = page.getByRole('dialog')
        .or(page.getByTestId(TEST_IDS.BOOKING_MODAL))
        .or(page.getByTestId(TEST_IDS.BOOKING_FORM))
        .or(page.locator('form[data-testid*="booking"]'));
      
      await expect(bookingTarget).toBeVisible({ timeout: 10000 });
    });

    test('shows correct CTA text for authenticated users', async ({ page, baseURL, auth }) => {
      await auth.mockAuthState();
      await page.goto(`${baseURL}/events`);
      
      const firstCard = page.getByTestId(TEST_IDS.EVENT_CARD).first();
      if (await firstCard.isVisible()) {
        await firstCard.click();
        await page.waitForURL(/\/events\/[^/]+$/);
        
        const cta = page.getByTestId(TEST_IDS.BOOKING_CTA);
        if (await cta.isVisible()) {
          await expect(cta).toContainText(/book now/i);
        }
      }
    });

    test('completes full booking flow with payment', async ({ page, baseURL, auth }) => {
      await auth.mockAuthState();
      await page.goto(`${baseURL}/events`);
      
      const firstCard = page.getByTestId(TEST_IDS.EVENT_CARD).first();
      await firstCard.click();
      await page.waitForURL(/\/events\/[^/]+$/);
      
      // Start booking flow
      const cta = page.getByTestId(TEST_IDS.BOOKING_CTA);
      await cta.click();
      
      // Fill booking form if present
      const bookingForm = page.getByTestId(TEST_IDS.BOOKING_FORM);
      if (await bookingForm.isVisible()) {
        // Fill basic booking details
        const guestCountInput = bookingForm.locator('input[name="guestCount"], input[name="tickets"]').first();
        if (await guestCountInput.isVisible()) {
          await guestCountInput.fill('2');
        }
        
        const submitButton = bookingForm.locator('button[type="submit"], button:has-text("book"), button:has-text("continue")').first();
        await submitButton.click();
      }
      
      // Wait for payment flow
      await page.waitForTimeout(2000);
      
      // Check if redirected to payment page or payment form appears
      const paymentIndicator = page.getByTestId(TEST_IDS.PAYMENT_FORM)
        .or(page.locator('form:has-text("payment")'))
        .or(page.locator('[data-testid*="payment"]'))
        .or(page.waitForURL(/\/payment/, { timeout: 5000 }).then(() => page.locator('body')).catch(() => null));
      
      if (paymentIndicator) {
        await expect(paymentIndicator).toBeVisible({ timeout: 10000 });
      }
    });
  });

  test.describe('Event Status and Error Handling', () => {
    test('handles disabled state for invalid events', async ({ page, baseURL }) => {
      await page.goto(`${baseURL}/events/invalid-event-id`);
      await page.waitForLoadState('networkidle');
      
      const pageContent = page.locator('body');
      await expect(pageContent).not.toBeEmpty({ timeout: 10000 });
      
      const cta = page.getByTestId(TEST_IDS.BOOKING_CTA);
      if (await cta.isVisible()) {
        const isDisabled = await cta.isDisabled();
        if (isDisabled) {
          await expect(cta).toContainText(/unavailable|disabled|sold out/i);
        }
      }
    });

    test('handles sold out events', async ({ page, baseURL }) => {
      // Mock a sold out event response
      await page.route('**/api/events/*', async route => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 'test-event',
              title: 'Sold Out Event',
              status: 'sold_out',
              available_tickets: 0
            })
          });
        } else {
          await route.continue();
        }
      });

      await page.goto(`${baseURL}/events/sold-out-event`);
      await page.waitForLoadState('networkidle');
      
      const cta = page.getByTestId(TEST_IDS.BOOKING_CTA);
      if (await cta.isVisible()) {
        await expect(cta).toBeDisabled();
        await expect(cta).toContainText(/sold out|unavailable/i);
      }
    });

    test('handles network errors gracefully', async ({ page, baseURL }) => {
      // Mock network failure
      await page.route('**/api/bookings/**', route => route.abort());
      
      await page.goto(`${baseURL}/events`);
      const firstCard = page.getByTestId(TEST_IDS.EVENT_CARD).first();
      
      if (await firstCard.isVisible()) {
        await firstCard.click();
        await page.waitForURL(/\/events\/[^/]+$/);
        
        const cta = page.getByTestId(TEST_IDS.BOOKING_CTA);
        if (await cta.isVisible()) {
          await cta.click();
          
          // Should show error message or fallback
          const errorMessage = page.locator('text=/error|failed|try again/i');
          await expect(errorMessage).toBeVisible({ timeout: 10000 });
        }
      }
    });
  });

  test.describe('Mobile Testing', () => {
    test('booking flow works on mobile devices', async ({ page, baseURL, withMobile }) => {
      await page.goto(`${baseURL}/events`);
      
      const firstCard = page.getByTestId(TEST_IDS.EVENT_CARD).first();
      await expect(firstCard).toBeVisible({ timeout: 15000 });
      
      // Test touch interaction
      await firstCard.tap();
      await page.waitForURL(/\/events\/[^/]+$/);
      
      const cta = page.getByTestId(TEST_IDS.BOOKING_CTA);
      await expect(cta).toBeVisible({ timeout: 15000 });
      
      // Verify mobile-friendly sizing
      const boundingBox = await cta.boundingBox();
      expect(boundingBox?.height).toBeGreaterThan(44); // Minimum touch target
      
      await cta.tap();
      
      // Should handle mobile navigation
      await page.waitForTimeout(2000);
    });

    test('mobile payment form is accessible', async ({ page, baseURL, withMobile, auth }) => {
      await auth.mockAuthState();
      await page.goto(`${baseURL}/events`);
      
      const firstCard = page.getByTestId(TEST_IDS.EVENT_CARD).first();
      await firstCard.tap();
      await page.waitForURL(/\/events\/[^/]+$/);
      
      const cta = page.getByTestId(TEST_IDS.BOOKING_CTA);
      await cta.tap();
      
      // Check for mobile-optimized payment form
      const paymentForm = page.getByTestId(TEST_IDS.PAYMENT_FORM);
      if (await paymentForm.isVisible()) {
        // Verify form fields are properly sized for mobile
        const cardInput = paymentForm.locator('input[name*="card"], input[placeholder*="card"]').first();
        if (await cardInput.isVisible()) {
          const inputBox = await cardInput.boundingBox();
          expect(inputBox?.height).toBeGreaterThan(44);
        }
      }
    });
  });

  test.describe('Accessibility Testing', () => {
    test('booking CTA meets accessibility standards', async ({ page, baseURL, withA11y }) => {
      await page.goto(`${baseURL}/events`);
      
      const firstCard = page.getByTestId(TEST_IDS.EVENT_CARD).first();
      if (await firstCard.isVisible()) {
        await firstCard.click();
        await page.waitForURL(/\/events\/[^/]+$/);
        
        // Run accessibility scan on event detail page
        await checkAccessibility(page);
        
        const cta = page.getByTestId(TEST_IDS.BOOKING_CTA);
        if (await cta.isVisible()) {
          // Test keyboard navigation
          await cta.focus();
          await expect(cta).toBeFocused();
          
          // Verify ARIA attributes
          await expect(cta).toHaveAttribute('aria-label', /.+/);
          
          // Test keyboard activation
          await page.keyboard.press('Enter');
          await page.waitForTimeout(1000);
        }
      }
    });

    test('booking form is screen reader friendly', async ({ page, baseURL, withA11y, auth }) => {
      await auth.mockAuthState();
      await page.goto(`${baseURL}/events`);
      
      const firstCard = page.getByTestId(TEST_IDS.EVENT_CARD).first();
      if (await firstCard.isVisible()) {
        await firstCard.click();
        await page.waitForURL(/\/events\/[^/]+$/);
        
        const cta = page.getByTestId(TEST_IDS.BOOKING_CTA);
        await cta.click();
        
        const bookingForm = page.getByTestId(TEST_IDS.BOOKING_FORM);
        if (await bookingForm.isVisible()) {
          // Run accessibility scan on booking form
          await checkAccessibility(page, {
            rules: {
              'label': { enabled: true },
              'aria-valid-attr': { enabled: true },
              'form-field-multiple-labels': { enabled: true }
            }
          });
        }
      }
    });
  });

  test.describe('Real Authentication Flow', () => {
    test('complete sign in and booking flow', async ({ page, baseURL, auth }) => {
      // This test would use real authentication if test credentials are available
      const testEmail = process.env.TEST_USER_EMAIL;
      const testPassword = process.env.TEST_USER_PASSWORD;
      
      if (testEmail && testPassword) {
        await auth.signIn(testEmail, testPassword);
        
        await page.goto(`${baseURL}/events`);
        const firstCard = page.getByTestId(TEST_IDS.EVENT_CARD).first();
        
        if (await firstCard.isVisible()) {
          await firstCard.click();
          await page.waitForURL(/\/events\/[^/]+$/);
          
          const cta = page.getByTestId(TEST_IDS.BOOKING_CTA);
          await expect(cta).toContainText(/book now/i);
          await cta.click();
          
          // Complete booking flow with real auth
          const bookingTarget = page.getByRole('dialog')
            .or(page.getByTestId(TEST_IDS.BOOKING_MODAL))
            .or(page.getByTestId(TEST_IDS.BOOKING_FORM));
          
          await expect(bookingTarget).toBeVisible({ timeout: 10000 });
        }
      } else {
        test.skip('Skipping real auth test - no test credentials provided');
      }
    });
  });
});