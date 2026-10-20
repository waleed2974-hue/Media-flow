import React from 'react';
import { History, Play, Trash2, Clock } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { MediaCard } from '../components/Media/MediaCard';
import { MediaItem } from '../types/media';

interface HistoryPageProps {
  onOpenPlaylistModal: (item: MediaItem) => void;
  onOpenDownloadModal?: (item: MediaItem) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onOpenPlaylistModal,
  onOpenDownloadModal,
}) => {
  const { history, clearHistory, playMedia } = usePlayer();

  const formatDate = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Activity Log</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Playback History
          </h1>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-900 text-slate-300 hover:text-rose-300 rounded-xl text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl max-w-md mx-auto">
          <History className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-30" />
          <h3 className="font-semibold text-slate-200">No playback history</h3>
          <p className="text-xs text-slate-400 mt-1">
            When you play songs, videos, or podcasts, they will appear here so you can easily resume.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {history.map((hist) => (
            <div key={hist.id} className="relative flex flex-col">
              <MediaCard
                item={hist.media}
                onOpenPlaylistModal={onOpenPlaylistModal}
                onOpenDownloadModal={onOpenDownloadModal}
              />
              <div className="mt-1.5 px-1 flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{formatDate(hist.playedAt)}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
