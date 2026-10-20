import { MediaItem } from '../../src/types/media';

interface WikiItem {
  pageid: number;
  title: string;
  imageinfo?: Array<{
    url: string;
    descriptionurl: string;
    mime: string;
    extmetadata?: {
      Artist?: { value: string };
      ObjectName?: { value: string };
      LicenseShortName?: { value: string };
      Credit?: { value: string };
    };
  }>;
}

export async function searchWikimediaAudio(query: string): Promise<MediaItem[]> {
  try {
    const wikiUrl = new URL('https://commons.wikimedia.org/w/api.php');
    wikiUrl.searchParams.set('action', 'query');
    wikiUrl.searchParams.set('generator', 'search');
    // Search audio namespace files
    wikiUrl.searchParams.set('gsrsearch', `${query} filetype:audio`);
    wikiUrl.searchParams.set('gsrnamespace', '6'); // File namespace
    wikiUrl.searchParams.set('gsrlimit', '8');
    wikiUrl.searchParams.set('prop', 'imageinfo');
    wikiUrl.searchParams.set('iiprop', 'url|mime|extmetadata');
    wikiUrl.searchParams.set('format', 'json');
    wikiUrl.searchParams.set('origin', '*');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(wikiUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'MediaFlowApp/1.0 (https://github.com; contact: mediaflow@example.com)',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) return [];

    const data = await response.json();
    const pages: Record<string, WikiItem> = data.query?.pages || {};

    const items: MediaItem[] = Object.values(pages)
      .filter((page) => page.imageinfo && page.imageinfo.length > 0)
      .map((page) => {
        const info = page.imageinfo![0];
        const titleClean = page.title.replace(/^File:/, '').replace(/\.[^/.]+$/, '');
        const artist = info.extmetadata?.Artist?.value?.replace(/<[^>]*>/g, '').trim() || 'Wikimedia Commons';
        const license = info.extmetadata?.LicenseShortName?.value || 'Creative Commons';

        return {
          id: `wiki:${page.pageid}`,
          rawId: String(page.pageid),
          provider: 'wikimedia',
          providerName: 'Wikimedia Commons',
          title: titleClean,
          creator: artist,
          thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Commons-logo.svg/320px-Commons-logo.svg.png',
          mediaType: 'audio',
          playbackCapabilities: ['audio'],
          canonicalUrl: info.descriptionurl || `https://commons.wikimedia.org/?curid=${page.pageid}`,
          authorizedAudioUrl: `/api/stream?url=${encodeURIComponent(info.url)}`,
          directDownloadUrl: info.url,
          attribution: `Wikimedia Commons (${license})`,
          license,
          isAvailable: true,
        };
      });

    return items;
  } catch (err) {
    console.error('Wikimedia search error', err);
    return [];
  }
}
