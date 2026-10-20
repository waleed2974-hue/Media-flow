import { MediaItem } from './media';

export type PlaybackMode = 'video' | 'audio';
export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentMedia: MediaItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0 to 1
  isMuted: boolean;
  playbackMode: PlaybackMode;
  isExpanded: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  isLoading: boolean;
  error: string | null;
  playbackRate: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  items: MediaItem[];
}

export interface HistoryItem {
  id: string;
  media: MediaItem;
  playedAt: string;
  progressPercent: number;
}
