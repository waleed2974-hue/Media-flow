import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { Maximize2, Minimize2, Info } from 'lucide-react';

interface YouTubeHostProps {
  isModalOpen?: boolean;
}

export const YouTubeHost: React.FC<YouTubeHostProps> = () => {
  const { currentMedia, playbackMode, setPlaybackMode, isExpanded, setExpanded } = usePlayer();

  const isYouTube = currentMedia?.provider === 'youtube';
  const hasDirectVideo = !isYouTube && playbackMode === 'video' && Boolean(currentMedia?.authorizedVideoUrl);

  // If neither YouTube nor active direct video, keep YT container quietly in DOM
  if (!isYouTube && !hasDirectVideo) {
    return (
      <div className="hidden pointer-events-none" aria-hidden="true">
        <div id="mediaflow-yt-player" />
      </div>
    );
  }

  return (
    <div
      className={`transition-all duration-300 ${
        isExpanded
          ? 'w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-black border border-slate-800'
          : 'fixed bottom-24 right-4 z-40 w-72 rounded-lg overflow-hidden shadow-xl border border-slate-700 bg-slate-900'
      }`}
    >
      {/* Header bar on mini video preview */}
      {!isExpanded && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 text-slate-300 text-xs border-b border-slate-800">
          <span className="truncate font-medium text-[11px] text-slate-300">
            {isYouTube
              ? playbackMode === 'audio'
                ? 'YouTube Stream (Audio Focus)'
                : 'YouTube Video'
              : 'Direct Video Stream'}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setExpanded(true)}
              className="p-1 hover:text-white rounded hover:bg-slate-800"
              title="Expand Player"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Embedded player viewport */}
      <div className="relative aspect-video w-full bg-black">
        {/* Hidden YT container kept mounted for API stability */}
        <div id="mediaflow-yt-player" className={isYouTube ? 'w-full h-full' : 'hidden'} />

        {/* Direct HTML5 video playback if active */}
        {hasDirectVideo && currentMedia?.authorizedVideoUrl && (
          <video
            src={currentMedia.authorizedVideoUrl}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Honest audio mode notice if in YouTube audio mode */}
      {isYouTube && playbackMode === 'audio' && (
        <div className="px-3 py-2 bg-slate-950/95 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <p className="leading-tight">
            Official YouTube terms require embedded player display and prohibit audio extraction.
            MediaFlow provides authorized video playback while prioritizing artwork and audio controls.
          </p>
        </div>
      )}
    </div>
  );
};
