import React, { useState, useEffect, useRef } from 'react';
import { Search, X, History, Sparkles, ArrowRight } from 'lucide-react';
import { fetchSearchSuggestions } from '../../services/apiClient';
import { useMedia } from '../../context/MediaContext';

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = '',
  onSearch,
  placeholder = 'Search song titles, artists, videos, audio tracks, or paste YouTube link...',
  autoFocus = false,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const { searchHistory, addSearchQuery } = useMedia();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync with initialQuery if changed externally
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Fetch autocomplete suggestions as user types
  useEffect(() => {
    let active = true;
    const fetchSugg = async () => {
      if (query.trim().length > 1) {
        const res = await fetchSearchSuggestions(query);
        if (active) setSuggestions(res);
      } else {
        if (active) setSuggestions([]);
      }
    };

    const timer = setTimeout(fetchSugg, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    addSearchQuery(trimmed);
    setIsFocused(false);
    onSearch(trimmed);
  };

  const handleSelectSuggestion = (suggested: string) => {
    setQuery(suggested);
    addSearchQuery(suggested);
    setIsFocused(false);
    onSearch(suggested);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center w-full bg-slate-900 border rounded-2xl transition-all shadow-sm ${
          isFocused
            ? 'border-indigo-500/80 ring-2 ring-indigo-500/20 bg-slate-900/95'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="pl-4.5 pr-2 text-slate-400">
          <Search className="w-5 h-5 text-indigo-400" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full py-3.5 pr-12 bg-transparent text-sm md:text-base text-slate-100 placeholder-slate-400 focus:outline-none"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 mr-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          className="mr-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs md:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <span>Search</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Autocomplete / Suggestions Popover */}
      {isFocused && (suggestions.length > 0 || searchHistory.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-900/98 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-800/80">
          {/* Recent Searches */}
          {query.trim().length <= 1 && searchHistory.length > 0 && (
            <div className="p-3">
              <span className="px-3 text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-2">
                Recent Searches
              </span>
              <div className="space-y-1">
                {searchHistory.slice(0, 5).map((historyItem, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(historyItem)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs md:text-sm text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-left"
                  >
                    <History className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{historyItem}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Autocomplete / Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-3">
              <span className="px-3 text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-2">
                Suggestions
              </span>
              <div className="space-y-1">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs md:text-sm text-slate-200 hover:text-white hover:bg-indigo-950/40 hover:border-indigo-900 border border-transparent transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
