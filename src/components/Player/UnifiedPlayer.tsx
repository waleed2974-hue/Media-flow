import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Maximize2,
  ListMusic,
  Shuffle,
  Repeat,
  Repeat1,
  Video,
  Headphones,
  AlertCircle,
  Loader2,
  Download,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { formatDuration } from '../../utils/formatDuration';
import { MediaArtwork } from '../Media/MediaArtwork';

interface UnifiedPlayerProps {
  onToggleQueue: () => void;
  isQueueOpen: boolean;
  onOpenDownloadModal?: () => void;
}

export const UnifiedPlayer: React.FC<UnifiedPlayerProps> = ({
  onToggleQueue,
  isQueueOpen,
  onOpenDownloadModal,
}) => {
  const {
    currentMedia,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackMode,
    repeatMode,
    isShuffled,
    isLoading,
    error,
    queue,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleMute,
    setPlaybackMode,
    setExpanded,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  if (!currentMedia) {
    return null;
  }

  const effectiveCurrentTime = isSeeking ? seekValue : currentTime;
  const progressPercent = duration > 0 ? (effectiveCurrentTime / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeekValue(parseFloat(e.target.value));
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
    setSeekValue(currentTime);
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
    seekTo(seekValue);
  };

  const supportsVideo = currentMedia.playbackCapabilities.includes('video') || currentMedia.provider === 'youtube';
  const supportsAudio = currentMedia.playbackCapabilities.includes('audio') || Boolean(currentMedia.authorizedAudioUrl) || currentMedia.provider === 'youtube';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 text-slate-100 shadow-2xl transition-all">
      {/* Progress Bar (at the very top of bottom bar for scrub precision) */}
      <div className="relative group w-full h-1.5 bg-slate-800/80 cursor-pointer">
        <div
          className="h-full bg-indigo-500 group-hover:bg-indigo-400 transition-all rounded-r"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.5}
          value={effectiveCurrentTime}
          onChange={handleSeekChange}
          onMouseDown={handleSeekStart}
          onTouchStart={handleSeekStart}
          onMouseUp={handleSeekEnd}
          onTouchEnd={handleSeekEnd}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Seek track position"
        />
      </div>

      {/* Main player layout */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Track Information */}
        <div className="flex items-center gap-3 min-w-0 w-1/4">
          <div
            onClick={() => setExpanded(true)}
            className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 cursor-pointer group/art"
          >
            <MediaArtwork
              src={currentMedia.thumbnail}
              alt={currentMedia.title}
              type={currentMedia.mediaType}
              provider={currentMedia.providerName}
              className="w-full h-full"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/art:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="min-w-0">
            <h4
              onClick={() => setExpanded(true)}
              className="text-sm font-semibold truncate hover:text-indigo-400 cursor-pointer transition-colors"
              title={currentMedia.title}
            >
              {currentMedia.title}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
              <span className="truncate">{currentMedia.creator}</span>
              <span className="text-slate-600">·</span>
              <span className="shrink-0 text-slate-400">{currentMedia.providerName}</span>
            </div>
          </div>
        </div>

        {/* Center: Controls & Timestamps */}
        <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-full hover:bg-slate-800 transition-colors ${
                isShuffled ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title={isShuffled ? 'Shuffle is on' : 'Shuffle is off'}
              aria-label="Toggle shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={prevTrack}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Previous Track"
              aria-label="Previous track"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={togglePlayPause}
              disabled={isLoading}
              className="w-10 h-10 rounded-full bg-white text-slate-950 hover:bg-slate-100 flex items-center justify-center shadow-md transition-transform active:scale-95 disabled:opacity-50"
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 ml-0.5 fill-current" />
              )}
            </button>

            <button
              onClick={nextTrack}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Next Track"
              aria-label="Next track"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-1.5 rounded-full hover:bg-slate-800 transition-colors ${
                repeatMode !== 'off' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title={`Repeat: ${repeatMode}`}
              aria-label={`Repeat mode: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          {/* Time indicators */}
          <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-400">
            <span>{formatDuration(effectiveCurrentTime)}</span>
            <span>/</span>
            <span>{formatDuration(duration)}</span>
            {error && (
              <span className="flex items-center gap-1 text-amber-400 text-[11px] font-sans ml-2 truncate max-w-xs" title={error}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{error}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Mode Selector, Volume & Expander */}
        <div className="flex items-center justify-end gap-3 w-1/4">
          {/* Mode switch */}
          <div className="hidden sm:flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            {supportsVideo && (
              <button
                onClick={() => setPlaybackMode('video')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  playbackMode === 'video'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to Video Mode"
              >
                <Video className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Video</span>
              </button>
            )}

            {supportsAudio && (
              <button
                onClick={() => setPlaybackMode('audio')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  playbackMode === 'audio'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to Audio Mode"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Audio</span>
              </button>
            )}
          </div>

          {/* Queue toggle */}
          <button
            onClick={onToggleQueue}
            className={`relative p-2 rounded-lg hover:bg-slate-800 transition-colors ${
              isQueueOpen ? 'text-indigo-400 bg-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Open Queue"
            aria-label="Open queue"
          >
            <ListMusic className="w-4 h-4" />
            {queue.length > 0 && (
              <span className="absolute -top-1 -right-1 px-1 min-w-[16px] h-4 rounded-full bg-indigo-600 text-[10px] font-mono tabular-nums text-white flex items-center justify-center">
                {queue.length}
              </span>
            )}
          </button>

          {/* Download button */}
          {onOpenDownloadModal && (
            <button
              onClick={onOpenDownloadModal}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-indigo-300 transition-colors"
              title="Download Media File"
              aria-label="Download media file"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Volume slider */}
          <div className="hidden md:flex items-center gap-1.5 group/vol">
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-18 h-1 bg-slate-800 accent-indigo-500 rounded-lg cursor-pointer"
              aria-label="Volume control"
            />
          </div>

          {/* Expand Full Player */}
          <button
            onClick={() => setExpanded(true)}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Expand Full Player"
            aria-label="Expand full player"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
