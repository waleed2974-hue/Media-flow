import { MediaItem } from '../types/media';
import { HistoryItem, Playlist } from '../types/player';

const STORAGE_KEYS = {
  FAVORITES: 'mediaflow_favorites_v1',
  PLAYLISTS: 'mediaflow_playlists_v1',
  HISTORY: 'mediaflow_history_v1',
  SEARCH_HISTORY: 'mediaflow_search_history_v1',
  SETTINGS: 'mediaflow_settings_v1',
};

export interface AppSettings {
  theme: 'dark' | 'light';
  autoplayNext: boolean;
  defaultPlaybackMode: 'audio' | 'video';
  volume: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  autoplayNext: true,
  defaultPlaybackMode: 'video',
  volume: 0.8,
};

export const storage = {
  // Favorites
  getFavorites(): MediaItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveFavorites(favorites: MediaItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  },

  // Playlists
  getPlaylists(): Playlist[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      if (data) {
        return JSON.parse(data);
      }
      // Initialize with a default demo playlist
      const defaultPlaylists: Playlist[] = [
        {
          id: 'pl-favorites',
          name: 'My Highlights',
          description: 'A personal collection of favorite music & video finds',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: [],
        },
      ];
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(defaultPlaylists));
      return defaultPlaylists;
    } catch {
      return [];
    }
  },

  savePlaylists(playlists: Playlist[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    } catch (e) {
      console.error('Failed to save playlists to localStorage', e);
    }
  },

  // Playback History
  getHistory(): HistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addHistory(media: MediaItem, progressPercent: number = 0): HistoryItem[] {
    try {
      const existing = this.getHistory();
      // Remove existing occurrence of this media
      const filtered = existing.filter((item) => item.media.id !== media.id);
      const newEntry: HistoryItem = {
        id: `hist-${Date.now()}-${media.id}`,
        media,
        playedAt: new Date().toISOString(),
        progressPercent,
      };
      // Keep max 50 recent items
      const updated = [newEntry, ...filtered].slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch (e) {
      console.error('Failed to clear history', e);
    }
  },

  // Search History
  getSearchHistory(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      return data ? JSON.parse(data) : ['Atif Aslam', 'Arijit Singh', 'Relaxing instrumental', 'Tech tutorials', 'Jazz lo-fi'];
    } catch {
      return [];
    }
  },

  addSearchQuery(query: string): string[] {
    const trimmed = query.trim();
    if (!trimmed) return this.getSearchHistory();
    try {
      const history = this.getSearchHistory().filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...history].slice(0, 10);
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  },

  clearSearchHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
    } catch (e) {
      console.error('Failed to clear search history', e);
    }
  },

  // Settings
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.FAVORITES);
      localStorage.removeItem(STORAGE_KEYS.PLAYLISTS);
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    } catch (e) {
      console.error('Failed to clear all data', e);
    }
  },
};
