import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    const consoleErrors: string[] = [];
    const requestFailures: string[] = [];

    // Catch unhandled page errors
    page.on('pageerror', (err) => {
      throw new Error(`[PageError] ${err?.message ?? err}`);
    });

    // Catch console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Catch network request failures (excluding known analytics endpoints)
    page.on('requestfailed', (req) => {
      const url = req.url();
      // Allowlist noisy endpoints that are expected to fail sometimes
      if (!/analytics|plausible|posthog|google-analytics|gtag|facebook|twitter|tiktok/i.test(url)) {
        requestFailures.push(`${req.failure()?.errorText} ${url}`);
      }
    });

    await use(page);

    // After the test, check for accumulated errors
    if (consoleErrors.length) {
      throw new Error(`Console errors detected:\n${consoleErrors.join('\n')}`);
    }
    if (requestFailures.length) {
      throw new Error(`Network request failures detected:\n${requestFailures.join('\n')}`);
    }
  },
});

export const expect = base.expect;