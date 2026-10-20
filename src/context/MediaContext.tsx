import React, { createContext, useContext, useState, useEffect } from 'react';
import { MediaItem } from '../types/media';
import { Playlist } from '../types/player';
import { storage, AppSettings } from '../utils/storage';

interface MediaContextType {
  favorites: MediaItem[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: MediaItem) => void;
  playlists: Playlist[];
  createPlaylist: (name: string, description?: string) => Playlist;
  deletePlaylist: (id: string) => void;
  renamePlaylist: (id: string, newName: string) => void;
  addToPlaylist: (playlistId: string, item: MediaItem) => boolean;
  removeFromPlaylist: (playlistId: string, itemId: string) => void;
  searchHistory: string[];
  addSearchQuery: (query: string) => void;
  clearSearchHistory: () => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  clearAllUserData: () => void;
}

const MediaContext = createContext<MediaContextType | null>(null);

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<MediaItem[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings());

  // Load initial data on mount
  useEffect(() => {
    setFavorites(storage.getFavorites());
    setPlaylists(storage.getPlaylists());
    setSearchHistory(storage.getSearchHistory());
  }, []);

  // Update theme on document root when settings change
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const isFavorite = (id: string) => {
    return favorites.some((fav) => fav.id === id);
  };

  const toggleFavorite = (item: MediaItem) => {
    setFavorites((prev) => {
      let updated: MediaItem[];
      if (prev.some((fav) => fav.id === item.id)) {
        updated = prev.filter((fav) => fav.id !== item.id);
      } else {
        updated = [item, ...prev];
      }
      storage.saveFavorites(updated);
      return updated;
    });
  };

  const createPlaylist = (name: string, description?: string): Playlist => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name: name.trim() || 'Untitled Playlist',
      description: description?.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
    };
    const updated = [newPl, ...playlists];
    setPlaylists(updated);
    storage.savePlaylists(updated);
    return newPl;
  };

  const deletePlaylist = (id: string) => {
    const updated = playlists.filter((pl) => pl.id !== id);
    setPlaylists(updated);
    storage.savePlaylists(updated);
  };

  const renamePlaylist = (id: string, newName: string) => {
    const updated = playlists.map((pl) => {
      if (pl.id === id) {
        return { ...pl, name: newName.trim(), updatedAt: new Date().toISOString() };
      }
      return pl;
    });
    setPlaylists(updated);
    storage.savePlaylists(updated);
  };

  const addToPlaylist = (playlistId: string, item: MediaItem): boolean => {
    let added = false;
    const updated = playlists.map((pl) => {
      if (pl.id === playlistId) {
        if (!pl.items.some((i) => i.id === item.id)) {
          added = true;
          return {
            ...pl,
            items: [...pl.items, item],
            updatedAt: new Date().toISOString(),
          };
        }
      }
      return pl;
    });
    if (added) {
      setPlaylists(updated);
      storage.savePlaylists(updated);
    }
    return added;
  };

  const removeFromPlaylist = (playlistId: string, itemId: string) => {
    const updated = playlists.map((pl) => {
      if (pl.id === playlistId) {
        return {
          ...pl,
          items: pl.items.filter((i) => i.id !== itemId),
          updatedAt: new Date().toISOString(),
        };
      }
      return pl;
    });
    setPlaylists(updated);
    storage.savePlaylists(updated);
  };

  const addSearchQuery = (query: string) => {
    const updated = storage.addSearchQuery(query);
    setSearchHistory(updated);
  };

  const clearSearchHistory = () => {
    storage.clearSearchHistory();
    setSearchHistory([]);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      storage.saveSettings(merged);
      return merged;
    });
  };

  const clearAllUserData = () => {
    storage.clearAllData();
    setFavorites([]);
    setPlaylists([]);
    setSearchHistory([]);
    setSettings(storage.getSettings());
  };

  return (
    <MediaContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        playlists,
        createPlaylist,
        deletePlaylist,
        renamePlaylist,
        addToPlaylist,
        removeFromPlaylist,
        searchHistory,
        addSearchQuery,
        clearSearchHistory,
        settings,
        updateSettings,
        clearAllUserData,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
};
