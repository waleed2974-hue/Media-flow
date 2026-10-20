import React from 'react';
import { X, Trash2, Play, Music, GripVertical, Download } from 'lucide-react';
import { MediaItem } from '../../types/media';
import { usePlayer } from '../../context/PlayerContext';
import { MediaArtwork } from '../Media/MediaArtwork';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDownloadModal?: (item: MediaItem) => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({ isOpen, onClose, onOpenDownloadModal }) => {
  const { queue, queueIndex, playMedia, removeFromQueue, clearQueue, playbackMode } = usePlayer();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-950/98 backdrop-blur-md border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-base">Playback Queue</h3>
          <span className="text-xs text-slate-400 font-mono tabular-nums">({queue.length})</span>
        </div>

        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
              title="Clear Queue"
              aria-label="Clear Queue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Close Drawer"
            aria-label="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-center px-4">
            <Music className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm font-medium">Your queue is currently empty</p>
            <p className="text-xs mt-1">Search or browse tracks and click "Add to Queue"</p>
          </div>
        ) : (
          queue.map((item, idx) => {
            const isCurrent = idx === queueIndex;
            return (
              <div
                key={`${item.id}-${idx}`}
                className={`group flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-colors ${
                  isCurrent
                    ? 'bg-indigo-950/40 border-indigo-600/70'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
                }`}
              >
                <div
                  onClick={() => playMedia(item, playbackMode)}
                  className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                >
                  <span className="w-4 text-[11px] font-mono tabular-nums text-slate-500 text-center">
                    {idx + 1}
                  </span>
                  <div className="w-10 h-10 rounded-md overflow-hidden shrink-0">
                    <MediaArtwork
                      src={item.thumbnail}
                      alt={item.title}
                      type={item.mediaType}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isCurrent ? 'text-indigo-400' : 'text-slate-200'
                      }`}
                      title={item.title}
                    >
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {item.creator} · {item.providerName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[11px] font-mono tabular-nums text-slate-400">
                    {item.durationFormatted || '--:--'}
                  </span>
                  {onOpenDownloadModal && (
                    <button
                      onClick={() => onOpenDownloadModal(item)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 transition-opacity"
                      title="Download or Save Media"
                      aria-label="Download or Save Media"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => removeFromQueue(idx)}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-opacity"
                    title="Remove from Queue"
                    aria-label="Remove from Queue"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
