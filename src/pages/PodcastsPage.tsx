import React, { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';
import { MediaItem } from '../types/media';
import { searchMedia } from '../services/apiClient';
import { MediaCard } from '../components/Media/MediaCard';
import { LoadingState } from '../components/Common/LoadingState';

interface PodcastsPageProps {
  onOpenPlaylistModal: (item: MediaItem) => void;
  onOpenDownloadModal?: (item: MediaItem) => void;
}

export const PodcastsPage: React.FC<PodcastsPageProps> = ({
  onOpenPlaylistModal,
  onOpenDownloadModal,
}) => {
  const topics = [
    { id: 'tech', label: 'Technology & AI', query: 'artificial intelligence computer science podcast' },
    { id: 'science', label: 'Cosmos & Astronomy', query: 'astronomy physics science podcast' },
    { id: 'philosophy', label: 'Philosophy & Mind', query: 'philosophy consciousness thought podcast' },
    { id: 'audiobooks', label: 'Classic Audiobooks', query: 'librivox classic literature audiobook story' },
  ];

  const [activeTopic, setActiveTopic] = useState(topics[0]);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadPodcasts = async () => {
      setIsLoading(true);
      try {
        const res = await searchMedia(activeTopic.query, 'podcast');
        if (active) setItems(res.items);
      } catch (e) {
        console.error('Podcasts page error', e);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadPodcasts();
    return () => {
      active = false;
    };
  }, [activeTopic]);

  return (
    <div className="space-y-6 pb-28">
      {/* Podcasts Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Radio className="w-4 h-4" />
          <span>Spoken Word & Audio</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Podcasts & Audiobooks
        </h1>
        <p className="text-sm text-slate-400">
          Listen to intellectual dialogues, deep scientific explainers, and public-domain literature.
        </p>
      </div>

      {/* Topic selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {topics.map((t) => {
          const isActive = activeTopic.id === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTopic(t)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t.label}
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
