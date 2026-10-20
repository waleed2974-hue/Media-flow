import React from 'react';
import { Compass, Music2, Tv, Radio, Volume2 } from 'lucide-react';
import { MediaType } from '../../types/media';

interface SearchFiltersProps {
  currentType: MediaType;
  onSelectType: (type: MediaType) => void;
  resultCount?: number;
  totalCount?: number;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  currentType,
  onSelectType,
  resultCount,
  totalCount,
}) => {
  const filterTabs: Array<{ id: MediaType; label: string; icon: React.ElementType }> = [
    { id: 'all', label: 'All Media', icon: Compass },
    { id: 'music', label: 'Music', icon: Music2 },
    { id: 'video', label: 'Videos', icon: Tv },
    { id: 'podcast', label: 'Podcasts', icon: Radio },
    { id: 'audio', label: 'Direct Audio', icon: Volume2 },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-b border-slate-800/80">
      {/* Segmented Filter Control */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectType(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Result Counter (Tabular numerals, unboxed) */}
      {resultCount !== undefined && (
        <div className="text-xs text-slate-400 font-mono tabular-nums shrink-0">
          <span>{resultCount}</span>
          {totalCount ? <span> of {totalCount} results</span> : <span> results</span>}
        </div>
      )}
    </div>
  );
};
