import { Page, Locator, expect } from '@playwright/test';

export class YouTubeHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for YouTube page to fully load
   */
  async waitForYouTubeLoad() {
    await this.page.waitForTimeout(2000);
  }

  /**
   * Wait for video page to load
   */
  async waitForVideoPage() {
    await this.page.waitForSelector('h1.ytd-video-primary-info-renderer', { timeout: 10000 });
  }

  /**
   * Wait for home page to load
   */
  async waitForHomePage() {
    await this.page.waitForSelector('ytd-rich-grid-renderer', { timeout: 10000 });
  }

  /**
   * Wait for playlist page to load
   */
  async waitForPlaylistPage() {
    await this.page.waitForSelector('ytd-playlist-header-renderer', { timeout: 10000 });
  }

  /**
   * Get Save to Play button
   */
  getSaveButton(): Locator {
    return this.page.locator('.save-to-play-btn');
  }

  /**
   * Get Save All To Play button
   */
  getSaveAllButton(): Locator {
    return this.page.locator('.playlist-save-all-btn');
  }

  /**
   * Get playlist stats
   */
  getPlaylistStats(): Locator {
    return this.page.locator('.playlist-stats');
  }

  /**
   * Mock window.open to capture URLs
   */
  async mockWindowOpen() {
    await this.page.addInitScript(() => {
      window.open = (url?: string | URL) => {
        if (typeof url === 'string') {
          (window as any).lastOpenedUrl = url;
        }
        return null;
      };
    });
  }

  /**
   * Get the last opened URL
   */
  async getLastOpenedUrl(): Promise<string | null> {
    return await this.page.evaluate(() => (window as any).lastOpenedUrl || null);
  }

  /**
   * Check if button has correct styling
   */
  async checkButtonStyling(button: Locator) {
    await expect(button).toHaveClass(/save-to-play-btn/);
    const classes = await button.getAttribute('class');
    expect(classes).toContain('save-to-play-btn');
  }

  /**
   * Navigate to a specific video
   */
  async goToVideo(videoId: string) {
    await this.page.goto(`/watch?v=${videoId}`);
    await this.waitForVideoPage();
  }

  /**
   * Navigate to home page
   */
  async goToHome() {
    await this.page.goto('/');
    await this.waitForHomePage();
  }

  /**
   * Navigate to playlist
   */
  async goToPlaylist(playlistId: string) {
    await this.page.goto(`/playlist?list=${playlistId}`);
    await this.waitForPlaylistPage();
  }

  /**
   * Navigate to subscriptions
   */
  async goToSubscriptions() {
    await this.page.goto('/feed/subscriptions');
    await this.waitForHomePage();
  }

  /**
   * Get video cards on home/subscriptions page
   */
  getVideoCards(): Locator {
    return this.page.locator('ytd-rich-item-renderer');
  }

  /**
   * Get playlist videos
   */
  getPlaylistVideos(): Locator {
    return this.page.locator('ytd-playlist-video-renderer');
  }

  /**
   * Check if extension popup is accessible
   */
  async checkExtensionPopup(context: any) {
    const targets = context.targets();
    const extensionTarget = targets.find((target: any) => 
      target.url().includes('chrome-extension://')
    );
    
    if (extensionTarget) {
      const extensionPage = await extensionTarget.page();
      if (extensionPage) {
        await expect(extensionPage.locator('h1')).toHaveText('Save to Play');
        return true;
      }
    }
    return false;
  }
}
