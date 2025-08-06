import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

export default defineManifest({
  manifest_version: 3,
  name: '(Unofficial) Save To Play',
  version: pkg.version,
  description: 'Save YouTube videos to Play app',
  icons: {
    48: 'public/logo.png',
  },
  action: {
    default_popup: 'index.html',
    default_icon: {
      48: 'public/logo.png',
    },
  },
  content_security_policy: {
    extension_pages: "script-src 'self'; object-src 'self'",
  },
  host_permissions: ['https://www.youtube.com/*', 'https://youtube.com/*'],
  permissions: ['storage', 'clipboardRead', 'scripting'],
  background: {
    service_worker: 'src/background.ts',
  },
  content_scripts: [
    {
      matches: ['https://www.youtube.com/*', 'https://youtube.com/*'],
      js: ['src/content-script.ts'],
      run_at: 'document_end',
      all_frames: true, // Run in all frames to access YouTube's iframe components
    },
  ],
  web_accessible_resources: [
    {
      resources: ['index.html', 'assets/*'],
      matches: ['https://*/*', 'chrome-extension://*/*'],
    },
  ],
});
