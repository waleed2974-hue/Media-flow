import React, { useState, useEffect } from 'react';
import {
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Music,
  ShieldAlert,
  HardDrive,
  FileAudio,
  Trash2,
} from 'lucide-react';
import { MediaItem } from '../../types/media';
import { downloadHelper, DownloadRecord } from '../../utils/downloadHelper';

interface DownloadModalProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSearchAlternative?: (query: string) => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  item,
  isOpen,
  onClose,
  onSearchAlternative,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadsList, setDownloadsList] = useState<DownloadRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'download' | 'history'>('download');

  useEffect(() => {
    if (isOpen) {
      setDownloadsList(downloadHelper.getDownloads());
      setDownloadSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const isDirectDownloadable = downloadHelper.canDirectDownload(item);
  const isYouTube = item.provider === 'youtube';

  const handleStartDownload = () => {
    const success = downloadHelper.triggerBrowserDownload(item);
    if (success) {
      setDownloadSuccess(true);
      setDownloadsList(downloadHelper.getDownloads());
      setTimeout(() => setDownloadSuccess(false), 4000);
    }
  };

  const handleClearHistory = () => {
    downloadHelper.clearDownloads();
    setDownloadsList([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">Media Download</h3>
              <p className="text-xs text-slate-400">Offline saving & source access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 my-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('download')}
            className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'download' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Media</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Saved Downloads ({downloadsList.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {activeTab === 'download' ? (
            <>
              {/* Item Preview Card */}
              <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs md:text-sm font-semibold truncate text-white" title={item.title}>
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {item.creator} · {item.providerName}
                  </p>
                </div>
              </div>

              {/* Success Notification */}
              {downloadSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Download started! The file is being saved to your Downloads folder.</span>
                </div>
              )}

              {/* Direct Authorized Download Path (Archive.org, Wikimedia, open streams) */}
              {isDirectDownloadable ? (
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">File Type:</span>
                      <span className="font-mono font-medium text-indigo-300">
                        {item.authorizedVideoUrl ? 'MP4 Video' : 'MP3 Audio (Variable Bitrate)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">License / Rights:</span>
                      <span className="text-emerald-400 font-medium">
                        {item.license || 'Public Domain / Creative Commons'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Provider:</span>
                      <span>{item.providerName}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleStartDownload}
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download {item.authorizedVideoUrl ? 'Video (MP4)' : 'Audio (MP3)'} File</span>
                    </button>
                    {downloadHelper.getRawDirectUrl(item) && (
                      <a
                        href={downloadHelper.getRawDirectUrl(item)!}
                        target="_blank"
                        rel="noreferrer noopener"
                        download
                        className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                        title="Download directly from source mirror"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Mirror Link</span>
                      </a>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                    This media is authorized for personal downloading under open licensing terms provided by {item.providerName}.
                  </p>
                </div>
              ) : isYouTube ? (
                /* YouTube Terms of Service & Compliance Notice */
                <div className="space-y-4">
                  <div className="p-4 bg-amber-950/30 border border-amber-800/80 rounded-xl text-xs text-amber-300 space-y-2">
                    <div className="flex items-center gap-2 text-amber-200 font-semibold text-sm">
                      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>YouTube Content Terms Notice</span>
                    </div>
                    <p className="leading-relaxed text-slate-300">
                      In strict compliance with <strong>YouTube's Terms of Service</strong> and copyright regulations, third-party applications are not permitted to rip, extract, or directly download YouTube video or audio streams.
                    </p>
                    <p className="leading-relaxed text-slate-400">
                      • Streaming is available via MediaFlow's official embedded player.<br />
                      • For legitimate offline YouTube downloads, use the official YouTube mobile app with YouTube Premium.<br />
                      • Free, direct MP3 downloads are supported on MediaFlow for thousands of tracks from <strong>Internet Archive</strong> and <strong>Wikimedia Commons</strong>.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <a
                      href={item.canonicalUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Open on YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {onSearchAlternative && (
                      <button
                        onClick={() => {
                          onSearchAlternative(item.title);
                          onClose();
                        }}
                        className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Music className="w-3.5 h-3.5" />
                        <span>Search Open Audio Version</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                  <AlertCircle className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                  <p>No direct download stream is available for this item.</p>
                </div>
              )}
            </>
          ) : (
            /* Downloads History Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  Recently Downloaded Files
                </span>
                {downloadsList.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear list</span>
                  </button>
                )}
              </div>

              {downloadsList.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  <FileAudio className="w-8 h-8 opacity-30 mx-auto mb-2" />
                  <p>No downloads recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {downloadsList.map((rec, i) => (
                    <div
                      key={`${rec.id}-${i}`}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-200 truncate">{rec.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {rec.creator} · {rec.provider} · {rec.format}
                        </p>
                      </div>
                      <a
                        href={rec.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0"
                        title="Re-open file URL"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
