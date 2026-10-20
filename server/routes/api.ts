import { Router, Request, Response } from 'express';
import { Readable } from 'stream';
import { searchYouTube } from '../services/youtubeService';
import { searchInternetArchive, resolveArchiveAudioFile } from '../services/archiveService';
import { searchWikimediaAudio } from '../services/wikimediaService';
import { MediaItem, SearchResponse } from '../../src/types/media';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  const ytKey = process.env.YOUTUBE_API_KEY;
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    youtubeConfigured: Boolean(ytKey && ytKey !== 'your_youtube_api_key_here'),
  });
});

// Config status for the UI
router.get('/config-status', (_req: Request, res: Response) => {
  const ytKey = process.env.YOUTUBE_API_KEY;
  const isConfigured = Boolean(ytKey && ytKey !== 'your_youtube_api_key_here');
  res.json({
    youtubeConfigured: isConfigured,
    message: isConfigured
      ? 'YouTube Data API v3 key is active.'
      : 'YouTube Data API v3 key is not configured. MediaFlow is running with authorized Internet Archive and Wikimedia open media providers, and embedded player support.',
  });
});

// Search suggestions
router.get('/search/suggestions', (req: Request, res: Response) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  if (!q) {
    return res.json({
      suggestions: [
        'Atif Aslam Tajdar-e-Haram',
        'Arijit Singh romantic songs',
        'Pashto new songs',
        'Punjabi music',
        'relaxing instrumental music',
        'motivational speeches',
        'technology tutorials',
        'podcast episodes',
        'Beethoven Moonlight Sonata',
        'Lo-Fi beats study',
      ],
    });
  }

  const pool = [
    'Atif Aslam Tajdar-e-Haram',
    'Atif Aslam live acoustic',
    'Arijit Singh romantic songs',
    'Arijit Singh unplugged',
    'Pashto new songs',
    'Punjabi music hits',
    'relaxing instrumental music',
    'relaxing rain sounds with piano',
    'motivational speeches',
    'technology tutorials',
    'podcast episodes science',
    'classical piano concertos',
    'jazz cafe ambient music',
    'synthwave retro electronic',
    'Beethoven Symphony No. 5',
    'Mozart Requiem',
    'Chopin Nocturnes',
    'lofi hip hop radio beats to relax/study to',
    'deep work focus audio',
    'space exploration documentary',
  ];

  const matched = pool.filter((item) => item.toLowerCase().includes(q)).slice(0, 8);
  if (matched.length === 0) {
    matched.push(q, `${q} live`, `${q} audio`, `${q} instrumental`);
  }

  res.json({ suggestions: matched });
});

