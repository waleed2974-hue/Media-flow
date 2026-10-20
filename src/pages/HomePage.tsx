import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Radio, Music, History, ArrowRight, Disc3 } from 'lucide-react';
import { MediaItem } from '../types/media';
import { fetchCurated } from '../services/apiClient';
import { usePlayer } from '../context/PlayerContext';
import { useMedia } from '../context/MediaContext';
import { SearchBar } from '../components/Search/SearchBar';
import { MediaCard } from '../components/Media/MediaCard';
import { LoadingState } from '../components/Common/LoadingState';

interface HomePageProps {
  onSearch: (query: string) => void;
  onOpenPlaylistModal: (item: MediaItem) => void;
  onOpenDownloadModal?: (item: MediaItem) => void;
  onNavigate: (page: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSearch,
  onOpenPlaylistModal,
  onOpenDownloadModal,
  onNavigate,
}) => {
  const { playMedia } = usePlayer();
  const { playlists } = useMedia();
  const { history } = usePlayer();

  const [curatedMusic, setCuratedMusic] = useState<MediaItem[]>([]);
  const [curatedPodcasts, setCuratedPodcasts] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadCurated = async () => {
      setIsLoading(true);
      try {
        const [music, podcasts] = await Promise.all([
          fetchCurated('music'),
          fetchCurated('podcasts'),
        ]);
        if (active) {
          setCuratedMusic(music);
          setCuratedPodcasts(podcasts);
        }
      } catch (e) {
        console.error('Failed to load curated home content', e);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadCurated();
    return () => {
      active = false;
    };
  }, []);

  const searchSuggestions = [
    'Atif Aslam Tajdar-e-Haram',
    'Arijit Singh romantic songs',
    'Pashto new songs',
    'Punjabi music',
    'relaxing instrumental music',
    'motivational speeches',
    'technology tutorials',
    'podcast episodes',
  ];

  return (
    <div className="space-y-10 pb-28">
      {/* Hero Search Section */}
      <section className="relative rounded-3xl bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-slate-950 border border-indigo-900/30 p-6 md:p-12 overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Universal Video & Music Discovery</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Discover, stream, and play online media in one place.
          </h1>

          <p className="text-sm md:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Search YouTube videos, authorized public-domain audio, classical symphonies, and podcasts.
            Seamlessly toggle between Video and Audio playback modes.
          </p>

          {/* Search Bar Input */}
          <div className="pt-2">
            <SearchBar onSearch={onSearch} autoFocus={false} />
          </div>

          {/* Quick Search Chips */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Popular:</span>
            {searchSuggestions.slice(0, 5).map((s, idx) => (
              <button
                key={idx}
                onClick={() => onSearch(s)}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-indigo-900/40 text-slate-300 hover:text-indigo-200 border border-slate-800 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Played / History Section (if user has played anything) */}
      {history.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg md:text-xl font-bold text-white">Recently Played</h2>
            </div>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {history.slice(0, 4).map((hist) => (
              <MediaCard
                key={hist.id}
                item={hist.media}
                onOpenPlaylistModal={onOpenPlaylistModal}
                onOpenDownloadModal={onOpenDownloadModal}
              />
            ))}
          </div>
        </section>
      )}

      {/* Saved Playlists Quick Strip */}
      {playlists.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Disc3 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg md:text-xl font-bold text-white">Your Playlists</h2>
            </div>
            <button
              onClick={() => onNavigate('playlists')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>Manage playlists</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {playlists.slice(0, 3).map((pl) => (
              <div
                key={pl.id}
                onClick={() => onNavigate('playlists')}
                className="group p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-xl cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="font-semibold text-sm text-slate-100 group-hover:text-indigo-400 transition-colors">
                    {pl.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{pl.items.length} tracks</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-indigo-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-colors">
                  <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending & Curated Music */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg md:text-xl font-bold text-white">Trending Music & Masterpieces</h2>
          </div>
          <button
            onClick={() => onNavigate('music')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <span>Explore music</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <LoadingState count={8} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {curatedMusic.slice(0, 8).map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onOpenPlaylistModal={onOpenPlaylistModal}
                onOpenDownloadModal={onOpenDownloadModal}
              />
            ))}
          </div>
        )}
      </section>

      {/* Curated Podcasts & Talks */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg md:text-xl font-bold text-white">Podcasts & Spoken Audio</h2>
          </div>
          <button
            onClick={() => onNavigate('podcasts')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <span>View podcasts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <LoadingState count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {curatedPodcasts.slice(0, 4).map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onOpenPlaylistModal={onOpenPlaylistModal}
                onOpenDownloadModal={onOpenDownloadModal}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
