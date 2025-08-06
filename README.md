# Save to Play Browser Extension

A browser extension that integrates with the [Play app](https://apps.apple.com/us/app/play-save-videos-watch-later/id1596506190) to save YouTube videos and sync video data.

## Features

- **Save YouTube videos to Play**: Click the "Save to Play" button on YouTube videos to save videos directly to your Play app
- **Sync video data**: Sync your Play library with the extension to see saved video information on YouTube (_requires Apple Shortcuts_)
- **Local database**: Stores video metadata locally for quick access and offline functionality

## Installation

### Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

### Building for Production

```bash
npm run prepare
```

or

```bash
npm run build
```

if you're in a hurry.

The built extension will be in the `dist` folder.

## Usage

### Saving Videos

1. Navigate to any YouTube page (e.g., home, playlist, playback)
2. Click the "Save to Play" button next to the title
3. The video will be saved to your Play app (if installed)

### Syncing Video Data

1. Click the extension icon to open the popup
2. Set up the Apple Shortcut (see: [Shortcut Documentation](./docs/shortcut.md))
3. Click "Sync Videos" to sync your Play library to your browser

## Technical Details

### Architecture

- **Vue 3**: Frontend framework for the popup UI
- **TypeScript**: Type-safe development
- **IndexedDB**: Local database for storing video metadata
- **Play URL Scheme**: Integration with the Play app (see: https://marcosatanaka.com/support/play/play-help.html#url-schemes)

### File Structure

```
SaveToPlay/
├── src/                         # Source code
│   ├── services/                # Business logic services
│   │   ├── db.service.ts        # IndexedDB operations
│   │   └── play.service.ts      # Play app integration
│   ├── styles/                  # CSS styles
│   │   ├── content-script.css   # YouTube button styles
│   │   └── style.css            # Global styles
│   ├── types/                   # TypeScript type definitions
│   │   ├── chrome.d.ts          # Chrome extension API types
│   │   ├── video.types.ts       # Video data interfaces
│   │   └── vue-shims.d.ts       # Vue TypeScript declarations
│   ├── App.vue                  # Main popup component
│   ├── background.ts            # Service worker (background script)
│   ├── content-script.ts        # YouTube page integration
│   └── main.ts                  # Vue app entry point
├── __tests__/                   # Test files
│   ├── components/              # Component tests
│   │   └── App.test.ts          # App.vue component tests
│   ├── services/                # Service tests
│   │   ├── db.service.test.ts   # Database service tests
│   │   └── play.service.test.ts # Play service tests
│   ├── background.test.ts       # Background script tests
│   ├── content-script.test.ts   # Content script tests
│   └── setup.ts                 # Test configuration
├── docs/                        # Documentation
│   ├── shortcut.md              # Apple Shortcut setup guide
│   ├── privacy.md               # Privacy policy
│   └── images/                  # Documentation images
├── public/                      # Static assets
│   └── logo.png                 # Extension icon
├── dist/                        # Built extension (generated)
├── manifest.config.ts           # Extension manifest configuration
├── vite.config.ts               # Vite build configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── tsconfig.json                # TypeScript configuration
├── .eslintrc.cjs                # ESLint configuration
├── .prettierrc                  # Prettier configuration
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## Development

### Testing

```bash
# Run tests
npm run test:once

# Run tests with coverage
npm run test:coverage:once

# Run tests in watch mode
npm run test
```

### Code Quality

```bash
# Format code
npm run format

# Lint code
npm run lint
```

## Limitations

- **Apple-only**: The Play app is only available on Apple devices
- **Shortcuts dependency**: Video syncing requires Apple Shortcuts setup
- **Manual sync**: Video data sync is not automatic and requires user action

## Contributing

1. Fork the repository
2. Create a branch
3. Make your changes
4. Add tests where appropriate (e.g., new funcitonality, bug fixes)
5. Submit a pull request

## License

This project is licensed under the MIT License. See: [LICENSE](LICENSE)