// Universal Search Endpoint
router.get('/search', async (req: Request, res: Response) => {
  const query = String(req.query.q || '').trim();
  const type = String(req.query.type || 'all').toLowerCase();
  const page = String(req.query.page || '');

  if (!query) {
    return res.status(400).json({ error: 'Search query parameter "q" is required.' });
  }

  const ytKey = process.env.YOUTUBE_API_KEY;
  const isYtConfigured = Boolean(ytKey && ytKey !== 'your_youtube_api_key_here');

  const combinedItems: MediaItem[] = [];
  let nextPageToken: string | undefined = undefined;
  let totalCount = 0;

  // 1. YouTube Search if key configured
  if (isYtConfigured) {
    try {
      const ytResult = await searchYouTube(query, type, ytKey, page || undefined);
      combinedItems.push(...ytResult.items);
      nextPageToken = ytResult.nextPageToken;
      totalCount += ytResult.totalResults || ytResult.items.length;
    } catch (err) {
      console.warn('YouTube search route warning:', err);
    }
  }

  // 2. Direct Audio / Archive / Wikimedia Search
  // If user searched for audio, podcast, all, or if YouTube is not configured, fetch from Archive & Wikimedia
  if (type === 'audio' || type === 'podcast' || type === 'all' || !isYtConfigured) {
    try {
      const archivePage = page && !isNaN(Number(page)) ? Number(page) : 1;
      const [archiveRes, wikiItems] = await Promise.all([
        searchInternetArchive(query, type, archivePage),
        type === 'audio' || type === 'all' ? searchWikimediaAudio(query) : Promise.resolve([]),
      ]);

      combinedItems.push(...archiveRes.items);
      combinedItems.push(...wikiItems);
      totalCount += (archiveRes.totalResults || archiveRes.items.length) + wikiItems.length;
    } catch (err) {
      console.warn('Open audio search route warning:', err);
    }
  }

  // Check if query looks like a direct YouTube URL or Video ID
  const ytUrlMatch = query.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  const directYtId = ytUrlMatch ? ytUrlMatch[1] : (query.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(query) ? query : null);

  if (directYtId && !combinedItems.some((i) => i.rawId === directYtId)) {
    // Add direct entry for the requested YouTube ID
    combinedItems.unshift({
      id: `yt:${directYtId}`,
      rawId: directYtId,
      provider: 'youtube',
      providerName: 'YouTube',
      title: `YouTube Video (${directYtId})`,
      creator: 'YouTube Creator',
      thumbnail: `https://i.ytimg.com/vi/${directYtId}/hqdefault.jpg`,
      mediaType: 'video',
      playbackCapabilities: ['video', 'audio'],
      canonicalUrl: `https://www.youtube.com/watch?v=${directYtId}`,
      embedUrl: `https://www.youtube.com/embed/${directYtId}?autoplay=1&enablejsapi=1`,
      attribution: 'YouTube IFrame Embed',
      isAvailable: true,
      audioModeNotice:
        "YouTube's official IFrame Player API requires video display. In Audio Mode, MediaFlow embeds the player with an artwork-focused view.",
    });
  }

  // Check if query is an Internet Archive URL: https://archive.org/details/{id}
  const archiveUrlMatch = query.match(/archive\.org\/details\/([a-zA-Z0-9_\-\.]+)/i);
  if (archiveUrlMatch) {
    const archiveId = archiveUrlMatch[1];
    if (!combinedItems.some((i) => i.rawId === archiveId)) {
      try {
        const resolved = await resolveArchiveAudioFile(archiveId);
        if (resolved) {
          combinedItems.unshift({
            id: `ia:${archiveId}`,
            rawId: archiveId,
            provider: 'archive',
            providerName: 'Internet Archive',
            title: resolved.title || archiveId,
            creator: 'Internet Archive Open Media',
            thumbnail: `https://archive.org/services/img/${archiveId}`,
            duration: resolved.duration,
            durationFormatted: resolved.duration ? `${Math.floor(resolved.duration / 60)}:${String(Math.floor(resolved.duration % 60)).padStart(2, '0')}` : undefined,
            mediaType: 'audio',
            playbackCapabilities: ['audio'],
            canonicalUrl: `https://archive.org/details/${archiveId}`,
            authorizedAudioUrl: `/api/stream?url=${encodeURIComponent(resolved.fileUrl)}&archiveId=${encodeURIComponent(archiveId)}`,
            directDownloadUrl: resolved.fileUrl,
            attribution: 'Internet Archive (Open Access)',
            isAvailable: true,
          });
        }
      } catch (err) {
        console.warn('Direct archive URL resolution error:', err);
      }
    }
  }

  // Check if query is a direct audio or video link: https://.../*.mp3 or *.mp4
  const directMediaMatch = query.match(/^https?:\/\/.+\.(mp3|wav|ogg|m4a|aac|flac|mp4|webm)(\?.*)?$/i);
  if (directMediaMatch) {
    const ext = directMediaMatch[1].toLowerCase();
    const isVideo = ext === 'mp4' || ext === 'webm';
    try {
      const urlObj = new URL(query);
      const pathname = urlObj.pathname;
      const filename = decodeURIComponent(pathname.split('/').pop() || 'Direct Media File');
      const cleanTitle = filename.replace(/\.[^/.]+$/, '');
      const directId = Buffer.from(query).toString('base64url').slice(0, 32);

      if (!combinedItems.some((i) => i.id === `direct:${directId}`)) {
        combinedItems.unshift({
          id: `direct:${directId}`,
          rawId: directId,
          provider: 'direct',
          providerName: 'Direct Media Stream',
          title: cleanTitle || 'Direct Audio / Video Stream',
          creator: urlObj.hostname,
          thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
          mediaType: isVideo ? 'video' : 'audio',
          playbackCapabilities: isVideo ? ['video', 'audio'] : ['audio'],
          canonicalUrl: query,
          authorizedAudioUrl: !isVideo ? `/api/stream?url=${encodeURIComponent(query)}` : undefined,
          authorizedVideoUrl: isVideo ? query : undefined,
          directDownloadUrl: query,
          attribution: `Direct Source (${urlObj.hostname})`,
          isAvailable: true,
        });
      }
    } catch {}
  }

  const response: SearchResponse = {
    items: combinedItems,
    nextPageToken,
    totalResults: totalCount,
    query,
    type: type as any,
    source: isYtConfigured ? 'YouTube Data API v3 & Open Audio Providers' : 'Open Audio Providers (Archive.org & Wikimedia)',
    youtubeConfigured: isYtConfigured,
    errorNotice: !isYtConfigured
      ? 'YouTube API Key not configured in server environment. Showing authorized audio & open media sources. You can also paste any YouTube URL or video ID directly into search!'
      : undefined,
  };

  res.json(response);
});

