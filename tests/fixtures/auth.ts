import { Page } from '@playwright/test';
import { TEST_IDS } from '../constants/test-ids';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export class AuthFixture {
  constructor(private page: Page) {}

  /**
   * Mock authentication state without actual login
   */
  async mockAuthState(user: AuthUser = { id: 'test-user-id', email: 'test@example.com' }) {
    await this.page.addInitScript((mockUser) => {
      // Mock Supabase auth state
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        user: mockUser
      }));
      
      // Mock session storage
      sessionStorage.setItem('auth.user', JSON.stringify(mockUser));
    }, user);
  }

  /**
   * Perform real authentication using test credentials
   */
  async signIn(email: string = 'test@example.com', password: string = 'testpassword123') {
    // Navigate to auth page
    await this.page.goto('/auth');
    
    // Fill in credentials
    await this.page.fill(`[data-testid="${TEST_IDS.AUTH_SIGNIN_EMAIL}"]`, email);
    await this.page.fill(`[data-testid="${TEST_IDS.AUTH_SIGNIN_PASSWORD}"]`, password);
    
    // Submit form
    await this.page.click(`[data-testid="${TEST_IDS.AUTH_SIGNIN_SUBMIT}"]`);
    
    // Wait for successful authentication (redirect to main page)
    await this.page.waitForURL('/', { timeout: 10000 });
  }

  /**
   * Sign up new user with test credentials
   */
  async signUp(email: string = `test-${Date.now()}@example.com`, password: string = 'testpassword123') {
    await this.page.goto('/auth');
    
    // Switch to sign up mode if needed
    const signUpTab = this.page.locator('text="Sign Up"');
    if (await signUpTab.isVisible()) {
      await signUpTab.click();
    }
    
    await this.page.fill(`[data-testid="${TEST_IDS.AUTH_SIGNUP_EMAIL}"]`, email);
    await this.page.fill(`[data-testid="${TEST_IDS.AUTH_SIGNUP_PASSWORD}"]`, password);
    await this.page.click(`[data-testid="${TEST_IDS.AUTH_SIGNUP_SUBMIT}"]`);
    
    // Wait for successful registration
    await this.page.waitForURL('/', { timeout: 10000 });
  }

  /**
   * Sign out current user
   */
  async signOut() {
    // Look for user menu or sign out button
    const userMenu = this.page.getByTestId(TEST_IDS.USER_MENU);
    if (await userMenu.isVisible()) {
      await userMenu.click();
    }
    
    const signOutButton = this.page.locator('text="Sign Out"').or(this.page.locator('text="Logout"'));
    if (await signOutButton.isVisible()) {
      await signOutButton.click();
    }
    
    // Wait for redirect to auth or home page
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clear all authentication state
   */
  async clearAuthState() {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Check if user is currently authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return await this.page.evaluate(() => {
      const token = localStorage.getItem('supabase.auth.token');
      return token !== null;
    });
  }
}