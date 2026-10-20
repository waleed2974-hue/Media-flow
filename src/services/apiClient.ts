import { MediaItem, SearchResponse } from '../types/media';

const SEARCH_CACHE = new Map<string, { data: SearchResponse; timestamp: number }>();
const CACHE_TTL_MS = 60000; // 1 minute client-side search cache

export async function searchMedia(
  query: string,
  type: string = 'all',
  page?: string,
  signal?: AbortSignal
): Promise<SearchResponse> {
  const cacheKey = `${query.toLowerCase()}::${type}::${page || ''}`;
  const cached = SEARCH_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const params = new URLSearchParams({
    q: query,
    type,
  });
  if (page) {
    params.set('page', page);
  }

  const res = await fetch(`/api/search?${params.toString()}`, { signal });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || `Search failed with status ${res.status}`);
  }

  const data: SearchResponse = await res.json();
  SEARCH_CACHE.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

export async function fetchSearchSuggestions(query: string): Promise<string[]> {
  try {
    const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.suggestions || [];
  } catch {
    return [];
  }
}

export async function fetchCurated(category: string = 'all'): Promise<MediaItem[]> {
  try {
    const res = await fetch(`/api/curated?category=${encodeURIComponent(category)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

export async function fetchConfigStatus(): Promise<{ youtubeConfigured: boolean; message: string }> {
  try {
    const res = await fetch('/api/config-status');
    if (!res.ok) throw new Error('Status fetch failed');
    return await res.json();
  } catch {
    return {
      youtubeConfigured: false,
      message: 'Running in open audio mode.',
    };
  }
}