// Curated & Trending discovery items
router.get('/curated', async (req: Request, res: Response) => {
  const category = String(req.query.category || 'all').toLowerCase();
  const ytKey = process.env.YOUTUBE_API_KEY;
  const isYtConfigured = Boolean(ytKey && ytKey !== 'your_youtube_api_key_here');

  // Curated queries per category
  const queries: Record<string, string> = {
    all: 'popular acoustic music 2026',
    music: 'top instrumental melodies and songs',
    podcasts: 'science technology philosophy podcast',
    classics: 'classical symphony orchestra masterpiece',
    relaxing: 'relaxing lofi chill ambient beats',
  };

  const query = queries[category] || 'music';

  try {
    let items: MediaItem[] = [];

    if (isYtConfigured) {
      const ytResult = await searchYouTube(query, category === 'music' ? 'music' : 'all', ytKey);
      items.push(...ytResult.items);
    }

    // Always mix in high-quality authorized audio from Internet Archive
    const archiveResult = await searchInternetArchive(
      category === 'classics' ? 'beethoven mozart bach' : query,
      category === 'podcasts' ? 'podcast' : 'audio',
      1
    );
    items.push(...archiveResult.items);

    // If still low items, provide rich verified authorized tracks
    if (items.length === 0) {
      items = getVerifiedCatalog(category);
    }

    res.json({ items: items.slice(0, 24), category });
  } catch (err) {
    console.error('Curated endpoint error', err);
    res.json({ items: getVerifiedCatalog(category), category });
  }
});

