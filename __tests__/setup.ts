import { vi } from 'vitest';

// Mock chrome API
(global as any).chrome = {
  runtime: {
    getManifest: vi.fn(() => ({ version: '0.1.0' })),
    onMessage: {
      addListener: vi.fn(),
    },
    sendMessage: vi.fn(),
  },
  tabs: {
    create: vi.fn(),
  },
} as any;

// Mock indexedDB
import 'fake-indexeddb/auto';
