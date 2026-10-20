import React from 'react';
import { Compass, Search, Music2, Tv, ListMusic } from 'lucide-react';
import { NavPage } from './Sidebar';

interface MobileNavProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  hasActivePlayer: boolean;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentPage,
  onNavigate,
  hasActivePlayer,
}) => {
  const items: Array<{ id: NavPage; label: string; icon: React.ElementType }> = [
    { id: 'home', label: 'Discover', icon: Compass },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'music', label: 'Music', icon: Music2 },
    { id: 'videos', label: 'Videos', icon: Tv },
    { id: 'playlists', label: 'Library', icon: ListMusic },
  ];

  return (
    <nav
      className={`md:hidden fixed left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 transition-all ${
        hasActivePlayer ? 'bottom-20' : 'bottom-0'
      }`}
    >
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded text-xs font-medium transition-colors ${
                isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
