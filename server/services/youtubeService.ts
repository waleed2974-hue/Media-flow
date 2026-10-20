import { MediaItem } from '../../src/types/media';
import { parseISO8601Duration, formatDuration } from '../../src/utils/formatDuration';

interface YouTubeSearchItem {
  id: {
    kind: string;
    videoId?: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
      maxres?: { url: string };
    };
    channelTitle: string;
    liveBroadcastContent?: string;
  };
}

interface YouTubeVideoDetail {
  id: string;
  contentDetails?: {
    duration?: string;
  };
  snippet?: {
    tags?: string[];
  };
}

export async function searchYouTube(
  query: string,
  type: string = 'all',
  apiKey?: string,
  pageToken?: string
): Promise<{ items: MediaItem[]; nextPageToken?: string; totalResults?: number }> {
  if (!apiKey) {
    return { items: [] };
  }

  try {
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('maxResults', '18');
    searchUrl.searchParams.set('q', query);
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('key', apiKey);

    // Filter by category if relevant
    if (type === 'music') {
      searchUrl.searchParams.set('videoCategoryId', '10'); // Music category
    }

    if (pageToken) {
      searchUrl.searchParams.set('pageToken', pageToken);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(searchUrl.toString(), {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`YouTube search error (${response.status}):`, errText);
      return { items: [] };
    }

    const data = await response.json();
    const rawItems: YouTubeSearchItem[] = data.items || [];
    const videoIds = rawItems
      .map((item) => item.id?.videoId)
      .filter((id): id is string => Boolean(id));

    if (videoIds.length === 0) {
      return { items: [], nextPageToken: data.nextPageToken, totalResults: data.pageInfo?.totalResults };
    }

    // Fetch video durations via videos endpoint
    const detailsMap = new Map<string, { durationSec: number; durationText: string }>();
    try {
      const detailUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
      detailUrl.searchParams.set('part', 'contentDetails,snippet');
      detailUrl.searchParams.set('id', videoIds.join(','));
      detailUrl.searchParams.set('key', apiKey);

      const detailRes = await fetch(detailUrl.toString());
      if (detailRes.ok) {
        const detailData = await detailRes.json();
        const details: YouTubeVideoDetail[] = detailData.items || [];
        for (const d of details) {
          if (d.contentDetails?.duration) {
            const sec = parseISO8601Duration(d.contentDetails.duration);
            detailsMap.set(d.id, {
              durationSec: sec,
              durationText: formatDuration(sec),
            });
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch YouTube video details', e);
    }

    const items: MediaItem[] = rawItems
      .filter((raw) => Boolean(raw.id?.videoId))
      .map((raw) => {
        const videoId = raw.id.videoId!;
        const snippet = raw.snippet;
        const details = detailsMap.get(videoId);
        const thumb =
          snippet.thumbnails.maxres?.url ||
          snippet.thumbnails.high?.url ||
          snippet.thumbnails.medium?.url ||
          snippet.thumbnails.default?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        const isMusicQuery =
          type === 'music' ||
          query.toLowerCase().includes('song') ||
          query.toLowerCase().includes('music') ||
          query.toLowerCase().includes('acoustic');

        return {
          id: `yt:${videoId}`,
          rawId: videoId,
          provider: 'youtube',
          providerName: 'YouTube',
          title: decodeHtmlEntities(snippet.title),
          creator: decodeHtmlEntities(snippet.channelTitle),
          thumbnail: thumb,
          duration: details?.durationSec,
          durationFormatted: details?.durationText,
          mediaType: isMusicQuery ? 'music' : 'video',
          playbackCapabilities: ['video', 'audio'],
          canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
          embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(process.env.APP_URL || 'http://localhost:3000')}`,
          attribution: 'Official YouTube Embed API v3',
          description: snippet.description,
          publishedAt: snippet.publishedAt,
          isAvailable: true,
          audioModeNotice:
            "YouTube's official IFrame Player API requires video display and does not permit separate audio stream extraction. In Audio Mode, MediaFlow embeds the official video player with an artwork-focused layout.",
        };
      });

    return {
      items,
      nextPageToken: data.nextPageToken,
      totalResults: data.pageInfo?.totalResults,
    };
  } catch (err) {
    console.error('YouTube search exception', err);
    return { items: [] };
  }
}

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}