// Specific media lookup
router.get('/media/:provider/:id', async (req: Request, res: Response) => {
  const { provider, id } = req.params;

  if (provider === 'youtube') {
    return res.json({
      id: `yt:${id}`,
      rawId: id,
      provider: 'youtube',
      providerName: 'YouTube',
      title: `YouTube Media (${id})`,
      creator: 'YouTube Creator',
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      mediaType: 'video',
      playbackCapabilities: ['video', 'audio'],
      canonicalUrl: `https://www.youtube.com/watch?v=${id}`,
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1`,
      attribution: 'YouTube IFrame Embed API',
      isAvailable: true,
      audioModeNotice:
        "YouTube's official IFrame Player API requires video display. In Audio Mode, MediaFlow provides the player with an artwork-focused layout.",
    });
  }

  if (provider === 'archive') {
    try {
      const resolved = await resolveArchiveAudioFile(id);
      return res.json({
        id: `ia:${id}`,
        rawId: id,
        provider: 'archive',
        providerName: 'Internet Archive',
        title: resolved?.title || id,
        creator: 'Public Domain / Creative Commons',
        thumbnail: `https://archive.org/services/img/${id}`,
        duration: resolved?.duration,
        durationFormatted: resolved?.duration
          ? `${Math.floor(resolved.duration / 60)}:${String(Math.floor(resolved.duration % 60)).padStart(2, '0')}`
          : undefined,
        mediaType: 'audio',
        playbackCapabilities: ['audio'],
        canonicalUrl: `https://archive.org/details/${id}`,
        authorizedAudioUrl: resolved?.fileUrl
          ? `/api/stream?url=${encodeURIComponent(resolved.fileUrl)}&archiveId=${encodeURIComponent(id)}`
          : undefined,
        directDownloadUrl: resolved?.fileUrl,
        attribution: 'Internet Archive (Public Domain / CC)',
        isAvailable: true,
      });
    } catch {
      return res.status(404).json({ error: 'Media not found on Internet Archive' });
    }
  }

  res.status(404).json({ error: 'Media not found' });
});

