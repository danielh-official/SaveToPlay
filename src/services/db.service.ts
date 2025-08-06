import type { PlayVideo } from '@/types/video.types';

const DB_NAME = 'SaveToPlayDB';
const DB_VERSION = 1;
const VIDEOS_STORE = 'videos';

export class DatabaseService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(VIDEOS_STORE)) {
          const store = db.createObjectStore(VIDEOS_STORE, { keyPath: 'id' });
          store.createIndex('url', 'url', { unique: false });
          store.createIndex('saved_at', 'saved_at', { unique: false });
          store.createIndex('title', 'title', { unique: false });
        }
      };
    });
  }

  private async ensureConnection(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }

  async addVideo(video: PlayVideo): Promise<void> {
    await this.ensureConnection();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([VIDEOS_STORE], 'readwrite');
      const store = transaction.objectStore(VIDEOS_STORE);
      const request = store.add(video);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async updateVideo(video: PlayVideo): Promise<void> {
    await this.ensureConnection();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([VIDEOS_STORE], 'readwrite');
      const store = transaction.objectStore(VIDEOS_STORE);
      const request = store.put(video);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getVideo(id: string): Promise<PlayVideo | null> {
    await this.ensureConnection();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([VIDEOS_STORE], 'readonly');
      const store = transaction.objectStore(VIDEOS_STORE);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getVideoByUrl(url: string): Promise<PlayVideo | null> {
    await this.ensureConnection();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([VIDEOS_STORE], 'readonly');
      const store = transaction.objectStore(VIDEOS_STORE);
      const index = store.index('url');
      const request = index.get(url);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getAllVideos(): Promise<PlayVideo[]> {
    await this.ensureConnection();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([VIDEOS_STORE], 'readonly');
      const store = transaction.objectStore(VIDEOS_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async deleteVideo(id: string): Promise<void> {
    await this.ensureConnection();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([VIDEOS_STORE], 'readwrite');
      const store = transaction.objectStore(VIDEOS_STORE);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const dbService = new DatabaseService();
