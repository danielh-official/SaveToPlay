import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

async function globalSetup(config: FullConfig) {
  // Ensure the extension is built
  console.log('Building extension for Playwright tests...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Extension built successfully');
  } catch (error) {
    console.error('Failed to build extension:', error);
    throw error;
  }

  // Verify the dist folder exists
  const distPath = path.join(process.cwd(), 'dist');
  const fs = await import('fs');
  if (!fs.default.existsSync(distPath)) {
    throw new Error('dist folder not found after build');
  }

  // Set environment variable with absolute path for Playwright config
  process.env.EXTENSION_PATH = distPath;
  console.log('Extension path set to:', distPath);

  console.log('Global setup completed');
}

export default globalSetup;
