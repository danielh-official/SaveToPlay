import { defineConfig } from 'vitest/config';
import path from 'node:path';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    silent: true,
    setupFiles: ['./__tests__/setup.ts'],
    include: ['__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '__playwright__/**/*', // Exclude Playwright tests
      'node_modules/**',
      'dist/**',
      'coverage/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'cobertura'],
      exclude: [
        // Ignore configuration files
        'manifest.config.ts',
        'postcss.config.js',
        'tailwind.config.js',
        'vite.config.ts',
        'vitest.config.ts',
        'playwright.config.ts',
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
        // Ignore Playwright test files
        '__playwright__/**/*.spec.ts',
        '__playwright__/**/*.test.ts',
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
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
