import React from 'react';
import { Play, Video, Headphones, Plus, Heart, ExternalLink, Download } from 'lucide-react';
import { MediaItem } from '../../types/media';
import { usePlayer } from '../../context/PlayerContext';
import { useMedia } from '../../context/MediaContext';
import { MediaArtwork } from './MediaArtwork';

interface MediaCardProps {
  item: MediaItem;
  onOpenPlaylistModal?: (item: MediaItem) => void;
  onOpenDownloadModal?: (item: MediaItem) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onOpenPlaylistModal,
  onOpenDownloadModal,
}) => {
  const { currentMedia, isPlaying, playMedia } = usePlayer();
  const { isFavorite, toggleFavorite } = useMedia();

  const isCurrent = currentMedia?.id === item.id;
  const isItemPlaying = isCurrent && isPlaying;
  const favorited = isFavorite(item.id);

  const supportsVideo = item.playbackCapabilities.includes('video') || item.provider === 'youtube';
  const supportsAudio = item.playbackCapabilities.includes('audio') || Boolean(item.authorizedAudioUrl) || item.provider === 'youtube';

  return (
    <div className="group relative flex flex-col bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/80 rounded-xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md">
      {/* Artwork container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        <MediaArtwork
          src={item.thumbnail}
          alt={item.title}
          type={item.mediaType}
          provider={item.providerName}
          className="w-full h-full"
        />

        {/* Hover overlay with quick play button */}
        <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <button
            onClick={() => playMedia(item, supportsVideo ? 'video' : 'audio')}
            className="w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-transform duration-150 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            title={`Play ${item.title}`}
            aria-label={`Play ${item.title}`}
          >
            <Play className={`w-5 h-5 ${isItemPlaying ? 'fill-current' : 'ml-0.5 fill-current'}`} />
          </button>
        </div>

        {/* Duration timestamp */}
        {item.durationFormatted && (
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[11px] font-mono tabular-nums text-slate-200 bg-slate-950/80 backdrop-blur-xs">
            {item.durationFormatted}
          </span>
        )}

        {/* Playing wave indicator if current */}
        {isItemPlaying && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-600/90 backdrop-blur-xs text-[11px] font-medium text-white shadow">
            <span className="w-1.5 h-3 bg-white rounded-full animate-pulse" />
            <span className="w-1.5 h-4 bg-white rounded-full animate-pulse delay-75" />
            <span className="w-1.5 h-2 bg-white rounded-full animate-pulse delay-150" />
            <span className="ml-1 text-[10px] uppercase tracking-wider font-bold">Now Playing</span>
          </div>
        )}
      </div>

      {/* Content & Metadata */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Unboxed metadata line with typographic bullet separators */}
          <div className="flex items-center text-xs text-slate-400 font-medium mb-1 truncate">
            <span className="text-indigo-400 truncate max-w-[120px]">{item.creator}</span>
            <span className="mx-1.5 text-slate-600" aria-hidden="true">·</span>
            <span className="text-slate-400 shrink-0">{item.providerName}</span>
            {item.license && (
              <>
                <span className="mx-1.5 text-slate-600" aria-hidden="true">·</span>
                <span className="text-slate-500 truncate text-[11px]">{item.license}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3
            className={`font-semibold text-sm line-clamp-2 leading-snug transition-colors ${
              isCurrent ? 'text-indigo-400' : 'text-slate-100 group-hover:text-white'
            }`}
            title={item.title}
          >
            {item.title}
          </h3>
        </div>

        {/* Playback Mode & Action Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1 text-xs text-slate-400">
          {/* Mode triggers */}
          <div className="flex items-center gap-1.5">
            {supportsVideo && (
              <button
                onClick={() => playMedia(item, 'video')}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/90 hover:bg-indigo-950 hover:text-indigo-300 hover:border-indigo-800 border border-slate-700/60 text-slate-300 transition-colors"
                title="Watch in Video Mode"
              >
                <Video className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Video</span>
              </button>
            )}

            {supportsAudio && (
              <button
                onClick={() => playMedia(item, 'audio')}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/90 hover:bg-indigo-950 hover:text-indigo-300 hover:border-indigo-800 border border-slate-700/60 text-slate-300 transition-colors"
                title="Listen in Audio Mode"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Audio</span>
              </button>
            )}
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleFavorite(item)}
              className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
                favorited ? 'text-rose-500' : 'text-slate-400 hover:text-slate-200'
              }`}
              title={favorited ? 'Remove from Favorites' : 'Add to Favorites'}
              aria-label={favorited ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
            </button>

            {onOpenPlaylistModal && (
              <button
                onClick={() => onOpenPlaylistModal(item)}
                className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Add to Playlist"
                aria-label="Add to Playlist"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}

            {onOpenDownloadModal && (
              <button
                onClick={() => onOpenDownloadModal(item)}
                className="p-1.5 rounded text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                title="Download or Save Media"
                aria-label="Download or Save Media"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            <a
              href={item.canonicalUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title={`Open original source on ${item.providerName}`}
              aria-label={`Open original source on ${item.providerName}`}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
