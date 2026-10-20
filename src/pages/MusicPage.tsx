import React, { useState, useEffect } from 'react';
import { Music2, Disc, Play, Sparkles } from 'lucide-react';
import { MediaItem } from '../types/media';
import { searchMedia, fetchCurated } from '../services/apiClient';
import { MediaCard } from '../components/Media/MediaCard';
import { LoadingState } from '../components/Common/LoadingState';

interface MusicPageProps {
  onOpenPlaylistModal: (item: MediaItem) => void;
  onOpenDownloadModal?: (item: MediaItem) => void;
}

export const MusicPage: React.FC<MusicPageProps> = ({
  onOpenPlaylistModal,
  onOpenDownloadModal,
}) => {
  const genres = [
    { id: 'top', label: 'Top Hits', query: 'popular hits music 2026' },
    { id: 'classical', label: 'Classical & Symphony', query: 'beethoven mozart classical piano' },
    { id: 'lofi', label: 'Lo-Fi Chill', query: 'lofi chill study beats' },
    { id: 'acoustic', label: 'Acoustic & Guitar', query: 'acoustic guitar instrumental songs' },
    { id: 'jazz', label: 'Jazz & Blues', query: 'jazz cafe lounge ambient' },
    { id: 'qawwali', label: 'Qawwali & Sufi', query: 'qawwali sufi music atif aslam nusrat' },
    { id: 'electronic', label: 'Synthwave & Electronic', query: 'synthwave electronic ambient' },
  ];

  const [activeGenre, setActiveGenre] = useState(genres[0]);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadMusic = async () => {
      setIsLoading(true);
      try {
        const res = await searchMedia(activeGenre.query, 'music');
        if (active) setItems(res.items);
      } catch (e) {
        console.error('Music page fetch error', e);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadMusic();
    return () => {
      active = false;
    };
  }, [activeGenre]);

  return (
    <div className="space-y-6 pb-28">
      {/* Music Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Music2 className="w-4 h-4" />
          <span>Curated Catalog</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Music & Audio Tracks
        </h1>
        <p className="text-sm text-slate-400">
          Listen to songs, instrumental pieces, live concerts, and classical compositions.
        </p>
      </div>

      {/* Genre Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {genres.map((g) => {
          const isActive = activeGenre.id === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setActiveGenre(g)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      {/* Media Results Grid */}
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
