import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseService } from '@/services/db.service';
import type { PlayVideo } from '@/types/video.types';

describe('DatabaseService', () => {
  let dbService: DatabaseService;

  beforeEach(async () => {
    dbService = new DatabaseService();
    await dbService.init();
  });

  afterEach(async () => {
    // Clean up by deleting all videos
    const videos = await dbService.getAllVideos();
    for (const video of videos) {
      await dbService.deleteVideo(video.id);
    }
  });

  it('should add a video to the database', async () => {
    const video: PlayVideo = {
      id: 'test-1',
      title: 'Test Video',
      url: 'https://www.youtube.com/watch?v=test1',
      channel: {
        id: 'UC123',
        name: 'Test Channel',
      },
      saved_at: new Date().toISOString(),
      last_synced_at: new Date().toISOString(),
    };

    await dbService.addVideo(video);
    const retrievedVideo = await dbService.getVideo('test-1');

    expect(retrievedVideo).toEqual(video);
  });

  it('should update an existing video', async () => {
    const video: PlayVideo = {
      id: 'test-2',
      title: 'Original Title',
      url: 'https://www.youtube.com/watch?v=test2',
      saved_at: new Date().toISOString(),
      last_synced_at: new Date().toISOString(),
    };

    await dbService.addVideo(video);

    const updatedVideo = {
      ...video,
      title: 'Updated Title',
      channel: {
        id: 'UC456',
        name: 'New Channel',
      },
    };

    await dbService.updateVideo(updatedVideo);
    const retrievedVideo = await dbService.getVideo('test-2');

    expect(retrievedVideo).toEqual(updatedVideo);
  });

  it('should find video by URL', async () => {
    const video: PlayVideo = {
      id: 'test-3',
      title: 'Test Video',
      url: 'https://www.youtube.com/watch?v=test3',
      saved_at: new Date().toISOString(),
      last_synced_at: new Date().toISOString(),
    };

    await dbService.addVideo(video);
    const foundVideo = await dbService.getVideoByUrl(
      'https://www.youtube.com/watch?v=test3'
    );

    expect(foundVideo).toEqual(video);
  });

  it('should return null for non-existent video', async () => {
    const video = await dbService.getVideo('non-existent');
    expect(video).toBeNull();
  });

  it('should return all videos', async () => {
    const video1: PlayVideo = {
      id: 'test-4',
      title: 'Video 1',
      url: 'https://www.youtube.com/watch?v=test4',
      saved_at: new Date().toISOString(),
      last_synced_at: new Date().toISOString(),
    };

    const video2: PlayVideo = {
      id: 'test-5',
      title: 'Video 2',
      url: 'https://www.youtube.com/watch?v=test5',
      saved_at: new Date().toISOString(),
      last_synced_at: new Date().toISOString(),
    };

    await dbService.addVideo(video1);
    await dbService.addVideo(video2);

    const allVideos = await dbService.getAllVideos();
    expect(allVideos).toHaveLength(2);
    expect(allVideos).toEqual(expect.arrayContaining([video1, video2]));
  });

  it('should delete a video', async () => {
    const video: PlayVideo = {
      id: 'test-6',
      title: 'Test Video',
      url: 'https://www.youtube.com/watch?v=test6',
      saved_at: new Date().toISOString(),
      last_synced_at: new Date().toISOString(),
    };

    await dbService.addVideo(video);
    await dbService.deleteVideo('test-6');

    const retrievedVideo = await dbService.getVideo('test-6');
    expect(retrievedVideo).toBeNull();
  });
});
