import path from 'node:path';
import { crx } from '@crxjs/vite-plugin';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import zip from 'vite-plugin-zip-pack';
import manifest from './manifest.config.ts';
import { name, version } from './package.json';

export default defineConfig({
  resolve: {
    alias: {
      '@': `${path.resolve(__dirname, 'src')}`,
      '@dev': `${path.resolve(__dirname, '__dev__')}`,
    },
  },
  define: {
    // Environment variables
  },
  plugins: [
    vue(),
    crx({ manifest }),
    zip({ outDir: 'release', outFileName: `crx-${name}-${version}.zip` }),
  ],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.* calls
        drop_debugger: true, // Remove debugger statements
      },
      format: {
        comments: false, // Remove comments
      },
    },
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    silent: true,
    setupFiles: ['./__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'cobertura'],
      exclude: [
        // Ignore configuration files
        'manifest.config.ts',
        'postcss.config.js',
        'tailwind.config.js',
        'vite.config.ts',
        'tsconfig.json',
        'package.json',
        'package-lock.json',
        'index.html',
        '.prettierrc',
        '.prettierignore',
        '.gitignore',
        // Ignore entry points that don't need testing
        'src/main.ts',
        // Ignore test files themselves
        '**/*.test.ts',
        '**/*.test.js',
        '**/__tests__/**',
        // Ignore build artifacts
        'dist/**',
        'coverage/**',
        'node_modules/**',
        // Ignore other non-source files
        'public/**',
        'release/**',
      ],
      include: [
        // Focus on Vue components and source files
        'src/**/*.vue',
        'src/**/*.ts',
        'src/**/*.js',
      ],
    },
  },
});
