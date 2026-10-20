import React, { useState } from 'react';
import { Heart, Play, Trash2 } from 'lucide-react';
import { useMedia } from '../context/MediaContext';
import { usePlayer } from '../context/PlayerContext';
import { MediaCard } from '../components/Media/MediaCard';
import { MediaItem } from '../types/media';

interface FavoritesPageProps {
  onOpenPlaylistModal: (item: MediaItem) => void;
  onOpenDownloadModal?: (item: MediaItem) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  onOpenPlaylistModal,
  onOpenDownloadModal,
}) => {
  const { favorites, toggleFavorite } = useMedia();
  const { playMedia, addToQueue } = usePlayer();
  const [filter, setFilter] = useState<'all' | 'audio' | 'video'>('all');

  const filtered = favorites.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'video') return item.playbackCapabilities.includes('video');
    return item.playbackCapabilities.includes('audio');
  });

  const handlePlayAll = () => {
    if (filtered.length === 0) return;
    playMedia(filtered[0]);
    filtered.slice(1).forEach((item) => addToQueue(item));
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <Heart className="w-4 h-4 fill-current" />
            <span>Saved Tracks</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Favorites ({favorites.length})
          </h1>
        </div>

        {favorites.length > 0 && (
          <div className="flex items-center gap-3">
            {/* Filter buttons */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-medium">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('audio')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filter === 'audio' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Audio
              </button>
              <button
                onClick={() => setFilter('video')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filter === 'video' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Video
              </button>
            </div>

            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs md:text-sm font-semibold transition-colors shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play All</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      {favorites.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl max-w-md mx-auto">
          <Heart className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-30" />
          <h3 className="font-semibold text-slate-200">No favorites saved</h3>
          <p className="text-xs text-slate-400 mt-1">
            Tap the heart icon on any song, video, or podcast to pin it to your favorites.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs">
          No favorites match the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onOpenPlaylistModal={onOpenPlaylistModal}
              onOpenDownloadModal={onOpenDownloadModal}
            />
          ))}
        </div>
      )}
    </div>
  );
};
