import { test, expect } from './fixtures/hardening';

const routes = ['/', '/events', '/venues', '/auth', '/auth/signup', '/auth/forgot-password'];

for (const path of routes) {
  test(`Route loads without error: ${path}`, async ({ page, baseURL }) => {
    await page.goto(`${baseURL}${path}`);
    await page.waitForLoadState('networkidle');
    
    // Check no error boundary text is visible
    await expect(page.getByText(/something went wrong|retry|error occurred|try again/i)).toHaveCount(0);
    
    // Ensure the page actually loaded (has some content)
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });
}

test('Report Issue button is visible on all routes', async ({ page, baseURL }) => {
  for (const path of routes) {
    await page.goto(`${baseURL}${path}`);
    await page.waitForLoadState('networkidle');
    
    const reportBtn = page.getByRole('button', { name: /report issue/i });
    await expect(reportBtn).toBeVisible();
  }
});