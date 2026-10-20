import { MediaItem } from '../../src/types/media';
import { formatDuration } from '../../src/utils/formatDuration';

interface ArchiveDoc {
  identifier: string;
  title?: string;
  creator?: string;
  description?: string;
  mediatype?: string;
  year?: string;
  publicdate?: string;
  downloads?: number;
}

interface ArchiveFile {
  name: string;
  format?: string;
  length?: string;
  title?: string;
  size?: string;
  private?: string;
}

// Cache file lookups so repeat searches are fast
const FILE_CACHE = new Map<string, { fileUrl: string; duration?: number; title?: string } | null>();

export async function resolveArchiveAudioFile(
  identifier: string
): Promise<{ fileUrl: string; duration?: number; title?: string } | null> {
  if (FILE_CACHE.has(identifier)) {
    return FILE_CACHE.get(identifier) || null;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(`https://archive.org/metadata/${identifier}/files`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MediaFlow/1.0',
        Accept: 'application/json',
      },
    });

    clearTimeout(timer);
    if (!res.ok) {
      FILE_CACHE.set(identifier, null);
      return null;
    }

    const data = await res.json();
    const files: ArchiveFile[] = data.result || [];

    // Filter public audio files
    const audioFiles = files.filter(
      (f) =>
        f.private !== 'true' &&
        f.name &&
        !f.name.startsWith('.') &&
        (f.name.toLowerCase().endsWith('.mp3') ||
          f.name.toLowerCase().endsWith('.ogg') ||
          f.name.toLowerCase().endsWith('.m4a') ||
          f.format?.toLowerCase().includes('mp3') ||
          f.format?.toLowerCase().includes('ogg'))
    );

    if (audioFiles.length === 0) {
      FILE_CACHE.set(identifier, null);
      return null;
    }

    // Prefer VBR MP3 or MP3 with length
    const bestFile =
      audioFiles.find(
        (f) =>
          f.name.toLowerCase().endsWith('.mp3') &&
          !f.name.toLowerCase().endsWith('_64kb.mp3') &&
          Boolean(f.length)
      ) ||
      audioFiles.find((f) => f.name.toLowerCase().endsWith('.mp3')) ||
      audioFiles[0];

    const rawLen = bestFile.length ? parseFloat(bestFile.length) : undefined;
    const duration = rawLen && !isNaN(rawLen) ? Math.floor(rawLen) : undefined;
    const directUrl = `https://archive.org/download/${identifier}/${encodeURIComponent(bestFile.name)}`;

    const resolved = {
      fileUrl: directUrl,
      duration,
      title: bestFile.title,
    };

    FILE_CACHE.set(identifier, resolved);
    return resolved;
  } catch {
    FILE_CACHE.set(identifier, null);
    return null;
  }
}

export async function searchInternetArchive(
  query: string,
  type: string = 'all',
  page: number = 1
): Promise<{ items: MediaItem[]; totalResults?: number }> {
  try {
    const archiveUrl = new URL('https://archive.org/advancedsearch.php');

    let mediaFilter = '(mediatype:audio AND (collection:georgeblood OR collection:78rpm OR collection:netlabels OR collection:audio_music OR collection:librivoxaudio OR collection:musopen OR collection:etree))';
    if (type === 'video') {
      mediaFilter = 'mediatype:movies';
    } else if (type === 'podcast') {
      mediaFilter = '(mediatype:audio AND (collection:podcasts OR collection:audio_bookspoetry OR collection:librivoxaudio))';
    }

    const cleanQuery = query.replace(/[^\w\s-]/g, ' ').trim();
    const qStr = `${cleanQuery ? `(${cleanQuery}) AND ` : ''}${mediaFilter}`;

    archiveUrl.searchParams.set('q', qStr);
    archiveUrl.searchParams.set('fl[]', 'identifier,title,creator,description,mediatype,year,publicdate,downloads');
    archiveUrl.searchParams.set('sort[]', 'downloads desc');
    archiveUrl.searchParams.set('rows', '12');
    archiveUrl.searchParams.set('page', String(page));
    archiveUrl.searchParams.set('output', 'json');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(archiveUrl.toString(), {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 MediaFlow/1.0',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return { items: [] };
    }

    const data = await response.json();
    const docs: ArchiveDoc[] = data.response?.docs || [];

    // In parallel, resolve real playable audio filenames for each identifier
    const resolvedResults = await Promise.allSettled(
      docs.map(async (doc) => {
        const id = doc.identifier;
        const isVideo = doc.mediatype === 'movies';

        let authorizedAudioUrl: string | undefined = undefined;
        let authorizedVideoUrl: string | undefined = undefined;
        let trackDuration: number | undefined = undefined;
        let directDownloadUrl: string | undefined = undefined;

        if (isVideo) {
          authorizedVideoUrl = `https://archive.org/download/${id}/${id}.mp4`;
          directDownloadUrl = authorizedVideoUrl;
        } else {
          // Resolve real MP3 file name
          const resolved = await resolveArchiveAudioFile(id);
          if (resolved) {
            // Use same-origin streaming proxy with archiveId fallback
            authorizedAudioUrl = `/api/stream?url=${encodeURIComponent(resolved.fileUrl)}&archiveId=${encodeURIComponent(id)}`;
            directDownloadUrl = resolved.fileUrl;
            trackDuration = resolved.duration;
          }
        }

        // Only include item if a real playable file was found or is video
        if (!authorizedAudioUrl && !authorizedVideoUrl) {
          return null;
        }

        const thumb = `https://archive.org/services/img/${id}`;
        const canonicalUrl = `https://archive.org/details/${id}`;
        const mediaType = isVideo ? 'video' : type === 'podcast' ? 'podcast' : 'audio';

        const item: MediaItem = {
          id: `ia:${id}`,
          rawId: id,
          provider: 'archive',
          providerName: 'Internet Archive',
          title: doc.title || id,
          creator: doc.creator || 'Public Domain / Creative Commons',
          thumbnail: thumb,
          duration: trackDuration,
          durationFormatted: trackDuration ? formatDuration(trackDuration) : undefined,
          mediaType,
          playbackCapabilities: isVideo ? ['video'] : ['audio'],
          canonicalUrl,
          authorizedAudioUrl,
          authorizedVideoUrl,
          directDownloadUrl,
          attribution: 'Internet Archive (Public Domain / CC)',
          description: doc.description ? stripHtml(doc.description).slice(0, 300) : undefined,
          publishedAt: doc.publicdate || doc.year,
          isAvailable: true,
        };

        return item;
      })
    );

    const validItems: MediaItem[] = [];
    for (const res of resolvedResults) {
      if (res.status === 'fulfilled' && res.value !== null) {
        validItems.push(res.value);
      }
    }

    return {
      items: validItems,
      totalResults: data.response?.numFound,
    };
  } catch (err) {
    console.error('Internet Archive search exception', err);
    return { items: [] };
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}