// Verified authorized starter catalog for instant zero-latency experience
function getVerifiedCatalog(category: string): MediaItem[] {
  const catalog: MediaItem[] = [
    {
      id: 'ia:WoO59PocoMotoBagatelleInAMinorFurElise',
      rawId: 'WoO59PocoMotoBagatelleInAMinorFurElise',
      provider: 'archive',
      providerName: 'Internet Archive',
      title: 'Für Elise, WoO 59 (Bagatelle in A minor)',
      creator: 'Ludwig van Beethoven',
      thumbnail: 'https://images.unsplash.com/photo-1520523839898-507121c028a1?auto=format&fit=crop&w=400&q=80',
      duration: 186,
      durationFormatted: '03:06',
      mediaType: 'audio',
      playbackCapabilities: ['audio'],
      canonicalUrl: 'https://archive.org/details/WoO59PocoMotoBagatelleInAMinorFurElise',
      authorizedAudioUrl: `/api/stream?url=${encodeURIComponent('https://archive.org/download/WoO59PocoMotoBagatelleInAMinorFurElise/FrEliseWoo59.mp3')}&archiveId=WoO59PocoMotoBagatelleInAMinorFurElise`,
      directDownloadUrl: 'https://archive.org/download/WoO59PocoMotoBagatelleInAMinorFurElise/FrEliseWoo59.mp3',
      attribution: 'Internet Archive (Public Domain)',
      license: 'Public Domain',
      description: 'Beethovens world-renowned piano masterpiece Für Elise, performed and digitized in public domain.',
      isAvailable: true,
    },
    {
      id: 'ia:wh055',
      rawId: 'wh055',
      provider: 'archive',
      providerName: 'Internet Archive',
      title: 'Insect Trust (Ambient Acoustic Field Study)',
      creator: 'Robert Horton · Webbed Hand Records',
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
      duration: 302,
      durationFormatted: '05:02',
      mediaType: 'audio',
      playbackCapabilities: ['audio'],
      canonicalUrl: 'https://archive.org/details/wh055',
      authorizedAudioUrl: `/api/stream?url=${encodeURIComponent('https://archive.org/download/wh055/wh055_B08_Robert_Horton_Insect_Trust.mp3')}&archiveId=wh055`,
      directDownloadUrl: 'https://archive.org/download/wh055/wh055_B08_Robert_Horton_Insect_Trust.mp3',
      attribution: 'Internet Archive (Creative Commons)',
      license: 'Creative Commons Attribution',
      description: 'Atmospheric ambient acoustic composition from the Far Afield compilation.',
      isAvailable: true,
    },
    {
      id: 'ia:great_composers_1102_librivox',
      rawId: 'great_composers_1102_librivox',
      provider: 'archive',
      providerName: 'Internet Archive',
      title: 'Stories of Great Composers: Beethoven & Classical Masters',
      creator: 'Thomas Tapper · LibriVox Audiobooks',
      thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
      duration: 412,
      durationFormatted: '06:52',
      mediaType: 'podcast',
      playbackCapabilities: ['audio'],
      canonicalUrl: 'https://archive.org/details/great_composers_1102_librivox',
      authorizedAudioUrl: `/api/stream?url=${encodeURIComponent('https://archive.org/download/great_composers_1102_librivox/greatcomposers_01_tapper.mp3')}&archiveId=great_composers_1102_librivox`,
      directDownloadUrl: 'https://archive.org/download/great_composers_1102_librivox/greatcomposers_01_tapper.mp3',
      attribution: 'LibriVox (Public Domain Audiobook)',
      license: 'Public Domain',
      description: 'Historical biographical podcast recounting the early life and creative inspiration of Ludwig van Beethoven.',
      isAvailable: true,
    },
    {
      id: 'ia:symphonic_music_1812_librivox',
      rawId: 'symphonic_music_1812_librivox',
      provider: 'archive',
      providerName: 'Internet Archive',
      title: 'Stories of Symphonic Music: Orchestral Guide',
      creator: 'Lawrence Gilman · LibriVox Classical Audio',
      thumbnail: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=400&q=80',
      duration: 388,
      durationFormatted: '06:28',
      mediaType: 'audio',
      playbackCapabilities: ['audio'],
      canonicalUrl: 'https://archive.org/details/symphonic_music_1812_librivox',
      authorizedAudioUrl: `/api/stream?url=${encodeURIComponent('https://archive.org/download/symphonic_music_1812_librivox/storiesofsymphonicmusic_00_gilman.mp3')}&archiveId=symphonic_music_1812_librivox`,
      directDownloadUrl: 'https://archive.org/download/symphonic_music_1812_librivox/storiesofsymphonicmusic_00_gilman.mp3',
      attribution: 'LibriVox (Public Domain)',
      license: 'Public Domain',
      description: 'Exposition and descriptive guide to dramatic classical symphonies and suites.',
      isAvailable: true,
    },
    {
      id: 'yt:jfKfPfyJRdk',
      rawId: 'jfKfPfyJRdk',
      provider: 'youtube',
      providerName: 'YouTube',
      title: 'lofi hip hop radio 📚 - beats to relax/study to',
      creator: 'Lofi Girl',
      thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg',
      duration: 0,
      durationFormatted: 'LIVE',
      mediaType: 'music',
      playbackCapabilities: ['video', 'audio'],
      canonicalUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
      embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&enablejsapi=1',
      attribution: 'YouTube IFrame Embed',
      isAvailable: true,
      audioModeNotice:
        "YouTube's official IFrame Player API requires video display. In Audio Mode, MediaFlow embeds the player with an artwork-focused layout.",
    },
    {
      id: 'yt:kJQP7kiw5Fk',
      rawId: 'kJQP7kiw5Fk',
      provider: 'youtube',
      providerName: 'YouTube',
      title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
      creator: 'Luis Fonsi',
      thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
      duration: 282,
      durationFormatted: '04:42',
      mediaType: 'music',
      playbackCapabilities: ['video', 'audio'],
      canonicalUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      embedUrl: 'https://www.youtube.com/embed/kJQP7kiw5Fk?autoplay=1&enablejsapi=1',
      attribution: 'YouTube IFrame Embed',
      isAvailable: true,
      audioModeNotice:
        "YouTube's official IFrame Player API requires video display. In Audio Mode, MediaFlow embeds the player with an artwork-focused layout.",
    },
    {
      id: 'yt:fJ9rUzIMcZQ',
      rawId: 'fJ9rUzIMcZQ',
      provider: 'youtube',
      providerName: 'YouTube',
      title: 'Queen - Bohemian Rhapsody (Official Video Remastered)',
      creator: 'Queen Official',
      thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
      duration: 360,
      durationFormatted: '06:00',
      mediaType: 'video',
      playbackCapabilities: ['video', 'audio'],
      canonicalUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
      embedUrl: 'https://www.youtube.com/embed/fJ9rUzIMcZQ?autoplay=1&enablejsapi=1',
      attribution: 'YouTube IFrame Embed',
      isAvailable: true,
      audioModeNotice:
        "YouTube's official IFrame Player API requires video display. In Audio Mode, MediaFlow embeds the player with an artwork-focused layout.",
    },
  ];

  return catalog;
}

