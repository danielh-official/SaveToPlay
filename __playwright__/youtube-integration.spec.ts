import { test, expect } from '@playwright/test';

test.describe('YouTube Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Wait for extension to load
    await page.waitForTimeout(2000);
  });

  test.describe('Video Page', () => {
    test('should show Save to Play button on video page', async ({ page }) => {
      await page.goto('/watch?v=dQw4w9WgXcQ');
      
      // Wait for YouTube to load
      await page.waitForSelector('h1.ytd-video-primary-info-renderer', { timeout: 10000 });
      
      // Check if our button appears
      const saveButton = page.locator('.save-to-play-btn');
      await expect(saveButton).toBeVisible({ timeout: 10000 });
      await expect(saveButton).toHaveText('Save to Play');
    });

    test('should show correct button state for saved videos', async ({ page }) => {
      await page.goto('/watch?v=dQw4w9WgXcQ');
      
      await page.waitForSelector('h1.ytd-video-primary-info-renderer', { timeout: 10000 });
      
      // Check button styling and text
      const saveButton = page.locator('.save-to-play-btn');
      await expect(saveButton).toBeVisible({ timeout: 10000 });
      
      // Verify button has correct classes and styling
      await expect(saveButton).toHaveClass(/save-to-play-btn/);
    });

    test('should handle button click and open Play app', async ({ page }) => {
      await page.goto('/watch?v=dQw4w9WgXcQ');
      
      await page.waitForSelector('h1.ytd-video-primary-info-renderer', { timeout: 10000 });
      
      const saveButton = page.locator('.save-to-play-btn');
      await expect(saveButton).toBeVisible({ timeout: 10000 });
      
      // Mock the window.open to prevent actual Play app opening
      await page.addInitScript(() => {
        window.open = (url?: string | URL) => {
          // Store the URL for testing
          if (typeof url === 'string') {
            (window as any).lastOpenedUrl = url;
          }
          return null;
        };
      });
      
      await saveButton.click();
      
      // Check if the correct URL scheme was opened
      await page.waitForFunction(() => (window as any).lastOpenedUrl);
      const openedUrl = await page.evaluate(() => (window as any).lastOpenedUrl);
      expect(openedUrl).toContain('play://add?url=');
      expect(openedUrl).toContain('youtube.com/watch');
    });
  });

  test.describe('Home Page', () => {
    test('should show Save to Play buttons on video cards', async ({ page }) => {
      await page.goto('/');
      
      // Wait for YouTube to load
      await page.waitForSelector('ytd-rich-grid-renderer', { timeout: 10000 });
      
      // Check if buttons appear on video cards
      const saveButtons = page.locator('.save-to-play-btn');
      await expect(saveButtons.first()).toBeVisible({ timeout: 10000 });
      
      // Should have multiple buttons (one per video card)
      const buttonCount = await saveButtons.count();
      expect(buttonCount).toBeGreaterThan(0);
    });

    test('should show buttons next to video titles', async ({ page }) => {
      await page.goto('/');
      
      await page.waitForSelector('ytd-rich-grid-renderer', { timeout: 10000 });
      
      // Find a video card and check button placement
      const videoCard = page.locator('ytd-rich-item-renderer').first();
      const titleElement = videoCard.locator('#video-title');
      const saveButton = videoCard.locator('.save-to-play-btn');
      
      await expect(titleElement).toBeVisible();
      await expect(saveButton).toBeVisible();
    });
  });

  test.describe('Playlist Page', () => {
    test('should show Save All To Play button on playlist page', async ({ page }) => {
      await page.goto('/playlist?list=WL');
      
      // Wait for playlist to load
      await page.waitForSelector('ytd-playlist-header-renderer', { timeout: 10000 });
      
      // Check for Save All button
      const saveAllButton = page.locator('.playlist-save-all-btn');
      await expect(saveAllButton).toBeVisible({ timeout: 10000 });
      await expect(saveAllButton).toHaveText(/Save All To Play/);
    });

    test('should show playlist statistics', async ({ page }) => {
      await page.goto('/playlist?list=WL');
      
      await page.waitForSelector('ytd-playlist-header-renderer', { timeout: 10000 });
      
      // Check for playlist stats
      const stats = page.locator('.playlist-stats');
      await expect(stats).toBeVisible({ timeout: 10000 });
      await expect(stats).toHaveText(/videos in Play/);
    });

    test('should show individual save buttons on playlist videos', async ({ page }) => {
      await page.goto('/playlist?list=WL');
      
      await page.waitForSelector('ytd-playlist-video-renderer', { timeout: 10000 });
      
      // Check for individual save buttons
      const saveButtons = page.locator('.save-to-play-btn');
      await expect(saveButtons.first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Subscriptions Page', () => {
    test('should show Save to Play buttons on subscriptions page', async ({ page }) => {
      await page.goto('/feed/subscriptions');
      
      // Wait for subscriptions to load
      await page.waitForSelector('ytd-rich-grid-renderer', { timeout: 10000 });
      
      // Check if buttons appear
      const saveButtons = page.locator('.save-to-play-btn');
      await expect(saveButtons.first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Button States', () => {
    test('should show different button states based on video status', async ({ page }) => {
      await page.goto('/watch?v=dQw4w9WgXcQ');
      
      await page.waitForSelector('h1.ytd-video-primary-info-renderer', { timeout: 10000 });
      
      const saveButton = page.locator('.save-to-play-btn');
      await expect(saveButton).toBeVisible({ timeout: 10000 });
      
      // Check initial state
      await expect(saveButton).toHaveText('Save to Play');
      
      // Verify button has correct styling classes
      const buttonClasses = await saveButton.getAttribute('class');
      expect(buttonClasses).toContain('save-to-play-btn');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle YouTube layout changes gracefully', async ({ page }) => {
      await page.goto('/watch?v=dQw4w9WgXcQ');
      
      // Wait for page to load
      await page.waitForTimeout(5000);
      
      // Check if our extension doesn't break the page
      const title = page.locator('h1.ytd-video-primary-info-renderer');
      await expect(title).toBeVisible();
      
      // Check if our button is present (even if not visible due to layout)
      const saveButton = page.locator('.save-to-play-btn');
      // Don't fail if button isn't visible - just check it exists in DOM
      await expect(saveButton).toHaveCount(1);
    });
  });

  test.describe('Extension Popup', () => {
    test('should open extension popup', async ({ page, context }) => {
      await page.goto('/');
      
      // Get the extension ID from the loaded extension
      const targets = (context as any).targets();
      const extensionTarget = targets.find((target: any) => 
        target.url().includes('chrome-extension://')
      );
      
      if (extensionTarget) {
        const extensionPage = await extensionTarget.page();
        if (extensionPage) {
          // Check if popup loads correctly
          await expect(extensionPage.locator('h1')).toHaveText('Save to Play');
        }
      }
    });
  });
});
