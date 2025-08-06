<template>
  <div
    class="min-h-screen bg-gray-50 p-4 dark:bg-gray-800"
    style="width: 450px; min-width: 450px"
  >
    <div
      class="w-full mx-auto bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800"
    >
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
        <div class="flex items-center">
          <div
            class="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3"
          >
            <svg
              class="w-5 h-5 text-blue-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <div>
            <h1 class="text-white font-semibold text-lg">Save to Play</h1>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Sync Status -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-gray-900 font-medium dark:text-white">
              Sync Status
            </h2>
            <span class="text-xs text-gray-500 dark:text-white">{{
              lastSyncTime
            }}</span>
          </div>
          <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-white">Videos</span>
              <span class="font-semibold text-gray-900 dark:text-white">{{
                videoCount
              }}</span>
            </div>
          </div>
        </div>

        <!-- Sync Button -->
        <div class="mb-4">
          <button
            @click="handleSync"
            :disabled="isSyncing"
            class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white dark:text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <svg
              v-if="isSyncing"
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <svg
              v-else
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {{ isSyncing ? 'Syncing...' : 'Sync Videos' }}
          </button>
        </div>

        <!-- Clear Videos Button -->
        <div class="mb-4">
          <button
            @click="handleClearVideos"
            :disabled="videoCount === 0"
            class="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white dark:text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Clear All Videos ({{ videoCount }})
          </button>
        </div>

        <!-- Last Sync Attempt -->
        <div v-if="lastSyncAttempt" class="mb-4">
          <p class="text-xs text-gray-500 dark:text-white">
            Last sync attempt: {{ formatDate(lastSyncAttempt) }}
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="syncError" class="mb-4">
          <p
            class="text-sm text-red-600 bg-red-50 border border-red-200 dark:border-red-800 dark:bg-red-900 dark:text-white rounded-md px-3 py-2"
          >
            {{ syncError }}
          </p>
        </div>

        <!-- Manual Paste Section -->
        <div v-if="showManualPaste" class="mb-4">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4
              class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2"
            >
              Manual Paste Option
            </h4>
            <p class="text-xs text-blue-700 dark:text-blue-300 mb-3">
              If automatic sync failed, paste your JSON data here:
            </p>
            <textarea
              v-model="manualPasteData"
              placeholder="Paste JSON data from your shortcut here..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              rows="4"
            ></textarea>
            <button
              @click="handleManualPaste"
              :disabled="!manualPasteData.trim()"
              class="w-full mt-2 bg-green-600 text-white dark:text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Process Pasted Data
            </button>
          </div>
        </div>

        <!-- Shortcut Name Configuration -->
        <div class="mb-4">
          <label
            for="shortcutName"
            class="block text-sm font-medium text-gray-700 dark:text-white mb-2"
          >
            Shortcut Name
          </label>
          <input
            id="shortcutName"
            v-model="shortcutName"
            type="text"
            placeholder="Get Videos From Play"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p class="text-xs text-gray-500 dark:text-white mt-1">
            The name of your Apple Shortcut that exports videos from Play
          </p>
        </div>

        <!-- Shortcut Setup -->
        <div class="mb-6">
          <div
            class="bg-yellow-50 border border-yellow-200 dark:border-yellow-800 dark:bg-yellow-900 dark:text-white rounded-lg p-4"
          >
            <div class="flex">
              <div class="flex-shrink-0">
                <svg
                  class="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-yellow-800 dark:text-yellow-200">
                  To sync videos from Play, you need to set up an Apple Shortcut
                  to export the videos first.
                </p>
                <div class="mt-2">
                  <a
                    :href="shortcutSetupUrl"
                    target="_blank"
                    class="text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 underline"
                  >
                    Get the shortcut →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Videos -->
        <div v-if="recentVideos.length > 0">
          <h3 class="text-gray-900 dark:text-white font-medium mb-3">
            Recent Videos
          </h3>
          <div class="space-y-2">
            <div
              v-for="video in recentVideos"
              :key="video.id"
              class="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              <div class="flex items-start space-x-3">
                <img
                  v-if="video.artwork_url"
                  :src="video.artwork_url"
                  :alt="video.title"
                  class="w-16 h-12 object-cover rounded"
                />
                <div class="flex-1 min-w-0">
                  <h4
                    class="text-sm font-medium text-gray-900 dark:text-white truncate"
                  >
                    <a :href="video.url" target="_blank">{{ video.title }}</a>
                  </h4>
                  <p
                    v-if="video.channel?.name"
                    class="text-xs text-gray-500 dark:text-gray-400"
                  >
                    <a
                      :href="`https://youtube.com/channel/${video.channel.id}`"
                      target="_blank"
                      >{{ video.channel.name }}</a
                    >
                  </p>
                  <p class="text-xs text-gray-400 dark:text-white">
                    Saved: {{ formatDate(video.saved_at) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Videos State -->
        <div v-else class="text-center py-8">
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No videos yet
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-white">
            Start saving videos to Play to see them here.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-50 px-6 py-3 dark:bg-gray-800">
        <div
          class="flex items-center justify-between text-xs text-gray-500 dark:text-white"
        >
          <span>v{{ version }}</span>
          <a
            target="_blank"
            href="https://github.com/danielh-official/SaveToPlay"
            class="hover:text-gray-700 dark:hover:text-gray-300"
            >Repository</a
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import type { PlayVideo } from '@/types/video.types';
import { dbService } from '@/services/db.service';
import { playService } from '@/services/play.service';

// Reactive data
const isSyncing = ref(false);
const videoCount = ref(0);
const recentVideos = ref<PlayVideo[]>([]);
const lastSyncTime = ref('Never');
const shortcutName = ref('Get Videos From Play');
const lastSyncAttempt = ref<string | null>(null);
const syncError = ref<string | null>(null);
const showManualPaste = ref(false);
const manualPasteData = ref('');

// Load shortcut name from storage
async function loadShortcutName() {
  try {
    if (chrome?.storage?.local) {
      const result = await chrome.storage.local.get(['shortcutName']);
      if (result.shortcutName) {
        shortcutName.value = result.shortcutName;
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading shortcut name:', error);
  }
}

// Save shortcut name to storage
async function saveShortcutName() {
  try {
    if (chrome?.storage?.local) {
      await chrome.storage.local.set({ shortcutName: shortcutName.value });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error saving shortcut name:', error);
  }
}

// Load last sync time from storage
async function loadLastSyncTime() {
  try {
    if (chrome?.storage?.local) {
      const result = await chrome.storage.local.get(['lastSyncTime']);
      if (result.lastSyncTime) {
        // Convert stored timestamp to relative time for display
        lastSyncTime.value = formatRelativeTime(result.lastSyncTime);
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading last sync time:', error);
  }
}

// Save last sync time to storage
async function saveLastSyncTime() {
  try {
    if (chrome?.storage?.local) {
      // Store the actual timestamp, not the formatted string
      await chrome.storage.local.set({
        lastSyncTime: new Date().toISOString(),
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error saving last sync time:', error);
  }
}

// Format timestamp to relative time for display
function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Computed
const shortcutSetupUrl = computed(() => playService.getShortcutSetupUrl());
const version = computed(() => chrome.runtime.getManifest().version);

// Methods
async function handleSync() {
  if (isSyncing.value) return;

  isSyncing.value = true;
  syncError.value = null;
  showManualPaste.value = false;
  lastSyncAttempt.value = new Date().toISOString();

  try {
    const result = await playService.syncVideosFromPlay(shortcutName.value);

    if (result.success) {
      await saveLastSyncTime(); // Save timestamp to storage
      lastSyncTime.value = 'Just now'; // Update display immediately
      syncError.value = null;
      await loadVideoData(); // Refresh the video list
    } else {
      syncError.value = result.error || 'Failed to run shortcut';
      if (result.needsManualPaste) {
        showManualPaste.value = true;
      }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    syncError.value = `Failed to run shortcut: ${errorMessage}`;
    // eslint-disable-next-line no-console
    console.error('Error during sync:', error);
  } finally {
    isSyncing.value = false;
  }
}

async function handleManualPaste() {
  if (!manualPasteData.value.trim()) return;

  isSyncing.value = true;
  syncError.value = null;

  try {
    // Parse the pasted JSON data
    const parsed = JSON.parse(manualPasteData.value);
    const playVideos = Array.isArray(parsed) ? parsed : [parsed];

    // Process the videos using the same logic as background script
    let videosAdded = 0;
    let videosUpdated = 0;

    for (const playVideo of playVideos) {
      try {
        const video = {
          id: playVideo.id,
          title: playVideo.title,
          description: playVideo.description,
          url: playVideo.url,
          date_published: playVideo.date_published,
          second_url: playVideo.second_url,
          channel: playVideo.channel,
          duration_seconds: playVideo.duration_seconds,
          source: playVideo.source,
          notes: playVideo.notes,
          tags: playVideo.tags,
          artwork_url_high_res: playVideo.artwork_url_high_res,
          is_new: playVideo.is_new,
          star_rating: playVideo.star_rating,
          duration: playVideo.duration,
          artwork_url: playVideo.artwork_url,
          date_watched: playVideo.date_watched,
          date_added: playVideo.date_added,
          start_at_seconds: playVideo.start_at_seconds,
          saved_at: playVideo.date_added,
          last_synced_at: new Date().toISOString(),
        };

        const existingVideo = await dbService.getVideo(playVideo.id);

        if (existingVideo) {
          await dbService.updateVideo(video);
          videosUpdated++;
        } else {
          await dbService.addVideo(video);
          videosAdded++;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Error processing video ${playVideo.id}:`, error);
      }
    }

    await saveLastSyncTime(); // Save timestamp to storage
    lastSyncTime.value = 'Just now'; // Update display immediately
    syncError.value = null;
    showManualPaste.value = false;
    manualPasteData.value = '';
    await loadVideoData(); // Refresh the video list

    // Show success message
    syncError.value = `Successfully processed ${videosAdded} new videos and updated ${videosUpdated} existing videos.`;
  } catch (error) {
    syncError.value =
      'Invalid JSON data. Please check the format and try again.';
    // eslint-disable-next-line no-console
    console.error('Error processing manual paste:', error);
  } finally {
    isSyncing.value = false;
  }
}

async function loadVideoData() {
  try {
    const videos = await dbService.getAllVideos();
    videoCount.value = videos.length;
    recentVideos.value = videos
      .filter((video) => video.is_new === 'Yes')
      .sort(
        (a, b) =>
          new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime()
      )
      .slice(0, 5);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading video data:', error);
  }
}

async function handleClearVideos() {
  // Show confirmation dialog
  const confirmed = confirm(
    `Are you sure you want to delete all ${videoCount.value} videos from the database? This action cannot be undone.`
  );

  if (!confirmed) {
    return;
  }

  try {
    // Get all videos and delete them one by one
    const videos = await dbService.getAllVideos();
    let deletedCount = 0;

    for (const video of videos) {
      try {
        await dbService.deleteVideo(video.id);
        deletedCount++;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Error deleting video ${video.id}:`, error);
      }
    }

    // Reload video data to update the UI
    await loadVideoData();

    // Show success message
    alert(`Successfully deleted ${deletedCount} videos from the database.`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error clearing videos:', error);
    alert('Error clearing videos. Please try again.');
  }
}

function formatDate(dateString: string): string {
  // Handle Play app date format: "Jul 17, 2025 at 3:57 PM"
  let date: Date;

  if (dateString.includes(' at ')) {
    // Parse Play app format: "Jul 17, 2025 at 3:57 PM"
    const parts = dateString.split(' at ');
    const datePart = parts[0]; // "Jul 17, 2025"
    const timePart = parts[1]; // "3:57 PM"

    // Create a proper date string
    const formattedDateString = `${datePart} ${timePart}`;
    date = new Date(formattedDateString);
  } else {
    // Try standard date parsing
    date = new Date(dateString);
  }

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Unknown date';
  }

  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Watch for changes to shortcut name and save to storage
watch(shortcutName, () => {
  saveShortcutName();
});

// Lifecycle
onMounted(async () => {
  // Load saved data first
  await loadShortcutName();
  await loadLastSyncTime();

  // Initialize database first
  await dbService.init();
  await loadVideoData();

  // Remove any mock videos from the database
  const videos = await dbService.getAllVideos();
  for (const video of videos) {
    if (video.id === 'mock-1') {
      await dbService.deleteVideo(video.id);
    }
  }
  await loadVideoData(); // Reload after cleanup
});
</script>

<style scoped>
/* Additional styles can be added here if needed */
</style>

<style>
/* Override Chrome extension popup default sizing */
body {
  width: 450px !important;
  min-width: 450px !important;
  max-width: 450px !important;
}

#app {
  width: 450px !important;
  min-width: 450px !important;
  max-width: 450px !important;
}
</style>
