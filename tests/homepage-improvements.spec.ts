import { test, expect } from '@playwright/test';

test.describe('Homepage Improvements', () => {
  test('Hero shows new headline and CTAs', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    
    // Check new headline
    await expect(page.getByRole('heading', { name: /discover events.*grow your scene/i })).toBeVisible();
    
    // Check new subhead
    await expect(page.getByText(/kolab is a city guide and booking hub/i)).toBeVisible();
    
    // Check CTAs
    const findEventsButton = page.getByRole('link', { name: /find events tonight/i });
    await expect(findEventsButton).toBeVisible();
    
    const listEventButton = page.getByRole('link', { name: /list your event.*free/i });
    await expect(listEventButton).toBeVisible();
    
    // Check reassurance line
    await expect(page.getByText(/no spam.*just good events/i)).toBeVisible();
  });

  test('Find events tonight button navigates correctly', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    
    const findEventsButton = page.getByRole('link', { name: /find events tonight/i });
    await findEventsButton.click();
    
    await expect(page).toHaveURL(/\/events\?when=tonight/);
  });

  test('How it works section is visible', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    
    await expect(page.getByRole('heading', { name: /how it works/i })).toBeVisible();
    
    // Check the 3 steps
    await expect(page.getByText(/browse/i)).toBeVisible();
    await expect(page.getByText(/book.*rsvp/i)).toBeVisible();
    await expect(page.getByText(/follow/i)).toBeVisible();
    
    // Check link to about page
    await expect(page.getByRole('link', { name: /how kolab works/i })).toBeVisible();
  });

  test('Audience split cards are visible', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    
    // For locals card
    await expect(page.getByRole('heading', { name: /for locals/i })).toBeVisible();
    await expect(page.getByText(/see what's on tonight/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /explore events/i })).toBeVisible();
    
    // For organisers card
    await expect(page.getByRole('heading', { name: /for organisers.*venues/i })).toBeVisible();
    await expect(page.getByText(/get discovered without paid ads/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /list your event.*free/i })).toBeVisible();
  });

  test('Header has About link', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    
    const aboutLink = page.getByRole('link', { name: /about/i }).first();
    await expect(aboutLink).toBeVisible();
    
    await aboutLink.click();
    await expect(page).toHaveURL(/\/about/);
  });

  test('About page content', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/about`);
    
    await expect(page.getByRole('heading', { name: /how kolab works/i })).toBeVisible();
    await expect(page.getByText(/kolab is an events discovery/i)).toBeVisible();
    
    // Check sections
    await expect(page.getByText(/how kolab works for locals/i)).toBeVisible();
    await expect(page.getByText(/how kolab works for organisers/i)).toBeVisible();
    await expect(page.getByText(/why kolab vs.*socials/i)).toBeVisible();
    await expect(page.getByText(/free to list/i)).toBeVisible();
  });

  test('City Guide shows limited cards and view all link', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    
    await expect(page.getByRole('heading', { name: /city guide/i })).toBeVisible();
    await expect(page.getByText(/curated by locals for the places worth your time/i)).toBeVisible();
    
    // Should show view all guides link
    await expect(page.getByRole('link', { name: /view all guides/i })).toBeVisible();
  });
});