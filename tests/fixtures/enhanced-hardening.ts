import { test as base, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';
import { AuthFixture } from './auth';

// Enhanced test fixture with auth, accessibility, and mobile support
export const test = base.extend<{
  auth: AuthFixture;
  withMobile: void;
  withA11y: void;
}>({
  page: async ({ page }, use) => {
    const consoleErrors: string[] = [];
    const requestFailures: string[] = [];

    // Enhanced error handling
    page.on('pageerror', (err) => {
      throw new Error(`[PageError] ${err?.message ?? err}`);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        // Filter out known non-critical errors
        const errorText = msg.text();
        if (!/favicon|analytics|third-party/i.test(errorText)) {
          consoleErrors.push(errorText);
        }
      }
    });

    page.on('requestfailed', (req) => {
      const url = req.url();
      // Enhanced allowlist for known noisy endpoints
      if (!/analytics|plausible|posthog|google-analytics|gtag|facebook|twitter|tiktok|stripe|maps/i.test(url)) {
        requestFailures.push(`${req.failure()?.errorText} ${url}`);
      }
    });

    await use(page);

    // Check for accumulated errors
    if (consoleErrors.length) {
      throw new Error(`Console errors detected:\n${consoleErrors.join('\n')}`);
    }
    if (requestFailures.length) {
      throw new Error(`Network request failures detected:\n${requestFailures.join('\n')}`);
    }
  },

  auth: async ({ page }, use) => {
    const authFixture = new AuthFixture(page);
    await use(authFixture);
    // Cleanup after each test
    await authFixture.clearAuthState();
  },

  withMobile: [async ({ page }, use) => {
    // Configure for mobile testing
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15');
    await use();
  }, { auto: false }],

  withA11y: [async ({ page }, use) => {
    // Inject axe-core for accessibility testing
    await injectAxe(page);
    await use();
  }, { auto: false }],
});

// Helper function for accessibility checks
export async function checkAccessibility(page: any, options?: any) {
  await checkA11y(page, undefined, {
    detailedReport: true,
    detailedReportOptions: { html: true },
    ...options
  });
}

export { expect };