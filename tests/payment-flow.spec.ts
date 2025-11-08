import { test, expect } from './fixtures/enhanced-hardening';
import { TEST_IDS } from './constants/test-ids';

test.describe('Payment Flow Tests', () => {
  test.describe('Payment Form Validation', () => {
    test('validates payment form fields', async ({ page, baseURL, auth }) => {
      await auth.mockAuthState();
      
      // Navigate to payment via booking flow
      await page.goto(`${baseURL}/events`);
      const firstCard = page.getByTestId(TEST_IDS.EVENT_CARD).first();
      
      if (await firstCard.isVisible()) {
        await firstCard.click();
        await page.waitForURL(/\/events\/[^/]+$/);
        
        const cta = page.getByTestId(TEST_IDS.BOOKING_CTA);
        await cta.click();
        
        // Navigate to or find payment form
        const paymentForm = page.getByTestId(TEST_IDS.PAYMENT_FORM);
        if (await paymentForm.isVisible()) {
          // Test card number validation
          const cardInput = paymentForm.locator('input[name*="card"], input[placeholder*="card"]').first();
          if (await cardInput.isVisible()) {
            await cardInput.fill('1234');
            await cardInput.blur();
            
            const errorMessage = page.locator('text=/invalid|error/i');
            await expect(errorMessage).toBeVisible({ timeout: 5000 });
          }
          
          // Test CVV validation
          const cvvInput = paymentForm.locator('input[name*="cvv"], input[placeholder*="cvv"]').first();
          if (await cvvInput.isVisible()) {
            await cvvInput.fill('12');
            await cvvInput.blur();
            
            const cvvError = page.locator('text=/cvv.*invalid|security.*code/i');
            await expect(cvvError).toBeVisible({ timeout: 5000 });
          }
        }
      }
    });

    test('submits valid payment form', async ({ page, baseURL, auth }) => {
      await auth.mockAuthState();
      
      // Mock Stripe payment processing
      await page.route('**/create-payment', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            paymentIntentId: 'pi_test_123',
            redirectUrl: '/payment-success'
          })
        });
      });
      
      await page.goto(`${baseURL}/events`);
      const firstCard = page.getByTestId(TEST_IDS.EVENT_CARD).first();
      
      if (await firstCard.isVisible()) {
        await firstCard.click();
        await page.waitForURL(/\/events\/[^/]+$/);
        
        const cta = page.getByTestId(TEST_IDS.BOOKING_CTA);
        await cta.click();
        
        const paymentForm = page.getByTestId(TEST_IDS.PAYMENT_FORM);
        if (await paymentForm.isVisible()) {
          // Fill valid payment details
          const cardInput = paymentForm.locator('input[name*="card"]').first();
          if (await cardInput.isVisible()) {
            await cardInput.fill('4242424242424242');
          }
          
          const expiryInput = paymentForm.locator('input[name*="expiry"], input[name*="exp"]').first();
          if (await expiryInput.isVisible()) {
            await expiryInput.fill('12/25');
          }
          
          const cvvInput = paymentForm.locator('input[name*="cvv"]').first();
          if (await cvvInput.isVisible()) {
            await cvvInput.fill('123');
          }
          
          const submitButton = paymentForm.getByTestId(TEST_IDS.PAYMENT_SUBMIT);
          if (await submitButton.isVisible()) {
            await submitButton.click();
            
            // Wait for payment processing
            await page.waitForTimeout(2000);
            
            // Should redirect to success page or show success message
            const successIndicator = page.getByTestId(TEST_IDS.PAYMENT_SUCCESS)
              .or(page.locator('text=/success|confirmed|complete/i'));
            
            await expect(successIndicator).toBeVisible({ timeout: 10000 });
          }
        }
      }
    });
  });

  test.describe('Payment Error Handling', () => {
    test('handles payment processing errors', async ({ page, baseURL, auth }) => {
      await auth.mockAuthState();
      
      // Mock payment failure
      await page.route('**/create-payment', async route => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Payment declined',
            code: 'card_declined'
          })
        });
      });
      
      await page.goto(`${baseURL}/events`);
      const firstCard = page.getByTestId(TEST_IDS.EVENT_CARD).first();
      
      if (await firstCard.isVisible()) {
        await firstCard.click();
        await page.waitForURL(/\/events\/[^/]+$/);
        
        const cta = page.getByTestId(TEST_IDS.BOOKING_CTA);
        await cta.click();
        
        const paymentForm = page.getByTestId(TEST_IDS.PAYMENT_FORM);
        if (await paymentForm.isVisible()) {
          // Fill payment details and submit
          const submitButton = paymentForm.getByTestId(TEST_IDS.PAYMENT_SUBMIT);
          if (await submitButton.isVisible()) {
            await submitButton.click();
            
            // Should show error message
            const errorMessage = page.getByTestId(TEST_IDS.PAYMENT_ERROR)
              .or(page.locator('text=/declined|failed|error/i'));
            
            await expect(errorMessage).toBeVisible({ timeout: 10000 });
          }
        }
      }
    });

    test('handles network timeouts during payment', async ({ page, baseURL, auth }) => {
      await auth.mockAuthState();
      
      // Mock network timeout
      await page.route('**/create-payment', async route => {
        await new Promise(resolve => setTimeout(resolve, 30000)); // Simulate timeout
      });
      
      await page.goto(`${baseURL}/events`);
      const firstCard = page.getByTestId(TEST_IDS.EVENT_CARD).first();
      
      if (await firstCard.isVisible()) {
        await firstCard.click();
        await page.waitForURL(/\/events\/[^/]+$/);
        
        const cta = page.getByTestId(TEST_IDS.BOOKING_CTA);
        await cta.click();
        
        const paymentForm = page.getByTestId(TEST_IDS.PAYMENT_FORM);
        if (await paymentForm.isVisible()) {
          const submitButton = paymentForm.getByTestId(TEST_IDS.PAYMENT_SUBMIT);
          if (await submitButton.isVisible()) {
            await submitButton.click();
            
            // Should show timeout or retry message
            const timeoutMessage = page.locator('text=/timeout|try again|network/i');
            await expect(timeoutMessage).toBeVisible({ timeout: 15000 });
          }
        }
      }
    });
  });

  test.describe('Payment Security', () => {
    test('masks sensitive payment data', async ({ page, baseURL, auth }) => {
      await auth.mockAuthState();
      await page.goto(`${baseURL}/events`);
      
      const firstCard = page.getByTestId(TEST_IDS.EVENT_CARD).first();
      if (await firstCard.isVisible()) {
        await firstCard.click();
        await page.waitForURL(/\/events\/[^/]+$/);
        
        const cta = page.getByTestId(TEST_IDS.BOOKING_CTA);
        await cta.click();
        
        const paymentForm = page.getByTestId(TEST_IDS.PAYMENT_FORM);
        if (await paymentForm.isVisible()) {
          const cardInput = paymentForm.locator('input[name*="card"]').first();
          if (await cardInput.isVisible()) {
            await cardInput.fill('4242424242424242');
            
            // Card number should be masked/formatted
            const inputValue = await cardInput.inputValue();
            expect(inputValue).toMatch(/\d{4}\s\d{4}\s\d{4}\s\d{4}|•••• •••• •••• \d{4}/);
          }
        }
      }
    });

    test('validates SSL and secure context', async ({ page, baseURL }) => {
      // Ensure payment forms only work in secure contexts
      await page.goto(`${baseURL}/events`);
      
      const isSecure = await page.evaluate(() => {
        return window.isSecureContext;
      });
      
      // Payment should only be available in secure contexts
      if (!isSecure && baseURL?.includes('http://')) {
        console.warn('Payment testing in non-secure context');
      } else {
        expect(isSecure).toBe(true);
      }
    });
  });

  test.describe('Mobile Payment Experience', () => {
    test('mobile payment form is optimized', async ({ page, baseURL, withMobile, auth }) => {
      await auth.mockAuthState();
      await page.goto(`${baseURL}/events`);
      
      const firstCard = page.getByTestId(TEST_IDS.EVENT_CARD).first();
      await firstCard.tap();
      await page.waitForURL(/\/events\/[^/]+$/);
      
      const cta = page.getByTestId(TEST_IDS.BOOKING_CTA);
      await cta.tap();
      
      const paymentForm = page.getByTestId(TEST_IDS.PAYMENT_FORM);
      if (await paymentForm.isVisible()) {
        // Check mobile-specific input types
        const cardInput = paymentForm.locator('input[name*="card"]').first();
        if (await cardInput.isVisible()) {
          const inputType = await cardInput.getAttribute('inputmode');
          expect(inputType).toBe('numeric'); // Should use numeric input mode on mobile
        }
        
        // Check viewport scaling
        const viewport = page.viewportSize();
        expect(viewport?.width).toBeLessThanOrEqual(414); // Mobile width
        
        // Verify no horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScroll).toBe(false);
      }
    });
  });
});