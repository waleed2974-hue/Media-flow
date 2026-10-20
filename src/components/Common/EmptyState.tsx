import React from 'react';
import { Search, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  suggestions?: string[];
  onSelectSuggestion?: (query: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No media found',
  description = 'Try searching with different keywords, artist names, or check your search filters.',
  suggestions = ['Atif Aslam', 'Arijit Singh', 'Pashto songs', 'Punjabi music', 'Relaxing instrumental', 'Tech tutorials'],
  onSelectSuggestion,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/30 border border-slate-800/80 rounded-2xl max-w-lg mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mb-4">
        <Search className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-100 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>

      {suggestions && suggestions.length > 0 && onSelectSuggestion && (
        <div className="w-full">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-2.5">
            Suggested Searches
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => onSelectSuggestion(s)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-950/60 hover:text-indigo-300 hover:border-indigo-800 border border-slate-700/60 text-xs text-slate-300 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>{s}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
