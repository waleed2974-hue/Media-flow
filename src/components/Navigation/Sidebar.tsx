import React from 'react';
import {
  Compass,
  Search,
  Music2,
  Tv,
  Radio,
  ListMusic,
  Heart,
  History,
  Settings,
  Plus,
  Play,
  Download,
} from 'lucide-react';
import { useMedia } from '../../context/MediaContext';
import { usePlayer } from '../../context/PlayerContext';

export type NavPage =
  | 'home'
  | 'search'
  | 'music'
  | 'videos'
  | 'podcasts'
  | 'playlists'
  | 'favorites'
  | 'history'
  | 'settings';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  onOpenCreatePlaylist: () => void;
  onOpenDownloads?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  onOpenCreatePlaylist,
  onOpenDownloads,
}) => {
  const { playlists, favorites } = useMedia();
  const { playMedia } = usePlayer();

  const mainNav: Array<{ id: NavPage; label: string; icon: React.ElementType }> = [
    { id: 'home', label: 'Discover', icon: Compass },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'music', label: 'Music', icon: Music2 },
    { id: 'videos', label: 'Videos', icon: Tv },
    { id: 'podcasts', label: 'Podcasts', icon: Radio },
  ];

  const libraryNav: Array<{ id: NavPage; label: string; icon: React.ElementType; count?: number }> = [
    { id: 'playlists', label: 'Playlists', icon: ListMusic, count: playlists.length },
    { id: 'favorites', label: 'Favorites', icon: Heart, count: favorites.length },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800/80 text-slate-300 p-4 shrink-0 select-none">
      {/* Brand Wordmark (Single text element in display style) */}
      <div
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2.5 px-3 py-3 mb-6 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30 text-white font-bold transition-transform group-hover:scale-105">
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white font-sans">
          MediaFlow
        </span>
      </div>

      {/* Primary Discovery Navigation */}
      <div className="space-y-1 mb-6">
        <span className="px-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
          Discover
        </span>
        {mainNav.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Library Section */}
      <div className="space-y-1 mb-6">
        <div className="flex items-center justify-between px-3 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Library
          </span>
          <button
            onClick={onOpenCreatePlaylist}
            className="p-1 rounded hover:bg-slate-900 text-slate-400 hover:text-indigo-400 transition-colors"
            title="Create Playlist"
            aria-label="Create Playlist"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        {libraryNav.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className="text-xs font-mono tabular-nums text-slate-500">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
        {onOpenDownloads && (
          <button
            onClick={onOpenDownloads}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Downloads</span>
          </button>
        )}
      </div>

      {/* Playlists quick list */}
      <div className="flex-1 overflow-y-auto space-y-1 border-t border-slate-900 pt-4">
        <span className="px-3 text-[11px] font-medium uppercase tracking-wider text-slate-500 block mb-1">
          Saved Playlists
        </span>
        {playlists.length === 0 ? (
          <p className="px-3 text-xs text-slate-600">No playlists yet</p>
        ) : (
          playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => onNavigate('playlists')}
              className="w-full text-left px-3 py-1.5 rounded text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 truncate transition-colors flex items-center justify-between group"
            >
              <span className="truncate">{pl.name}</span>
              <span className="text-[10px] font-mono tabular-nums text-slate-600 group-hover:text-slate-400">
                {pl.items.length}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Provider Status Note */}
      <div className="mt-auto pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium text-slate-300">Authorized Sources</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
          YouTube IFrame API & Open Audio Catalogs
        </p>
      </div>
    </aside>
  );
};
