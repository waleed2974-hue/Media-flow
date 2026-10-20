import React, { useState } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  Info,
  Video,
  Headphones,
  ExternalLink,
  Plus,
  Download,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useMedia } from '../../context/MediaContext';
import { formatDuration } from '../../utils/formatDuration';
import { MediaArtwork } from '../Media/MediaArtwork';

interface ExpandedPlayerProps {
  onOpenPlaylistModal?: () => void;
  onOpenDownloadModal?: () => void;
}

export const ExpandedPlayer: React.FC<ExpandedPlayerProps> = ({
  onOpenPlaylistModal,
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
    isExpanded,
    repeatMode,
    isShuffled,
    playbackRate,
    queue,
    queueIndex,
    setExpanded,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleMute,
    setPlaybackMode,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleRepeat,
    setPlaybackRate,
    playMedia,
  } = usePlayer();

  const { isFavorite, toggleFavorite } = useMedia();
  const [activeTab, setActiveTab] = useState<'player' | 'queue' | 'info'>('player');

  if (!isExpanded || !currentMedia) {
    return null;
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const favorited = isFavorite(currentMedia.id);
  const isYouTube = currentMedia.provider === 'youtube';

  const supportsVideo = currentMedia.playbackCapabilities.includes('video') || isYouTube;
  const supportsAudio = currentMedia.playbackCapabilities.includes('audio') || Boolean(currentMedia.authorizedAudioUrl) || isYouTube;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-xl flex flex-col text-slate-100 overflow-y-auto">
      {/* Top Bar */}
      <div className="max-w-6xl w-full mx-auto px-6 py-4 flex items-center justify-between border-b border-slate-800/80">
        <button
          onClick={() => setExpanded(false)}
          className="flex items-center gap-2 text-slate-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-slate-900 transition-colors"
          aria-label="Collapse player"
        >
          <ChevronDown className="w-5 h-5" />
          <span className="text-sm font-medium">Minimize</span>
        </button>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('player')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'player' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Now Playing
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'queue' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Queue ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'info' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Source & Info
          </button>
        </div>

        {/* Playback Mode Toggles */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {supportsVideo && (
            <button
              onClick={() => setPlaybackMode('video')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                playbackMode === 'video'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video</span>
            </button>
          )}
          {supportsAudio && (
            <button
              onClick={() => setPlaybackMode('audio')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                playbackMode === 'audio'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Audio</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Expanded View */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-center">
        {activeTab === 'player' && (
          <div className="flex flex-col items-center max-w-2xl mx-auto w-full">
            {/* Visual Screen / Artwork */}
            {playbackMode === 'video' && isYouTube ? (
              <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800 mb-6">
                {/* Notice: YouTubeHost is rendering the actual #mediaflow-yt-player iframe */}
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                  {/* Container handled by YouTubeHost */}
                </div>
              </div>
            ) : (
              <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 mb-6 group">
                <MediaArtwork
                  src={currentMedia.thumbnail}
                  alt={currentMedia.title}
                  type={currentMedia.mediaType}
                  provider={currentMedia.providerName}
                  className="w-full h-full"
                />
                {/* Audio visualizer glow */}
                {isPlaying && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center p-4">
                    <div className="flex items-end gap-1.5 h-12">
                      <div className="w-2 bg-indigo-500 rounded-full animate-bounce h-8" />
                      <div className="w-2 bg-indigo-400 rounded-full animate-bounce delay-100 h-12" />
                      <div className="w-2 bg-indigo-300 rounded-full animate-bounce delay-200 h-6" />
                      <div className="w-2 bg-indigo-400 rounded-full animate-bounce delay-75 h-10" />
                      <div className="w-2 bg-indigo-500 rounded-full animate-bounce delay-150 h-5" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Honest YouTube explanation when in Audio Mode */}
            {isYouTube && playbackMode === 'audio' && (
              <div className="w-full mb-4 p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">Audio Mode for YouTube</span>
                  <p className="mt-0.5 leading-relaxed">
                    Official YouTube terms require embedded player playback. MediaFlow optimizes the interface for audio listening while keeping the authorized player active in the background.
                  </p>
                </div>
              </div>
            )}

            {/* Title & Creator */}
            <div className="w-full flex items-center justify-between gap-4 mb-4">
              <div className="min-w-0">
                <h2 className="text-xl md:text-2xl font-bold truncate text-white" title={currentMedia.title}>
                  {currentMedia.title}
                </h2>
                <div className="flex items-center text-sm text-slate-400 font-medium mt-1 truncate">
                  <span className="text-indigo-400 truncate">{currentMedia.creator}</span>
                  <span className="mx-2 text-slate-600">·</span>
                  <span className="shrink-0">{currentMedia.providerName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleFavorite(currentMedia)}
                  className={`p-2.5 rounded-full hover:bg-slate-900 transition-colors ${
                    favorited ? 'text-rose-500' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-6 h-6 ${favorited ? 'fill-current' : ''}`} />
                </button>
                {onOpenPlaylistModal && (
                  <button
                    onClick={onOpenPlaylistModal}
                    className="p-2.5 rounded-full hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Add to playlist"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                )}
                {onOpenDownloadModal && (
                  <button
                    onClick={onOpenDownloadModal}
                    className="p-2.5 rounded-full hover:bg-slate-900 text-slate-400 hover:text-indigo-300 transition-colors"
                    title="Download Media File"
                  >
                    <Download className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrub Bar */}
            <div className="w-full mb-6">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.5}
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs font-mono tabular-nums text-slate-400 mt-1">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-6 mb-8">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-full hover:bg-slate-900 transition-colors ${
                  isShuffled ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                onClick={prevTrack}
                className="p-3 rounded-full hover:bg-slate-900 text-slate-200 hover:text-white transition-colors"
                title="Previous track"
              >
                <SkipBack className="w-7 h-7 fill-current" />
              </button>

              <button
                onClick={togglePlayPause}
                className="w-16 h-16 rounded-full bg-white text-slate-950 hover:bg-slate-200 flex items-center justify-center shadow-xl transition-transform active:scale-95"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 ml-1 fill-current" />
                )}
              </button>

              <button
                onClick={nextTrack}
                className="p-3 rounded-full hover:bg-slate-900 text-slate-200 hover:text-white transition-colors"
                title="Next track"
              >
                <SkipForward className="w-7 h-7 fill-current" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-full hover:bg-slate-900 transition-colors ${
                  repeatMode !== 'off' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
              </button>
            </div>

            {/* Secondary Controls: Volume & Speed */}
            <div className="w-full flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24 h-1 bg-slate-800 accent-indigo-500 rounded cursor-pointer"
                />
              </div>

              {/* Playback speed selector */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-500 mr-1">Speed:</span>
                {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono tabular-nums transition-colors ${
                      playbackRate === rate
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Queue Tab */}
        {activeTab === 'queue' && (
          <div className="max-w-2xl mx-auto w-full">
            <h3 className="text-lg font-semibold mb-4 text-white">Upcoming Queue</h3>
            {queue.length === 0 ? (
              <p className="text-slate-400 text-sm">Queue is empty.</p>
            ) : (
              <div className="space-y-2">
                {queue.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      idx === queueIndex
                        ? 'bg-indigo-950/40 border-indigo-700/80 text-white'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div
                      onClick={() => playMedia(item, playbackMode)}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <span className="w-5 text-xs font-mono text-slate-500">{idx + 1}</span>
                      <div className="w-10 h-10 rounded-md overflow-hidden shrink-0">
                        <MediaArtwork
                          src={item.thumbnail}
                          alt={item.title}
                          type={item.mediaType}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-slate-400 truncate">{item.creator} · {item.providerName}</p>
                      </div>
                    </div>

                    <div className="text-xs font-mono tabular-nums text-slate-400 ml-3">
                      {item.durationFormatted || '--:--'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Source & Info Tab */}
        {activeTab === 'info' && (
          <div className="max-w-2xl mx-auto w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Metadata & Licensing</h3>
            <div className="space-y-4 text-sm text-slate-300">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-1">
                  Title & Creator
                </span>
                <p className="font-semibold text-white">{currentMedia.title}</p>
                <p className="text-indigo-400">{currentMedia.creator}</p>
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-1">
                  Provider & Attribution
                </span>
                <p>{currentMedia.attribution || currentMedia.providerName}</p>
                {currentMedia.license && (
                  <p className="text-xs text-slate-400 mt-0.5">License: {currentMedia.license}</p>
                )}
              </div>

              {currentMedia.description && (
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-bold block mb-1">
                    Description
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line line-clamp-6">
                    {currentMedia.description}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <a
                  href={currentMedia.canonicalUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300"
                >
                  <span>Open original source on {currentMedia.providerName}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {currentMedia.authorizedAudioUrl && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    Direct HTML5 Audio stream verified
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
