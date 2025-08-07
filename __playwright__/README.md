# Browser Testing with Playwright

This directory contains browser-based tests for the Save to Play extension using Playwright.

## Overview

These tests verify that our extension works correctly by:

- Testing extension loading and basic functionality
- Verifying extension manifest and build output
- Checking content script injection on YouTube
- Handling YouTube automation detection gracefully
- Validating extension structure and files

## Note on YouTube Testing

Due to YouTube's automation detection, comprehensive testing of button interactions on live YouTube pages is challenging. The current approach focuses on:

1. **Basic Extension Tests** (`extension-basic.spec.ts`) - Verify extension loads and builds correctly
2. **YouTube Integration Tests** (`youtube-integration.spec.ts`) - More comprehensive tests (may fail due to automation detection)

## Test Structure

```
tests/
├── global-setup.ts           # Global setup for building extension
├── youtube-integration.spec.ts # Main YouTube integration tests
├── helpers/
│   └── youtube-helpers.ts    # Helper functions for common operations
└── README.md                 # This file
```

## Running Tests

### Local Development

```bash
# Run basic browser tests (recommended)
npm run test:browser:basic

# Run all browser tests (including YouTube integration)
npm run test:browser

# Run tests with UI (interactive)
npm run test:browser:ui

# Run tests in headed mode (see browser)
npm run test:browser:headed

# Run tests in debug mode
npm run test:browser:debug

# Run all tests (unit + basic browser tests)
npm run test:all
```

### CI/CD

Browser tests run automatically on:
- Push to main/develop branches
- Pull requests to main branch

## Test Categories

### Video Page Tests
- Button visibility next to video titles
- Correct button states (Save/Watched/Saved)
- URL scheme opening when clicked
- Error handling for layout changes

### Home Page Tests
- Save buttons on video cards
- Button placement next to titles
- Multiple buttons visible

### Playlist Page Tests
- Save All To Play button
- Playlist statistics display
- Individual video save buttons

### Subscriptions Page Tests
- Save buttons on subscription videos

### Extension Popup Tests
- Popup accessibility and functionality

## Configuration

### Playwright Config (`playwright.config.ts`)
- Loads our extension automatically
- Uses Chromium browser
- Captures screenshots and videos on failure
- Runs in headless mode by default

### Global Setup (`global-setup.ts`)
- Builds the extension before tests
- Verifies build output exists

## Debugging

### View Test Results
```bash
# Open HTML report
npx playwright show-report
```

### Debug Individual Tests
```bash
# Run specific test file
npx playwright test youtube-integration.spec.ts

# Run specific test
npx playwright test -g "should show Save to Play button"
```

### Manual Testing
```bash
# Run in headed mode to see browser
npm run test:browser:headed

# Run in debug mode for step-by-step debugging
npm run test:browser:debug
```

## Common Issues

### Extension Not Loading
- Ensure `npm run build` completes successfully
- Check that `dist/` folder exists
- Verify manifest.json is valid

### YouTube Layout Changes
- Tests may need updates if YouTube changes their DOM structure
- Use `test-results/` screenshots to debug layout issues
- Check YouTube selectors in test files

### Network Issues
- Tests use real YouTube pages
- Network timeouts may occur
- Consider mocking network requests for faster tests

## Adding New Tests

1. **Create test file**: Add new `.spec.ts` files in `tests/`
2. **Use helpers**: Leverage `YouTubeHelpers` class for common operations
3. **Follow patterns**: Use existing test structure and naming conventions
4. **Add documentation**: Update this README with new test categories

## Best Practices

- **Wait for elements**: Use proper wait conditions for YouTube's dynamic content
- **Mock external calls**: Mock `window.open` to prevent actual app launches
- **Handle timeouts**: Use appropriate timeout values for slow-loading pages
- **Test edge cases**: Include error scenarios and layout variations
- **Keep tests focused**: Each test should verify one specific behavior
