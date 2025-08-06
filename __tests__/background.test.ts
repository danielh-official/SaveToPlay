import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the database service
vi.mock('@/services/db.service', () => ({
  dbService: {
    addVideo: vi.fn(),
    updateVideo: vi.fn(),
    getVideo: vi.fn(),
    getVideoByUrl: vi.fn(),
    getAllVideos: vi.fn(),
    init: vi.fn(),
    deleteVideo: vi.fn(),
  },
}));

// Mock Chrome API
global.chrome = {
  runtime: {
    onInstalled: {
      addListener: vi.fn(),
    },
    onMessage: {
      addListener: vi.fn(),
    },
  },
  tabs: {
    create: vi.fn(),
    query: vi.fn(),
    sendMessage: vi.fn(),
  },
  scripting: {
    executeScript: vi.fn(),
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
} as any;

// Import the background script functions
// import { dbService } from '@/services/db.service';

describe('Background Script', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Message Handling', () => {
    it('should handle getVideoByUrl message', async () => {
      const { dbService } = await import('@/services/db.service');

      const mockVideo = {
        id: 'test123',
        title: 'Test Video',
        url: 'https://www.youtube.com/watch?v=test123',
      };

      (dbService.getVideoByUrl as any).mockResolvedValue(mockVideo);

      // Simulate message handling
      const sendResponse = vi.fn();
      const request = {
        action: 'getVideoByUrl',
        url: 'https://www.youtube.com/watch?v=test123',
      };

      // Import and call the handler directly
      const backgroundModule = await import('@/background');
      await backgroundModule.handleGetVideoByUrl(request.url, sendResponse);

      expect(dbService.getVideoByUrl).toHaveBeenCalledWith(request.url);
      expect(sendResponse).toHaveBeenCalledWith({
        success: true,
        video: mockVideo,
      });
    });

    it('should handle getVideoByUrl message when video not found', async () => {
      const { dbService } = await import('@/services/db.service');

      (dbService.getVideoByUrl as any).mockResolvedValue(null);

      const sendResponse = vi.fn();
      const request = {
        action: 'getVideoByUrl',
        url: 'https://www.youtube.com/watch?v=nonexistent',
      };

      const backgroundModule = await import('@/background');
      await backgroundModule.handleGetVideoByUrl(request.url, sendResponse);

      expect(dbService.getVideoByUrl).toHaveBeenCalledWith(request.url);
      expect(sendResponse).toHaveBeenCalledWith({
        success: true,
        video: null,
      });
    });

    it('should handle getAllVideos message', async () => {
      const { dbService } = await import('@/services/db.service');

      const mockVideos = [
        { id: 'test1', title: 'Video 1' },
        { id: 'test2', title: 'Video 2' },
      ];

      (dbService.getAllVideos as any).mockResolvedValue(mockVideos);

      const sendResponse = vi.fn();

      const backgroundModule = await import('@/background');
      await backgroundModule.handleGetAllVideos(sendResponse);

      expect(dbService.getAllVideos).toHaveBeenCalled();
      expect(sendResponse).toHaveBeenCalledWith({
        success: true,
        videos: mockVideos,
      });
    });

    it('should handle getAllVideos message when database error occurs', async () => {
      const { dbService } = await import('@/services/db.service');

      (dbService.getAllVideos as any).mockRejectedValue(
        new Error('Database error')
      );

      const sendResponse = vi.fn();

      const backgroundModule = await import('@/background');
      await backgroundModule.handleGetAllVideos(sendResponse);

      expect(dbService.getAllVideos).toHaveBeenCalled();
      expect(sendResponse).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
      });
    });

    it('should handle saveVideo message for direct save', async () => {
      const { dbService } = await import('@/services/db.service');

      const videoData = {
        id: 'test123',
        title: 'Test Video',
        url: 'https://www.youtube.com/watch?v=test123',
      };

      (dbService.addVideo as any).mockResolvedValue(undefined);

      const sendResponse = vi.fn();

      const backgroundModule = await import('@/background');
      await backgroundModule.handleSaveVideo(videoData, sendResponse);

      expect(dbService.addVideo).toHaveBeenCalledWith(videoData);
      expect(sendResponse).toHaveBeenCalledWith({
        success: true,
        message: 'Video saved to database',
      });
    });

    it('should handle saveVideo message for Play app save', async () => {
      const { dbService } = await import('@/services/db.service');

      const videoData = {
        url: 'https://www.youtube.com/watch?v=test123',
      };

      (dbService.addVideo as any).mockResolvedValue(undefined);
      (chrome.tabs.create as any).mockResolvedValue(undefined);

      const sendResponse = vi.fn();

      const backgroundModule = await import('@/background');
      await backgroundModule.handleSaveVideo(videoData, sendResponse);

      expect(chrome.tabs.create).toHaveBeenCalledWith({
        url: 'play://add?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3Dtest123',
        active: false,
      });
      expect(dbService.addVideo).toHaveBeenCalled();
      expect(sendResponse).toHaveBeenCalledWith({
        success: true,
        message: 'Video saved to Play',
      });
    });

    it('should handle saveVideo message when database error occurs', async () => {
      const { dbService } = await import('@/services/db.service');

      const videoData = {
        id: 'test123',
        title: 'Test Video',
        url: 'https://www.youtube.com/watch?v=test123',
      };

      (dbService.addVideo as any).mockRejectedValue(
        new Error('Database error')
      );

      const sendResponse = vi.fn();

      const backgroundModule = await import('@/background');
      await backgroundModule.handleSaveVideo(videoData, sendResponse);

      expect(sendResponse).toHaveBeenCalledWith({
        success: false,
        error: 'Database error',
      });
    });
  });
});
