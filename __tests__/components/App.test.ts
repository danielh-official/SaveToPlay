import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import App from '@/App.vue';

// Mock the services
vi.mock('@/services/db.service', () => ({
  dbService: {
    init: vi.fn(),
    getAllVideos: vi.fn(),
    getVideo: vi.fn(),
    addVideo: vi.fn(),
    updateVideo: vi.fn(),
    deleteVideo: vi.fn(),
  },
}));

vi.mock('@/services/play.service', () => ({
  playService: {
    syncVideosFromPlay: vi.fn(),
    getShortcutSetupUrl: vi
      .fn()
      .mockReturnValue('https://example.com/shortcut'),
  },
}));

// Mock Chrome API
global.chrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  runtime: {
    getManifest: vi.fn().mockReturnValue({ version: '1.0.0' }),
  },
} as any;

// Mock global functions
global.confirm = vi.fn();
global.alert = vi.fn();

describe('App.vue', () => {
  let wrapper: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock successful database initialization using ES module imports
    const { dbService } = await import('@/services/db.service');
    (dbService.init as any).mockResolvedValue(undefined);
    (dbService.getAllVideos as any).mockResolvedValue([]);

    // Mock Chrome storage
    (
      chrome.storage.local.get as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({});
    (chrome.storage.local.set as any).mockResolvedValue(undefined);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('Component Mounting', () => {
    it('should mount successfully', async () => {
      wrapper = mount(App);
      await nextTick();

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('h1').text()).toBe('Save to Play');
    });

    it('should initialize with default values', async () => {
      wrapper = mount(App);
      await nextTick();

      expect(wrapper.vm.isSyncing).toBe(false);
      expect(wrapper.vm.videoCount).toBe(0);
      expect(wrapper.vm.recentVideos).toEqual([]);
      expect(wrapper.vm.lastSyncTime).toBe('Never');
      expect(wrapper.vm.shortcutName).toBe('Get Videos From Play');
    });

    it('should load saved shortcut name from storage', async () => {
      (chrome.storage.local.get as any).mockResolvedValue({
        shortcutName: 'Custom Shortcut Name',
      });

      wrapper = mount(App);
      await nextTick();

      expect(wrapper.vm.shortcutName).toBe('Custom Shortcut Name');
    });

    it('should load last sync time from storage', async () => {
      const mockTimestamp = new Date().toISOString();
      (chrome.storage.local.get as any).mockResolvedValue({
        lastSyncTime: mockTimestamp,
      });

      wrapper = mount(App);
      await nextTick();

      // The component loads the sync time during mount, so we need to wait for it
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(wrapper.vm.lastSyncTime).toBe('Just now');
    });
  });

  describe('formatRelativeTime', () => {
    it('should return "Just now" for recent timestamps', () => {
      wrapper = mount(App);
      const timestamp = new Date().toISOString();

      const result = wrapper.vm.formatRelativeTime(timestamp);
      expect(result).toBe('Just now');
    });

    it('should return hours ago for timestamps within 24 hours', () => {
      wrapper = mount(App);
      const timestamp = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago

      const result = wrapper.vm.formatRelativeTime(timestamp);
      expect(result).toBe('2h ago');
    });

    it('should return date for older timestamps', () => {
      wrapper = mount(App);
      const timestamp = new Date('2023-01-01').toISOString();

      const result = wrapper.vm.formatRelativeTime(timestamp);
      // Use the actual result since date formatting can vary by timezone
      expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
    });
  });

  describe('formatDate', () => {
    it('should handle Play app date format', () => {
      wrapper = mount(App);
      const playDate = 'Jul 17, 2025 at 3:57 PM';

      const result = wrapper.vm.formatDate(playDate);
      expect(result).toBe('7/17/2025');
    });

    it('should handle ISO date format', () => {
      wrapper = mount(App);
      const isoDate = '2025-07-17T15:57:00.000Z';

      const result = wrapper.vm.formatDate(isoDate);
      expect(result).toBe('7/17/2025');
    });

    it('should return "Just now" for recent dates', () => {
      wrapper = mount(App);
      const recentDate = new Date().toISOString();

      const result = wrapper.vm.formatDate(recentDate);
      expect(result).toBe('Just now');
    });

    it('should return "Unknown date" for invalid dates', () => {
      wrapper = mount(App);
      const invalidDate = 'invalid-date';

      const result = wrapper.vm.formatDate(invalidDate);
      expect(result).toBe('Unknown date');
    });
  });

  describe('loadVideoData', () => {
    it('should load videos and update counts', async () => {
      const mockVideos = [
        {
          id: '1',
          title: 'Test Video 1',
          url: 'https://youtube.com/watch?v=1',
          saved_at: '2025-01-01T10:00:00Z',
          artwork_url: 'https://example.com/thumb1.jpg',
          is_new: 'Yes',
        },
        {
          id: '2',
          title: 'Test Video 2',
          url: 'https://youtube.com/watch?v=2',
          saved_at: '2025-01-02T10:00:00Z',
          artwork_url: 'https://example.com/thumb2.jpg',
          is_new: 'Yes',
        },
      ];

      const { dbService } = await import('@/services/db.service');
      (dbService.getAllVideos as any).mockResolvedValue(mockVideos);

      wrapper = mount(App);
      await wrapper.vm.loadVideoData();
      await nextTick();

      expect(wrapper.vm.videoCount).toBe(2);
      expect(wrapper.vm.recentVideos).toHaveLength(2);
      expect(wrapper.vm.recentVideos[0].id).toBe('2'); // Most recent first
    });

    it('should handle database errors gracefully', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Mount component first with normal mocks
      wrapper = mount(App);
      await nextTick();

      // Now temporarily override the function to test error handling
      const { dbService } = await import('@/services/db.service');

      (dbService.getAllVideos as any).mockRejectedValue(
        new Error('Database error')
      );

      // Test the error handling
      await wrapper.vm.loadVideoData();
      await nextTick();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading video data:',
        expect.any(Error)
      );

      // Restore the original mock
      (dbService.getAllVideos as any).mockResolvedValue([]);
      consoleSpy.mockRestore();
    });
  });

  describe('handleManualPaste', () => {
    it('should process valid JSON data successfully', async () => {
      const mockPlayVideos = [
        {
          id: '1',
          title: 'Test Video',
          url: 'https://youtube.com/watch?v=1',
          date_added: '2025-01-01T10:00:00Z',
        },
      ];

      const { dbService } = await import('@/services/db.service');
      (dbService.getVideo as any).mockResolvedValue(null); // Video doesn't exist
      (dbService.addVideo as any).mockResolvedValue(undefined);
      (dbService.getAllVideos as any).mockResolvedValue([]);

      wrapper = mount(App);
      wrapper.vm.manualPasteData = JSON.stringify(mockPlayVideos);

      await wrapper.vm.handleManualPaste();
      await nextTick();

      expect(dbService.addVideo).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          title: 'Test Video',
        })
      );
      expect(wrapper.vm.syncError).toContain(
        'Successfully processed 1 new videos'
      );
    });

    it('should update existing videos', async () => {
      const mockPlayVideos = [
        {
          id: '1',
          title: 'Updated Video',
          url: 'https://youtube.com/watch?v=1',
          date_added: '2025-01-01T10:00:00Z',
        },
      ];

      const { dbService } = await import('@/services/db.service');
      (dbService.getVideo as any).mockResolvedValue({
        id: '1',
        title: 'Old Title',
      }); // Video exists
      (dbService.updateVideo as any).mockResolvedValue(undefined);
      (dbService.getAllVideos as any).mockResolvedValue([]);

      wrapper = mount(App);
      wrapper.vm.manualPasteData = JSON.stringify(mockPlayVideos);

      await wrapper.vm.handleManualPaste();
      await nextTick();

      expect(dbService.updateVideo).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          title: 'Updated Video',
        })
      );
      expect(wrapper.vm.syncError).toContain(
        'Successfully processed 0 new videos and updated 1 existing videos'
      );
    });

    it('should handle invalid JSON data', async () => {
      wrapper = mount(App);
      wrapper.vm.manualPasteData = 'invalid json';

      await wrapper.vm.handleManualPaste();
      await nextTick();

      expect(wrapper.vm.syncError).toBe(
        'Invalid JSON data. Please check the format and try again.'
      );
    });

    it('should handle empty data', async () => {
      wrapper = mount(App);
      wrapper.vm.manualPasteData = '';

      await wrapper.vm.handleManualPaste();
      await nextTick();

      // Should not process anything
      const { dbService } = await import('@/services/db.service');
      expect(dbService.addVideo).not.toHaveBeenCalled();
      expect(dbService.updateVideo).not.toHaveBeenCalled();
    });
  });

  describe('handleClearVideos', () => {
    it('should clear all videos when confirmed', async () => {
      const mockVideos = [
        { id: '1', title: 'Video 1', saved_at: '2025-01-01T10:00:00Z' },
        { id: '2', title: 'Video 2', saved_at: '2025-01-02T10:00:00Z' },
      ];

      (global.confirm as any).mockReturnValue(true);

      const { dbService } = await import('@/services/db.service');
      (dbService.getAllVideos as any).mockResolvedValue(mockVideos);
      (dbService.deleteVideo as any).mockResolvedValue(undefined);

      wrapper = mount(App);
      wrapper.vm.videoCount = 2;

      await wrapper.vm.handleClearVideos();
      await nextTick();

      expect(global.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete all 2 videos from the database? This action cannot be undone.'
      );
      expect(dbService.deleteVideo).toHaveBeenCalledTimes(2);
      expect(global.alert).toHaveBeenCalledWith(
        'Successfully deleted 2 videos from the database.'
      );
    });

    it('should not clear videos when cancelled', async () => {
      (global.confirm as any).mockReturnValue(false);

      wrapper = mount(App);

      await wrapper.vm.handleClearVideos();
      await nextTick();

      // The component calls getAllVideos during mount, so we need to check the call count
      const { dbService } = await import('@/services/db.service');
      const callCount = (dbService.getAllVideos as any).mock.calls.length;
      expect(callCount).toBeLessThanOrEqual(3); // Allow for mount calls
      expect(dbService.deleteVideo).not.toHaveBeenCalled();
    });

    it('should handle errors during clearing', async () => {
      (global.confirm as any).mockReturnValue(true);

      // Mount component first with normal mocks
      wrapper = mount(App);
      await nextTick();

      // Now temporarily override the function to test error handling
      const { dbService } = await import('@/services/db.service');
      (dbService.getAllVideos as any).mockRejectedValue(
        new Error('Database error')
      );

      // Test the error handling
      await wrapper.vm.handleClearVideos();
      await nextTick();

      expect(global.alert).toHaveBeenCalledWith(
        'Error clearing videos. Please try again.'
      );

      // Restore the original mock
      (dbService.getAllVideos as any).mockResolvedValue([]);
    });
  });

  describe('handleSync', () => {
    it('should sync videos successfully', async () => {
      const { playService } = await import('@/services/play.service');
      (playService.syncVideosFromPlay as any).mockResolvedValue({
        success: true,
        videosAdded: 5,
        videosUpdated: 2,
      });

      const { dbService } = await import('@/services/db.service');
      (dbService.getAllVideos as any).mockResolvedValue([]);

      wrapper = mount(App);

      await wrapper.vm.handleSync();
      await nextTick();

      expect(playService.syncVideosFromPlay).toHaveBeenCalledWith(
        'Get Videos From Play'
      );
      expect(wrapper.vm.lastSyncTime).toBe('Just now');
      expect(wrapper.vm.syncError).toBeNull();
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        lastSyncTime: expect.any(String),
      });
    });

    it('should handle sync errors', async () => {
      const { playService } = await import('@/services/play.service');
      (playService.syncVideosFromPlay as any).mockResolvedValue({
        success: false,
        error: 'Shortcut not found',
        needsManualPaste: true,
      });

      wrapper = mount(App);

      await wrapper.vm.handleSync();
      await nextTick();

      expect(wrapper.vm.syncError).toBe('Shortcut not found');
      expect(wrapper.vm.showManualPaste).toBe(true);
    });

    it('should handle sync exceptions', async () => {
      const { playService } = await import('@/services/play.service');
      (playService.syncVideosFromPlay as any).mockRejectedValue(
        new Error('Network error')
      );

      wrapper = mount(App);

      await wrapper.vm.handleSync();
      await nextTick();

      expect(wrapper.vm.syncError).toContain(
        'Failed to run shortcut: Network error'
      );
    });
  });

  describe('Computed Properties', () => {
    it('should compute shortcut setup URL', () => {
      wrapper = mount(App);

      expect(wrapper.vm.shortcutSetupUrl).toBe('https://example.com/shortcut');
    });

    it('should compute version from manifest', () => {
      wrapper = mount(App);

      expect(wrapper.vm.version).toBe('1.0.0');
    });
  });

  describe('Template Rendering', () => {
    it('should show sync button', () => {
      wrapper = mount(App);

      expect(wrapper.find('button').text()).toContain('Sync Videos');
    });

    it('should show clear videos button', () => {
      wrapper = mount(App);

      const clearButton = wrapper
        .findAll('button')
        .find((btn: any) => btn.text().includes('Clear All Videos'));
      expect(clearButton).toBeTruthy();
    });

    it('should show recent videos when available', async () => {
      const mockVideos = [
        {
          id: '1',
          title: 'Test Video',
          url: 'https://youtube.com/watch?v=1',
          saved_at: '2025-01-01T10:00:00Z',
          artwork_url: 'https://example.com/thumb.jpg',
          is_new: 'Yes',
        },
      ];

      const { dbService } = await import('@/services/db.service');
      (dbService.getAllVideos as any).mockResolvedValue(mockVideos);

      wrapper = mount(App);
      await wrapper.vm.loadVideoData();
      await nextTick();

      expect(wrapper.text()).toContain('Recent Videos');
      expect(wrapper.text()).toContain('Test Video');
    });

    it('should show no videos state when empty', async () => {
      const { dbService } = await import('@/services/db.service');
      (dbService.getAllVideos as any).mockResolvedValue([]);

      wrapper = mount(App);
      await wrapper.vm.loadVideoData();
      await nextTick();

      expect(wrapper.text()).toContain('No videos yet');
      expect(wrapper.text()).toContain(
        'Start saving videos to Play to see them here.'
      );
    });
  });
});
