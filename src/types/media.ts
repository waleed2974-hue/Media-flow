export type MediaType = 'all' | 'music' | 'video' | 'podcast' | 'audio';
export type MediaProvider = 'youtube' | 'archive' | 'wikimedia' | 'direct';
export type PlaybackCapability = 'video' | 'audio' | 'both';

export interface MediaItem {
  id: string; // Unique global ID e.g. "yt:dQw4w9WgXcQ" or "ia:audio_track_123"
  rawId: string; // Provider-specific ID
  provider: MediaProvider;
  providerName: string;
  title: string;
  creator: string;
  thumbnail: string;
  duration?: number; // Duration in seconds
  durationFormatted?: string; // e.g. "03:45"
  mediaType: 'music' | 'video' | 'podcast' | 'audio';
  playbackCapabilities: PlaybackCapability[];
  canonicalUrl: string;
  embedUrl?: string; // For YouTube Iframe Embed
  authorizedAudioUrl?: string; // For direct HTML5 audio playback
  authorizedVideoUrl?: string; // For direct HTML5 video playback
  directDownloadUrl?: string; // Original direct URL for downloading or fallback playback
  attribution?: string;
  license?: string;
  description?: string;
  publishedAt?: string;
  isAvailable: boolean;
  availabilityNotice?: string;
  audioModeNotice?: string; // Explicit explanation when YouTube cannot stream raw audio-only
}

export interface SearchResponse {
  items: MediaItem[];
  nextPageToken?: string;
  totalResults?: number;
  query: string;
  type: MediaType;
  source: string;
  youtubeConfigured: boolean;
  errorNotice?: string;
}

export interface SearchSuggestion {
  query: string;
  category?: string;
}
