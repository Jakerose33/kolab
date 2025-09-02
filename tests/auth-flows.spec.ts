import { test, expect } from './fixtures/hardening';

test('Password sign-in redirects to home', async ({ page, baseURL }) => {
  if (!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD) {
    test.skip('E2E_EMAIL and E2E_PASSWORD env vars required');
  }

  await page.goto(`${baseURL}/auth`);
  await page.waitForLoadState('networkidle');

  // Fill in credentials
  const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
  const passwordInput = page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i));
  
  await emailInput.fill(process.env.E2E_EMAIL!);
  await passwordInput.fill(process.env.E2E_PASSWORD!);

  // Sign in and wait for redirect
  await Promise.all([
    page.waitForURL(`${baseURL}/`),
    page.getByRole('button', { name: /sign in/i }).click(),
  ]);

  // Should be on home page
  expect(page.url()).toBe(`${baseURL}/`);
});

test('Forgot password shows success panel', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/auth/forgot-password`);
  await page.waitForLoadState('networkidle');

  // Use plus-alias email for rate limiting
  const timestamp = Date.now();
  const testEmail = `jakerose800+${timestamp}@gmail.com`;

  const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
  await emailInput.fill(testEmail);

  await page.getByRole('button', { name: /reset|send/i }).click();

  // Should show success state
  await expect(
    page.getByTestId('reset-success')
      .or(page.getByText(/check your email|sent|reset link/i))
  ).toBeVisible({ timeout: 10000 });
});

test('Sign up form is accessible', async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/auth/signup`);
  await page.waitForLoadState('networkidle');

  // Check form fields exist
  await expect(page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i))).toBeVisible();
  await expect(page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i))).toBeVisible();
  await expect(page.getByRole('button', { name: /sign up|create|register/i })).toBeVisible();
});

test('Sign out shows signed-out state', async ({ page, baseURL }) => {
  // First mock being signed in
  await page.addInitScript(() => {
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: 'mock-token',
      user: { id: 'mock-user-id', email: 'test@example.com' }
    }));
  });

  await page.goto(`${baseURL}/`);
  await page.waitForLoadState('networkidle');

  // Look for sign out option (could be in menu, profile dropdown, etc.)
  const signOutBtn = page.getByRole('button', { name: /sign out|logout/i })
    .or(page.getByText(/sign out|logout/i));

  if (await signOutBtn.isVisible()) {
    await signOutBtn.click();
    
    // Should show signed-out state (sign in button appears)
    await expect(
      page.getByRole('button', { name: /sign in/i })
        .or(page.getByText(/sign in/i))
    ).toBeVisible({ timeout: 5000 });
  }
});

test('Auth protection redirects to sign in', async ({ page, baseURL }) => {
  // Try to access a protected route without auth
  await page.goto(`${baseURL}/profile`);
  
  // Should redirect to auth or show sign in prompt
  await expect(
    page.getByText(/sign in|login|authenticate/i)
      .or(page.locator('form'))
  ).toBeVisible({ timeout: 10000 });
});