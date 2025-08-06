import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PlayService } from '@/services/play.service';
import type { YouTubeVideoInfo } from '@/types/video.types';

// Mock the database service
vi.mock('@/services/db.service', () => ({
  dbService: {
    addVideo: vi.fn(),
    updateVideo: vi.fn(),
    getVideo: vi.fn(),
    getAllVideos: vi.fn(),
    init: vi.fn(),
  },
}));

describe('PlayService', () => {
  let playService: PlayService;

  beforeEach(() => {
    playService = new PlayService();
    vi.clearAllMocks();
  });

  describe('extractYouTubeVideoInfo', () => {
    it('should extract video info from YouTube URL', () => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          hostname: 'www.youtube.com',
          pathname: '/watch',
        },
        writable: true,
      });

      // Mock document.querySelector
      const mockTitleElement = { content: 'Test Video Title' };
      const mockChannelElement = {
        textContent: 'Test Channel',
        href: 'https://www.youtube.com/channel/test',
      };

      vi.spyOn(document, 'querySelector')
        .mockReturnValueOnce(mockTitleElement as any) // og:title
        .mockReturnValueOnce(mockChannelElement as any) // channel name
        .mockReturnValueOnce(mockChannelElement as any); // channel URL

      const result = playService.extractYouTubeVideoInfo();

      expect(result).toEqual({
        id: 'dQw4w9WgXcQ',
        title: 'Test Video Title',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        channelName: 'Test Channel',
        channelUrl: 'https://www.youtube.com/channel/test',
        thumbnailUrl:
          'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      });
    });

    it('should return null for non-YouTube video page', () => {
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://www.youtube.com/feed/trending',
          hostname: 'www.youtube.com',
          pathname: '/feed/trending',
        },
        writable: true,
      });

      const result = playService.extractYouTubeVideoInfo();
      expect(result).toBeNull();
    });

    it('should handle missing metadata gracefully', () => {
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          hostname: 'www.youtube.com',
          pathname: '/watch',
        },
        writable: true,
      });

      vi.spyOn(document, 'querySelector').mockReturnValue(null);

      const result = playService.extractYouTubeVideoInfo();

      expect(result).toEqual({
        id: 'dQw4w9WgXcQ',
        title: 'Unknown Title',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        channelName: undefined,
        channelUrl: undefined,
        thumbnailUrl:
          'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      });
    });
  });

  describe('saveVideoToPlay', () => {
    it('should open Play app with correct URL', () => {
      const mockOpen = vi.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true,
      });

      const videoInfo: YouTubeVideoInfo = {
        id: 'test123',
        title: 'Test Video',
        url: 'https://www.youtube.com/watch?v=test123',
      };

      playService.saveVideoToPlay(videoInfo);

      expect(mockOpen).toHaveBeenCalledWith(
        'play://add?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3Dtest123',
        '_blank'
      );
    });
  });

  describe('getShortcutSetupUrl', () => {
    it('should return the shortcut setup URL', () => {
      const url = playService.getShortcutSetupUrl();
      expect(url).toBe(
        'https://github.com/danielh-official/SaveToPlay/blob/main/docs/shortcut.md'
      );
    });
  });

  describe('syncVideosFromPlay', () => {
    beforeEach(() => {
      // Mock Chrome API
      global.chrome = {
        runtime: {
          sendMessage: vi.fn(),
          lastError: null,
        },
        tabs: {
          query: vi.fn(),
          sendMessage: vi.fn(),
        },
        scripting: {
          executeScript: vi.fn(),
        },
      } as any;

      // Mock document.body and iframe operations
      const mockIframe = {
        style: { display: 'none' },
        src: '',
        onload: null as any,
        onerror: null as any,
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockIframe as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(
        () => mockIframe as any
      );
      vi.spyOn(document.body, 'contains').mockReturnValue(true);
      vi.spyOn(document.body, 'removeChild').mockImplementation(
        () => mockIframe as any
      );

      // Use fake timers to skip delays
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return a success result when shortcut is triggered', async () => {
      // Mock successful background script response
      (chrome.runtime.sendMessage as any).mockImplementation(
        (
          message: { action: string },
          callback: (arg0: {
            success: boolean;
            message: string;
            videosAdded: number;
            videosUpdated: number;
          }) => void
        ) => {
          if (message.action === 'syncVideos') {
            callback({
              success: true,
              message:
                'Synced 1 new videos and updated 0 existing videos from injected_script.',
              videosAdded: 1,
              videosUpdated: 0,
            });
          }
        }
      );

      const resultPromise = playService.syncVideosFromPlay('Test Shortcut');

      // Fast-forward time to skip the 5-second delay
      vi.advanceTimersByTime(5000);

      const result = await resultPromise;

      expect(result).toEqual({
        success: true,
        message:
          'Synced 1 new videos and updated 0 existing videos from injected_script.',
        videosAdded: 1,
        videosUpdated: 0,
      });
    });

    it('should handle clipboard reading failure', async () => {
      // Mock failed background script response
      (chrome.runtime.sendMessage as any).mockImplementation(
        (
          message: { action: string },
          callback: (arg0: {
            success: boolean;
            error: string;
            needsManualPaste: boolean;
          }) => void
        ) => {
          if (message.action === 'syncVideos') {
            callback({
              success: false,
              error:
                'Could not read clipboard from any source. Please use manual paste.',
              needsManualPaste: true,
            });
          }
        }
      );

      const resultPromise = playService.syncVideosFromPlay('Test Shortcut');

      // Fast-forward time to skip the 5-second delay
      vi.advanceTimersByTime(5000);

      const result = await resultPromise;

      expect(result).toEqual({
        success: false,
        message:
          'Could not read clipboard from any source. Please use manual paste.',
        error:
          'Could not read clipboard from any source. Please use manual paste.',
        needsManualPaste: true,
      });
    });
  });

  describe('isPlayInstalled', () => {
    beforeEach(() => {
      // Mock iframe operations
      const mockIframe = {
        style: { display: 'none' },
        src: '',
        onload: null as any,
        onerror: null as any,
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockIframe as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(
        () => mockIframe as any
      );
      vi.spyOn(document.body, 'contains').mockReturnValue(true);
      vi.spyOn(document.body, 'removeChild').mockImplementation(
        () => mockIframe as any
      );
    });

    it('should resolve to true when iframe loads successfully', async () => {
      const mockIframe = {
        style: { display: 'none' },
        src: '',
        onload: null as any,
        onerror: null as any,
      };
      (document.createElement as any).mockReturnValue(mockIframe);

      const resultPromise = playService.isPlayInstalled();

      // Simulate successful iframe load
      setTimeout(() => {
        mockIframe.onload();
      }, 100);

      const result = await resultPromise;
      expect(result).toBe(true);
    });

    it('should resolve to false when iframe errors', async () => {
      const mockIframe = {
        style: { display: 'none' },
        src: '',
        onload: null as any,
        onerror: null as any,
      };
      (document.createElement as any).mockReturnValue(mockIframe);

      const resultPromise = playService.isPlayInstalled();

      // Simulate iframe error
      setTimeout(() => {
        mockIframe.onerror();
      }, 100);

      const result = await resultPromise;
      expect(result).toBe(false);
    });

    it('should resolve to true after timeout (assumes Play is installed)', async () => {
      const mockIframe = {
        style: { display: 'none' },
        src: '',
        onload: null as any,
        onerror: null as any,
      };
      (document.createElement as any).mockReturnValue(mockIframe);

      const resultPromise = playService.isPlayInstalled();

      // Don't trigger onload or onerror, let it timeout
      const result = await resultPromise;
      expect(result).toBe(true);
    });
  });

  describe('extractVideoId', () => {
    it('should extract video ID from standard YouTube URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const result = (playService as any).extractVideoId(url);
      expect(result).toBe('dQw4w9WgXcQ');
    });

    it('should extract video ID from youtu.be URL', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      const result = (playService as any).extractVideoId(url);
      expect(result).toBe('dQw4w9WgXcQ');
    });

    it('should extract video ID from URL with additional parameters', () => {
      const url =
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s&list=PL123';
      const result = (playService as any).extractVideoId(url);
      expect(result).toBe('dQw4w9WgXcQ');
    });

    it('should return null for non-YouTube URL', () => {
      const url = 'https://www.google.com';
      const result = (playService as any).extractVideoId(url);
      expect(result).toBeNull();
    });

    it('should return null for invalid YouTube URL', () => {
      const url = 'https://www.youtube.com/feed/trending';
      const result = (playService as any).extractVideoId(url);
      expect(result).toBeNull();
    });
  });

  describe('extractTitle', () => {
    it('should extract title from og:title meta tag', () => {
      const mockMetaElement = { content: 'Test Video Title' };
      vi.spyOn(document, 'querySelector').mockReturnValue(
        mockMetaElement as any
      );

      const result = (playService as any).extractTitle();
      expect(result).toBe('Test Video Title');
    });

    it('should return null when og:title meta tag is not found', () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null);

      const result = (playService as any).extractTitle();
      expect(result).toBeNull();
    });
  });

  describe('extractChannelName', () => {
    it('should extract channel name from channel link', () => {
      const mockChannelElement = { textContent: 'Test Channel' };
      vi.spyOn(document, 'querySelector').mockReturnValue(
        mockChannelElement as any
      );

      const result = (playService as any).extractChannelName();
      expect(result).toBe('Test Channel');
    });

    it('should return null when channel link is not found', () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null);

      const result = (playService as any).extractChannelName();
      expect(result).toBeNull();
    });

    it('should handle channel element with empty text content', () => {
      const mockChannelElement = { textContent: '   ' };
      vi.spyOn(document, 'querySelector').mockReturnValue(
        mockChannelElement as any
      );

      const result = (playService as any).extractChannelName();
      expect(result).toBeNull();
    });
  });

  describe('extractChannelUrl', () => {
    it('should extract channel URL from channel link', () => {
      const mockChannelElement = {
        href: 'https://www.youtube.com/channel/test',
      };
      vi.spyOn(document, 'querySelector').mockReturnValue(
        mockChannelElement as any
      );

      const result = (playService as any).extractChannelUrl();
      expect(result).toBe('https://www.youtube.com/channel/test');
    });

    it('should return null when channel link is not found', () => {
      vi.spyOn(document, 'querySelector').mockReturnValue(null);

      const result = (playService as any).extractChannelUrl();
      expect(result).toBeNull();
    });
  });

  describe('extractThumbnailUrl', () => {
    it('should generate correct thumbnail URL for video ID', () => {
      const videoId = 'dQw4w9WgXcQ';
      const result = (playService as any).extractThumbnailUrl(videoId);
      expect(result).toBe(
        'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
      );
    });
  });
});