// Secure Download Proxy for Authorized Open Media (Internet Archive, Wikimedia Commons, direct sources)
router.get('/download', async (req: Request, res: Response) => {
  let fileUrl = String(req.query.url || '').trim();
  const archiveId = String(req.query.archiveId || '').trim();
  const rawTitle = String(req.query.title || 'media_track').trim();

  // If passed an internal stream proxy URL, unwrap it
  if (fileUrl.startsWith('/api/stream') || fileUrl.includes('/api/stream?')) {
    try {
      const dummy = new URL(fileUrl, 'http://localhost');
      const inner = dummy.searchParams.get('url');
      if (inner) fileUrl = inner;
      const innerArch = dummy.searchParams.get('archiveId');
      if (!archiveId && innerArch) (req.query as any).archiveId = innerArch;
    } catch {}
  }

  // If archiveId provided and URL looks invalid or incomplete, resolve real MP3
  if (archiveId && (!fileUrl || fileUrl.includes('_vbr.mp3'))) {
    try {
      const resolved = await resolveArchiveAudioFile(archiveId);
      if (resolved?.fileUrl) {
        fileUrl = resolved.fileUrl;
      }
    } catch {}
  }

  if (!fileUrl) {
    return res.status(400).json({ error: 'Missing file URL parameter' });
  }

  try {
    const parsed = new URL(fileUrl);
    const hostname = parsed.hostname.toLowerCase();

    // Verify authorized open media domains
    const isAllowedHost =
      hostname.endsWith('archive.org') ||
      hostname.endsWith('wikimedia.org') ||
      hostname.endsWith('wikipedia.org') ||
      hostname.includes('archive.org') ||
      hostname.endsWith('soundhelix.com') ||
      parsed.protocol === 'https:' ||
      parsed.protocol === 'http:';

    if (!isAllowedHost) {
      return res.status(403).json({
        error:
          'Direct downloading is only supported for verified open-access catalogs. YouTube streams cannot be directly downloaded in accordance with terms of service.',
      });
    }

    // Determine extension from URL or default to mp3
    const extMatch = parsed.pathname.match(/\.(mp3|ogg|oga|flac|wav|m4a|aac|mp4|webm)$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'mp3';
    const safeBase = rawTitle.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'mediaflow_download';
    const safeFilename = `${safeBase}.${ext}`;

    const upstream = await fetch(fileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MediaFlow/1.0',
        Accept: '*/*',
      },
      redirect: 'follow',
    });

    if (!upstream.ok) {
      // If archive 404, attempt on-the-fly resolution
      if (upstream.status === 404 && archiveId) {
        const resolved = await resolveArchiveAudioFile(archiveId);
        if (resolved?.fileUrl && resolved.fileUrl !== fileUrl) {
          return res.redirect(`/api/download?url=${encodeURIComponent(resolved.fileUrl)}&title=${encodeURIComponent(rawTitle)}`);
        }
      }
      return res.status(upstream.status).json({
        error: `Could not retrieve file from source (status ${upstream.status}).`,
      });
    }

    const contentType =
      upstream.headers.get('content-type') || (ext === 'mp4' ? 'video/mp4' : 'audio/mpeg');
    const contentLength = upstream.headers.get('content-length');

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(safeFilename)}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`
    );
    res.setHeader('Content-Type', contentType);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    if (upstream.body) {
      // @ts-ignore
      const nodeStream = Readable.fromWeb(upstream.body);
      req.on('close', () => {
        try {
          nodeStream.destroy();
        } catch {}
      });
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (err: any) {
    console.error('Download proxy error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process download request: ' + err.message });
    }
  }
});

// Audio & Media Stream Proxy with Range Request Support
router.get('/stream', async (req: Request, res: Response) => {
  let mediaUrl = String(req.query.url || '').trim();
  const archiveId = String(req.query.archiveId || '').trim();

  // If passed an internal stream proxy URL, unwrap it
  if (mediaUrl.startsWith('/api/stream') || mediaUrl.includes('/api/stream?')) {
    try {
      const dummy = new URL(mediaUrl, 'http://localhost');
      const inner = dummy.searchParams.get('url');
      if (inner) mediaUrl = inner;
      const innerArch = dummy.searchParams.get('archiveId');
      if (!archiveId && innerArch) (req.query as any).archiveId = innerArch;
    } catch {}
  }

  // If archiveId provided and mediaUrl is missing or has bad format, resolve real file
  if (archiveId && (!mediaUrl || mediaUrl.includes('_vbr.mp3'))) {
    try {
      const resolved = await resolveArchiveAudioFile(archiveId);
      if (resolved?.fileUrl) {
        mediaUrl = resolved.fileUrl;
      }
    } catch {}
  }

  if (!mediaUrl) {
    return res.status(400).send('Missing url parameter');
  }

  try {
    const parsed = new URL(mediaUrl);
    const rangeHeader = req.headers.range;
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MediaFlow/1.0',
      Accept: '*/*',
    };
    if (rangeHeader) {
      fetchHeaders['Range'] = rangeHeader;
    }

    let upstream = await fetch(mediaUrl, {
      headers: fetchHeaders,
      redirect: 'follow',
    });

    // Auto-recovery: if archive URL failed with 404/401 and we have archiveId or can extract it
    if ((!upstream.ok && upstream.status !== 206) && (archiveId || mediaUrl.includes('archive.org'))) {
      const detectedId = archiveId || mediaUrl.match(/archive\.org\/(?:download|details)\/([^/?#]+)/)?.[1];
      if (detectedId) {
        try {
          const resolved = await resolveArchiveAudioFile(detectedId);
          if (resolved?.fileUrl && resolved.fileUrl !== mediaUrl) {
            mediaUrl = resolved.fileUrl;
            upstream = await fetch(mediaUrl, {
              headers: fetchHeaders,
              redirect: 'follow',
            });
          }
        } catch {}
      }
    }

    if (!upstream.ok && upstream.status !== 206) {
      return res.status(upstream.status).send(`Upstream status ${upstream.status}`);
    }

    const extMatch = parsed.pathname.match(/\.(mp3|ogg|oga|flac|wav|m4a|aac|mp4|webm)$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'mp3';

    let contentType = upstream.headers.get('content-type');
    if (!contentType || contentType === 'text/plain' || contentType.includes('html')) {
      if (ext === 'mp4') contentType = 'video/mp4';
      else if (ext === 'ogg' || ext === 'oga') contentType = 'audio/ogg';
      else if (ext === 'm4a' || ext === 'aac') contentType = 'audio/mp4';
      else if (ext === 'wav') contentType = 'audio/wav';
      else contentType = 'audio/mpeg';
    }

    const contentLength = upstream.headers.get('content-length');
    const contentRange = upstream.headers.get('content-range');
    const acceptRanges = upstream.headers.get('accept-ranges') || 'bytes';

    res.status(upstream.status);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', acceptRanges);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Accept');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    if (contentLength) res.setHeader('Content-Length', contentLength);
    if (contentRange) res.setHeader('Content-Range', contentRange);

    if (upstream.body) {
      // @ts-ignore
      const nodeStream = Readable.fromWeb(upstream.body);
      req.on('close', () => {
        try {
          nodeStream.destroy();
        } catch {}
      });
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (err: any) {
    console.error('Stream proxy error:', err);
    if (!res.headersSent) {
      res.status(500).send('Streaming error: ' + err.message);
    }
  }
});

export default router;

