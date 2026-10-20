import React from 'react';
import { Search, Plus } from 'lucide-react';
import { NavPage } from './Sidebar';

interface TopBarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  onOpenCreatePlaylist: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentPage,
  onNavigate,
  onOpenCreatePlaylist,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      {/* Zone 1: Brand wordmark / section title */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onNavigate('home')}
          className="text-lg font-bold tracking-tight text-white hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span>MediaFlow</span>
        </button>
      </div>

      {/* Zone 2: Concise single-line navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => onNavigate('home')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentPage === 'home' ? 'text-white font-semibold' : ''
          }`}
        >
          Discover
        </button>
        <button
          onClick={() => onNavigate('search')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentPage === 'search' ? 'text-white font-semibold' : ''
          }`}
        >
          Search
        </button>
        <button
          onClick={() => onNavigate('music')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentPage === 'music' ? 'text-white font-semibold' : ''
          }`}
        >
          Music
        </button>
        <button
          onClick={() => onNavigate('videos')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentPage === 'videos' ? 'text-white font-semibold' : ''
          }`}
        >
          Videos
        </button>
        <button
          onClick={() => onNavigate('podcasts')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            currentPage === 'podcasts' ? 'text-white font-semibold' : ''
          }`}
        >
          Podcasts
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onNavigate('search')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          title="Search all media"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search media...</span>
        </button>

        <button
          onClick={onOpenCreatePlaylist}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap shrink-0 shadow-sm"
          title="Create Playlist"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Playlist</span>
        </button>
      </div>
    </header>
  );
};
