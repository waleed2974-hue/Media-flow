import React, { useState, useEffect } from 'react';
import { Tv, Play } from 'lucide-react';
import { MediaItem } from '../types/media';
import { searchMedia } from '../services/apiClient';
import { MediaCard } from '../components/Media/MediaCard';
import { LoadingState } from '../components/Common/LoadingState';

interface VideosPageProps {
  onOpenPlaylistModal: (item: MediaItem) => void;
  onOpenDownloadModal?: (item: MediaItem) => void;
}

export const VideosPage: React.FC<VideosPageProps> = ({
  onOpenPlaylistModal,
  onOpenDownloadModal,
}) => {
  const categories = [
    { id: 'music_videos', label: 'Music Videos', query: 'official music video 4k' },
    { id: 'tutorials', label: 'Tech Tutorials', query: 'modern web development programming tutorial' },
    { id: 'live', label: 'Live Concerts', query: 'live acoustic performance studio session' },
    { id: 'documentaries', label: 'Documentaries & Science', query: 'space exploration cosmos documentary' },
  ];

  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadVideos = async () => {
      setIsLoading(true);
      try {
        const res = await searchMedia(activeCategory.query, 'video');
        if (active) setItems(res.items);
      } catch (e) {
        console.error('Video page error', e);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadVideos();
    return () => {
      active = false;
    };
  }, [activeCategory]);

  return (
    <div className="space-y-6 pb-28">
      {/* Videos Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Tv className="w-4 h-4" />
          <span>Visual Media</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Videos & Screen Content
        </h1>
        <p className="text-sm text-slate-400">
          Watch official music videos, live acoustic sessions, and educational documentaries.
        </p>
      </div>

      {/* Category selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((c) => {
          const isActive = activeCategory.id === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <LoadingState count={8} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
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
