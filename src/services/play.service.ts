import type { YouTubeVideoInfo, SyncResult } from '@/types/video.types';

export class PlayService {
  private readonly SHORTCUT_SETUP_URL =
    'https://github.com/danielh-official/SaveToPlay/blob/main/docs/shortcut.md';

  // Play app URL scheme for saving videos
  saveVideoToPlay(videoInfo: YouTubeVideoInfo): void {
    const playUrl = `play://add?url=${encodeURIComponent(videoInfo.url)}`;
    window.open(playUrl, '_blank');
  }

  // Check if Play app is installed by attempting to open the URL scheme
  async isPlayInstalled(): Promise<boolean> {
    return new Promise((resolve) => {
      // Use a more reliable test URL that Play app should handle
      const testUrl =
        'play://add?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = testUrl;

      const timeout: NodeJS.Timeout = setTimeout(() => {
        clearTimeout(timeout);
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        // Assume Play is installed if we don't get an error
        resolve(true);
      }, 1500);

      iframe.onload = () => {
        clearTimeout(timeout);
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        resolve(true);
      };

      iframe.onerror = () => {
        clearTimeout(timeout);
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        resolve(false);
      };

      document.body.appendChild(iframe);
    });
  }

  // Get the shortcut setup URL
  getShortcutSetupUrl(): string {
    return this.SHORTCUT_SETUP_URL;
  }

  // Sync videos from Play app using Shortcuts
  async syncVideosFromPlay(shortcutName: string): Promise<SyncResult> {
    try {
      // Use the Apple Shortcuts URL scheme to run the shortcut
      const encodedName = encodeURIComponent(shortcutName);
      const shortcutUrl = `shortcuts://run-shortcut?name=${encodedName}`;

      // Create a hidden iframe to trigger the shortcut without opening a new tab
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = shortcutUrl;
      document.body.appendChild(iframe);

      // Remove the iframe after a short delay
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);

      // Wait a bit for the shortcut to complete and potentially copy to clipboard
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Use background script to read clipboard (no focus issues)
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'syncVideos' }, (response) => {
          if (chrome.runtime.lastError) {
            resolve({
              success: false,
              message: 'Failed to communicate with extension',
              error: chrome.runtime.lastError.message,
            });
            return;
          }

          if (response.success) {
            resolve({
              success: true,
              message: response.message,
              videosAdded: response.videosAdded,
              videosUpdated: response.videosUpdated,
            });
          } else {
            resolve({
              success: false,
              message: response.error,
              error: response.error,
              needsManualPaste: response.needsManualPaste,
            });
          }
        });
      });
    } catch (error) {
      return {
        success: false,
        message: 'Failed to run shortcut',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Extract YouTube video info from current page
  extractYouTubeVideoInfo(): YouTubeVideoInfo | null {
    const url = window.location.href;
    const videoId = this.extractVideoId(url);

    if (!videoId) return null;

    const title = this.extractTitle();
    const channelName = this.extractChannelName();
    const channelUrl = this.extractChannelUrl();
    const thumbnailUrl = this.extractThumbnailUrl(videoId);

    return {
      id: videoId,
      title: title || 'Unknown Title',
      url,
      channelName: channelName || undefined,
      channelUrl: channelUrl || undefined,
      thumbnailUrl,
    };
  }

  private extractVideoId(url: string): string | null {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );
    return match ? match[1] : null;
  }

  private extractTitle(): string | null {
    const titleElement = document.querySelector(
      'meta[property="og:title"]'
    ) as HTMLMetaElement;
    return titleElement?.content || null;
  }

  private extractChannelName(): string | null {
    const channelElement = document.querySelector(
      'a[href*="/channel/"]'
    ) as HTMLAnchorElement;
    return channelElement?.textContent?.trim() || null;
  }

  private extractChannelUrl(): string | null {
    const channelElement = document.querySelector(
      'a[href*="/channel/"]'
    ) as HTMLAnchorElement;
    return channelElement?.href || null;
  }

  private extractThumbnailUrl(videoId: string): string {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
}

export const playService = new PlayService();
