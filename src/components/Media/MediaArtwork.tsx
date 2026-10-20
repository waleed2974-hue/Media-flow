import React, { useState } from 'react';
import { Music, Video, Radio, Disc } from 'lucide-react';

interface MediaArtworkProps {
  src?: string;
  alt: string;
  className?: string;
  type?: 'music' | 'video' | 'podcast' | 'audio';
  provider?: string;
}

export const MediaArtwork: React.FC<MediaArtworkProps> = ({
  src,
  alt,
  className = '',
  type = 'music',
  provider,
}) => {
  const [hasError, setHasError] = useState(false);

  // If image fails to load or not provided, render a refined CSS/SVG acoustic waveform fallback
  if (!src || hasError) {
    const Icon = type === 'video' ? Video : type === 'podcast' ? Radio : Disc;
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950/60 border border-slate-800/80 text-slate-400 ${className}`}
        aria-label={alt}
      >
        {/* Subtle decorative soundwave curve */}
        <div className="absolute inset-0 opacity-15 flex items-center justify-center space-x-1">
          <div className="w-1 h-6 bg-indigo-400 rounded-full animate-pulse" />
          <div className="w-1 h-10 bg-indigo-300 rounded-full animate-pulse delay-75" />
          <div className="w-1 h-14 bg-indigo-200 rounded-full animate-pulse delay-150" />
          <div className="w-1 h-8 bg-indigo-400 rounded-full animate-pulse delay-100" />
          <div className="w-1 h-4 bg-indigo-500 rounded-full" />
        </div>
        <Icon className="w-7 h-7 text-indigo-300/80 relative z-10" />
        {provider && (
          <span className="absolute bottom-1 right-1.5 text-[9px] font-mono tracking-wider text-slate-400 bg-slate-950/80 px-1 py-0.5 rounded">
            {provider}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-slate-900 ${className}`}>
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
    </div>
  );
};
