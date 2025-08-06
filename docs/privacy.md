# Privacy Policy for SaveToPlay Extension

**Last updated:** August 6, 2025

## Overview

Save To Play is a browser extension that helps you save YouTube videos to the Play app and sync video data back to your browser. This privacy policy explains how we handle your data.

## Data Collection

### What We Collect

**Local Storage Only:** Save To Play operates entirely within your browser and does not send any data to external servers. All data is stored locally on your device.

**Data Stored Locally:**

- YouTube video information (title, description, URL, thumbnail, duration)
- Video metadata from Play app (tags, notes, watch status, ratings)
- Extension settings (shortcut name, last sync time)
- Video save history and status

### What We Don't Collect

- Personal information (name, email, address)
- YouTube account credentials
- Play app credentials
- Browsing history outside of YouTube
- Any data that could identify you personally

## How Data Is Used

### Local Processing

**Video Saving:**

- Extract video information from YouTube pages
- Store video metadata locally for tracking saved videos
- Display save status on YouTube pages

**Sync Functionality:**

- Process video data from your Apple Shortcut
- Compare local data with Play app data
- Update video status and metadata locally

**Extension Features:**

- Remember your shortcut name preference
- Track last sync time for display
- Show recent videos in extension popup

### No External Transmission

- **No servers:** We don't have any servers to send data to
- **No analytics:** We don't track usage or collect analytics
- **No third parties:** We don't share data with any third parties
- **No cloud storage:** All data remains on your device

## Data Storage

### Storage Location

All data is stored locally in your browser using:

- **IndexedDB:** For video metadata and sync data
- **Chrome Storage API:** For extension settings and preferences

### Data Retention

- **Local only:** Data persists until you clear your browser data or uninstall the extension
- **No expiration:** Data remains available as long as the extension is installed
- **User control:** You can clear all data using the "Clear All Videos" button in the extension

## Permissions

### Required Permissions

**Host Permissions:**

- `https://www.youtube.com/*` - To create and show buttons that help you import videos into Play
- `https://youtube.com/*` - Alternative YouTube domain

**Extension Permissions:**

- `storage` - To save extension settings and preferences
- `clipboardRead` - To read clipboard data from Apple Shortcuts
- `scripting` - To inject scripts for clipboard access

## Third-Party Services

### Apple Shortcuts

- **Integration:** The extension works with your Apple Shortcut to sync Play app data
- **Data flow:** Your shortcut exports data → Clipboard → Extension → Local storage
- **No direct access:** We don't access your Play app or Apple account directly
- **Your control:** You create and control the Apple Shortcut

### YouTube

- **Read-only access:** We only read video information from YouTube pages
- **No authentication:** We don't access your YouTube account
- **No uploads:** We don't upload or modify any YouTube content

## Data Security

### Local Security

- **Browser security:** Data is protected by your browser's security measures
- **No network transmission:** Data never leaves your device
- **No external access:** No servers or external services can access your data

### User Control

- **Clear data:** Use "Clear All Videos" to remove all stored data
- **Uninstall:** Removing the extension deletes all associated data
- **Browser settings:** Clear browser data to remove extension data

## Children's Privacy

This extension does not knowingly collect personal information from children under 13. The extension is designed for general audiences and does not target children.

## Changes to This Policy

We may update this privacy policy from time to time. When we do, we will:

- Update the "Last updated" date
- Notify users through the extension
- Maintain the same commitment to local-only data storage

## Contact Information

If you have questions about this privacy policy or the extension, post a question on the repository's [discussions](https://github.com/danielh-official/SaveToPlay/discussions/new?category=q-a).

## Your Rights

As all data is stored locally on your device, you have complete control over:

- **Access:** All your data is accessible through browser developer tools
- **Deletion:** Clear data anytime using the extension or browser settings
- **Portability:** Export data through browser developer tools if needed
- **Correction:** Modify data directly through browser developer tools

## Open Source

This extension is open source, meaning:

- **Transparency:** All code is publicly available for review
- **Verification:** You can verify our privacy claims by examining the code
- **Community:** Privacy practices can be reviewed and improved by the community
