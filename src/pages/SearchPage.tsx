import React, { useState, useEffect } from 'react';
import { Search, Info, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { MediaItem, MediaType, SearchResponse } from '../types/media';
import { searchMedia } from '../services/apiClient';
import { SearchBar } from '../components/Search/SearchBar';
import { SearchFilters } from '../components/Search/SearchFilters';
import { MediaCard } from '../components/Media/MediaCard';
import { LoadingState } from '../components/Common/LoadingState';
import { EmptyState } from '../components/Common/EmptyState';
import { ErrorState } from '../components/Common/ErrorState';

interface SearchPageProps {
  initialQuery?: string;
  onOpenPlaylistModal: (item: MediaItem) => void;
  onOpenDownloadModal?: (item: MediaItem) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  initialQuery = '',
  onOpenPlaylistModal,
  onOpenDownloadModal,
}) => {
  const [query, setQuery] = useState(initialQuery || 'Atif Aslam');
  const [mediaType, setMediaType] = useState<MediaType>('all');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [totalResults, setTotalResults] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | undefined>(undefined);
  const [isYoutubeConfigured, setIsYoutubeConfigured] = useState<boolean>(true);

  // Perform search when query or mediaType changes
  useEffect(() => {
    if (!query.trim()) return;

    let active = true;
    const controller = new AbortController();

    const doSearch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data: SearchResponse = await searchMedia(query, mediaType, undefined, controller.signal);
        if (active) {
          setResults(data.items);
          setNextPageToken(data.nextPageToken);
          setTotalResults(data.totalResults);
          setErrorNotice(data.errorNotice);
          setIsYoutubeConfigured(data.youtubeConfigured);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && active) {
          setError(err.message || 'Failed to search media providers');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    doSearch();

    return () => {
      active = false;
      controller.abort();
    };
  }, [query, mediaType]);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
  };

  const handleLoadMore = async () => {
    if (!nextPageToken || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const data = await searchMedia(query, mediaType, nextPageToken);
      setResults((prev) => [...prev, ...data.items]);
      setNextPageToken(data.nextPageToken);
    } catch (e: any) {
      console.warn('Load more error:', e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Top Search Controls */}
      <div className="space-y-4">
        <div className="max-w-3xl">
          <SearchBar initialQuery={query} onSearch={handleSearch} autoFocus={false} />
        </div>

        {/* Filter bar */}
        <SearchFilters
          currentType={mediaType}
          onSelectType={setMediaType}
          resultCount={results.length}
          totalCount={totalResults}
        />
      </div>

      {/* Provider & API Status Notice */}
      {errorNotice && (
        <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold block text-amber-200">YouTube API Notice</span>
            <span>{errorNotice}</span>
          </div>
        </div>
      )}

      {/* Main Results View */}
      {isLoading ? (
        <LoadingState count={8} />
      ) : error ? (
        <ErrorState
          title="Search Failed"
          message={error}
          onRetry={() => handleSearch(query)}
        />
      ) : results.length === 0 ? (
        <EmptyState
          title={`No results for "${query}"`}
          description="Try broadening your query, selecting 'All Media', or searching for another song, artist, or podcast."
          onSelectSuggestion={(s) => handleSearch(s)}
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onOpenPlaylistModal={onOpenPlaylistModal}
                onOpenDownloadModal={onOpenDownloadModal}
              />
            ))}
          </div>

          {/* Load More Button */}
          {nextPageToken && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading more tracks...</span>
                  </>
                ) : (
                  <span>Load More Results</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
