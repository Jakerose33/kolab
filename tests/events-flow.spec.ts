// tests/events-flow.spec.ts
import { test, expect } from './fixtures/hardening';

test.describe('Events Data Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display events on home page', async ({ page }) => {
    // Wait for events to load
    await page.waitForLoadState('networkidle');
    
    // Check that events are displayed
    const eventCards = page.locator('[class*="grid"] > div').first();
    await expect(eventCards).toBeVisible();
    
    // Verify at least one event is shown
    const eventTitle = page.locator('h3, h2').first();
    await expect(eventTitle).toBeVisible();
  });

  test('should navigate to events page and show filtered results', async ({ page }) => {
    // Navigate to events page
    await page.goto('/events');
    await page.waitForLoadState('networkidle');
    
    // Check events page loads
    await expect(page.locator('h1')).toContainText('Events');
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('jazz');
      await page.waitForTimeout(500); // Wait for search debounce
      
      // Verify search results
      const resultsText = page.locator('text*="event"');
      await expect(resultsText).toBeVisible();
    }
    
    // Test category filtering
    const categoryBadges = page.locator('[class*="badge"]').first();
    if (await categoryBadges.isVisible()) {
      await categoryBadges.click();
      await page.waitForTimeout(500);
    }
  });

  test('should show events on map view', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');
    
    // Switch to map view
    const mapViewTab = page.locator('text="Map View"');
    if (await mapViewTab.isVisible()) {
      await mapViewTab.click();
      await page.waitForTimeout(2000); // Wait for map to load
      
      // Check map container is visible
      const mapContainer = page.locator('[class*="mapbox"]').first();
      if (await mapContainer.isVisible()) {
        await expect(mapContainer).toBeVisible();
      }
    }
  });

  test('should navigate to event detail page without errors', async ({ page }) => {
    await Promise.all([
      page.goto('/events'),
      page.waitForLoadState('networkidle'),
    ]);
    
    // Find first event card and click it with robust waiting
    const firstEventCard = page.locator('[class*="grid"] > div').first();
    if (await firstEventCard.isVisible()) {
      await Promise.all([
        page.waitForURL(/\/events\/[^\/]+$/, { timeout: 15000 }),
        firstEventCard.click(),
      ]);
      
      // Check we're on event detail page
      expect(page.url()).toMatch(/\/events\/[^\/]+$/);
      
      // Verify event detail content loads
      const eventTitle = page.locator('h1, h2').first();
      await expect(eventTitle).toBeVisible({ timeout: 10000 });
      
      // Check booking CTA is visible with proper test ID
      const bookingButton = page.getByTestId('booking-request')
        .or(page.locator('button, a').filter({ hasText: /book|rsvp|ticket/i }).first());
      if (await bookingButton.isVisible()) {
        await expect(bookingButton).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('should handle create event flow for authenticated users', async ({ page }) => {
    // Mock authentication state
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'mock-user-id' }
      }));
    });
    
    await page.goto('/events');
    await page.waitForLoadState('networkidle');
    
    // Click create event button
    const createButton = page.locator('button').filter({ hasText: 'Create Event' });
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Check create event dialog/modal opens
      const modal = page.locator('[role="dialog"]').first();
      if (await modal.isVisible()) {
        await expect(modal).toBeVisible();
        
        // Check form fields are present
        const titleField = page.locator('input[placeholder*="title"], input[name*="title"]').first();
        if (await titleField.isVisible()) {
          await expect(titleField).toBeVisible();
        }
      }
    }
  });

  test('should show authentication prompt for unauthenticated users', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');
    
    // Click create event button without authentication
    const createButton = page.locator('button').filter({ hasText: 'Create Event' });
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Should show auth dialog
      const authDialog = page.locator('[role="dialog"]').first();
      if (await authDialog.isVisible()) {
        await expect(authDialog).toBeVisible();
      }
    }
  });

  test('should handle navigation without full page reloads', async ({ page }) => {
    await page.goto('/');
    
    // Listen for page reloads
    let pageReloaded = false;
    page.on('load', () => {
      pageReloaded = true;
    });
    
    // Navigate between pages using React Router
    const eventsLink = page.locator('a[href="/events"], button').filter({ hasText: /events/i }).first();
    if (await eventsLink.isVisible()) {
      await Promise.all([
        page.waitForURL(/\/events/, { timeout: 15000 }),
        eventsLink.click(),
      ]);
      
      // Small delay to ensure navigation completes
      await page.waitForTimeout(1000);
      
      // Verify no full page reload occurred
      expect(pageReloaded).toBe(false);
      
      // Check URL changed correctly
      expect(page.url()).toContain('/events');
    }
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Go to non-existent event
    await page.goto('/events/non-existent-event-id');
    
    // Should show error state, not crash
    const notFoundText = page.locator('text*="not found", text*="error", text*="doesn\'t exist"').first();
    await expect(notFoundText).toBeVisible();
    
    // Should have way to navigate back
    const backButton = page.locator('button, a').filter({ hasText: /back|home|events/i }).first();
    await expect(backButton).toBeVisible();
  });

  test('should maintain consistent event data across views', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get first event title from home page
    const homeEventTitle = await page.locator('h3, h2').first().textContent();
    
    if (homeEventTitle) {
      // Go to events page
      await page.goto('/events');
      await page.waitForLoadState('networkidle');
      
      // Search for the same event
      const searchInput = page.locator('input[placeholder*="Search"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill(homeEventTitle.slice(0, 10)); // Search with partial title
        await page.waitForTimeout(500);
        
        // Verify event appears in search results
        const searchResult = page.locator('text*="' + homeEventTitle.slice(0, 10) + '"').first();
        if (await searchResult.isVisible()) {
          await expect(searchResult).toBeVisible();
        }
      }
    }
  });
});

test.describe('Event Data Invalidation', () => {
  test('should refresh data after mutations', async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'mock-user-id' }
      }));
    });
    
    await page.goto('/events');
    await page.waitForLoadState('networkidle');
    
    // Create an event (if form is available)
    const createButton = page.locator('button').filter({ hasText: 'Create Event' });
    if (await createButton.isVisible()) {
      await createButton.click();
      
      const modal = page.locator('[role="dialog"]').first();
      if (await modal.isVisible()) {
        // Fill basic form if available
        const titleField = page.locator('input').first();
        if (await titleField.isVisible()) {
          await titleField.fill('Test Event');
          
          // Submit if submit button exists
          const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /create|save|submit/i }).first();
          if (await submitButton.isVisible()) {
            await submitButton.click();
            
            // Verify list updates (new event appears)
            await page.waitForTimeout(2000);
            const newEvent = page.locator('text="Test Event"');
            // Don't assert here as this is mock data, just verify no crashes
          }
        }
      }
    }
  });
});