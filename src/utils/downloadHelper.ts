import { MediaItem } from '../types/media';

export interface DownloadRecord {
  id: string;
  title: string;
  creator: string;
  url: string;
  provider: string;
  downloadedAt: string;
  format: string;
}

const STORAGE_KEY_DOWNLOADS = 'mediaflow_downloads_v1';

export const downloadHelper = {
  getDownloads(): DownloadRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_DOWNLOADS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveDownload(item: MediaItem, format: string = 'MP3') {
    try {
      const existing = this.getDownloads();
      const filtered = existing.filter((d) => d.id !== item.id);
      const newRecord: DownloadRecord = {
        id: item.id,
        title: item.title,
        creator: item.creator,
        url: item.authorizedAudioUrl || item.authorizedVideoUrl || item.canonicalUrl,
        provider: item.providerName,
        downloadedAt: new Date().toISOString(),
        format,
      };
      const updated = [newRecord, ...filtered].slice(0, 50);
      localStorage.setItem(STORAGE_KEY_DOWNLOADS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('Failed to record download in storage', e);
      return [];
    }
  },

  clearDownloads() {
    try {
      localStorage.removeItem(STORAGE_KEY_DOWNLOADS);
    } catch (e) {
      console.warn('Failed to clear downloads', e);
    }
  },

  canDirectDownload(item: MediaItem): boolean {
    if (item.provider === 'youtube') return false;
    return Boolean(item.directDownloadUrl || item.authorizedAudioUrl || item.authorizedVideoUrl);
  },

  getRawDirectUrl(item: MediaItem): string | null {
    if (item.directDownloadUrl) return item.directDownloadUrl;
    let url = item.authorizedAudioUrl || item.authorizedVideoUrl;
    if (!url) return null;

    if (url.startsWith('/api/stream') || url.includes('/api/stream?')) {
      try {
        const dummy = new URL(url, window.location.origin);
        const inner = dummy.searchParams.get('url');
        if (inner) return inner;
      } catch {}
    }
    return url;
  },

  getDownloadUrl(item: MediaItem): string | null {
    const rawUrl = this.getRawDirectUrl(item) || item.authorizedAudioUrl || item.authorizedVideoUrl;
    if (!rawUrl) return null;

    // Use our server-side attachment proxy for reliable filename and forced download
    const params = new URLSearchParams({
      url: rawUrl,
      title: item.title,
    });

    if (item.provider === 'archive' && item.rawId) {
      params.set('archiveId', item.rawId);
    }

    return `/api/download?${params.toString()}`;
  },

  triggerBrowserDownload(item: MediaItem): boolean {
    const downloadUrl = this.getDownloadUrl(item);
    if (!downloadUrl) return false;

    const isVideo = Boolean(item.authorizedVideoUrl);
    const ext = isVideo ? 'mp4' : 'mp3';
    const cleanTitle = (item.title || 'media_track').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'mediaflow_download';

    // Trigger invisible anchor click to download
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.setAttribute('download', `${cleanTitle}.${ext}`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    this.saveDownload(item, isVideo ? 'MP4 Video' : 'MP3 Audio');
    return true;
  },
};
