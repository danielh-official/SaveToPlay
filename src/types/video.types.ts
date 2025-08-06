export interface PlayVideo {
  id: string;
  title: string;
  description?: string;
  url: string;
  date_published?: string;
  second_url?: string;
  channel?: {
    id: string;
    name: string;
  };
  duration_seconds?: string;
  source?: string;
  notes?: string;
  tags?: string[];
  artwork_url_high_res?: string;
  is_new?: string;
  star_rating?: string;
  duration?: string;
  artwork_url?: string;
  date_watched?: string;
  date_added?: string;
  start_at_seconds?: string;
  saved_at: string;
  last_synced_at: string;
}

export interface YouTubeVideoInfo {
  id: string;
  title: string;
  description?: string;
  url: string;
  channelName?: string;
  channelUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  publishedAt?: string;
  tags?: string[];
  notes?: string;
  starRating?: number;
  dateWatched?: string;
  dateAdded?: string;
  isNew?: boolean;
  startAtSeconds?: number;
}

export interface SyncResult {
  success: boolean;
  message: string;
  videosAdded?: number;
  videosUpdated?: number;
  error?: string;
  needsManualPaste?: boolean;
}
