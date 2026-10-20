import React, { useState, useEffect } from 'react';
import {
  Settings,
  Key,
  ShieldCheck,
  Moon,
  Sun,
  Trash2,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useMedia } from '../context/MediaContext';
import { fetchConfigStatus } from '../services/apiClient';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, clearAllUserData } = useMedia();
  const [configStatus, setConfigStatus] = useState<{ youtubeConfigured: boolean; message: string }>({
    youtubeConfigured: false,
    message: 'Checking status...',
  });
  const [isChecking, setIsChecking] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const res = await fetchConfigStatus();
      setConfigStatus(res);
    } catch {
      setConfigStatus({
        youtubeConfigured: false,
        message: 'Could not contact server API status endpoint.',
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all playlists, favorites, and history?')) {
      clearAllUserData();
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 2500);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 pb-28">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>Preferences & Integration</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Application Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure interface appearance, playback behavior, and provider API credentials.
        </p>
      </div>

      {/* Provider & API Key Section */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">YouTube Data API v3 Configuration</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Enables real YouTube video, music, and creator searches across the full YouTube catalog.
              </p>
            </div>
          </div>

          <button
            onClick={checkStatus}
            disabled={isChecking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            title="Refresh status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Verify Status</span>
          </button>
        </div>

        {/* Live Status indicator */}
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            configStatus.youtubeConfigured
              ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300'
              : 'bg-amber-950/30 border-amber-800/80 text-amber-300'
          }`}
        >
          {configStatus.youtubeConfigured ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs space-y-1">
            <p className="font-semibold text-sm">
              {configStatus.youtubeConfigured
                ? 'YouTube API Key is Active & Configured'
                : 'Running in Open Media Mode (YouTube Key Not Detected)'}
            </p>
            <p className="text-slate-300 leading-relaxed">{configStatus.message}</p>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs space-y-2.5">
          <span className="font-semibold text-slate-200 block text-sm">
            How to configure your YouTube API Key in Google Cloud:
          </span>
          <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed pl-1">
            <li>Go to Google Cloud Console (<a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline">console.cloud.google.com</a>).</li>
            <li>Create or select an existing project.</li>
            <li>In APIs & Services, search for and enable <strong>YouTube Data API v3</strong>.</li>
            <li>Go to <strong>Credentials</strong>, click <strong>Create Credentials &gt; API key</strong>.</li>
            <li>Set the environment variable <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-300 font-mono">YOUTUBE_API_KEY="your_api_key_here"</code> in your server environment or <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-300 font-mono">.env</code>.</li>
          </ol>
          <p className="text-slate-400 text-[11px] pt-1">
            Note: Even without a server API key, MediaFlow supports open audio tracks from Internet Archive and Wikimedia Commons, and allows embedded YouTube playback by pasting any YouTube URL or Video ID into search.
          </p>
        </div>
      </section>

      {/* Playback & UI Preferences */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
        <h2 className="text-base font-semibold text-white">Playback & Theme Preferences</h2>

        <div className="divide-y divide-slate-800/80">
          {/* Theme selector */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">Interface Theme</p>
              <p className="text-xs text-slate-400">Switch between dark obsidian and bright mode</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  settings.theme === 'dark' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
              <button
                onClick={() => updateSettings({ theme: 'light' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  settings.theme === 'light' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
            </div>
          </div>

          {/* Autoplay Next */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">Autoplay Next Track</p>
              <p className="text-xs text-slate-400">Automatically play the next item in the queue when a track ends</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoplayNext}
                onChange={(e) => updateSettings({ autoplayNext: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Clear user data */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">Clear Local Data</p>
              <p className="text-xs text-slate-400">Erase all saved playlists, favorite songs, and playback history</p>
            </div>
            <button
              onClick={handleClearData}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-900/80 text-rose-300 rounded-xl text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Local Storage</span>
            </button>
          </div>
        </div>

        {clearedNotice && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-xs text-center">
            All user playlists, favorites, and history have been cleared.
          </div>
        )}
      </section>

      {/* Compliance & Legal Notice */}
      <section className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 text-xs text-slate-400 space-y-3">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Terms of Service & Licensing Compliance</span>
        </div>
        <p className="leading-relaxed">
          MediaFlow adheres strictly to provider terms and intellectual property standards:
        </p>
        <ul className="list-disc list-inside space-y-1 leading-relaxed pl-1">
          <li><strong>YouTube Content:</strong> Accessed through the official YouTube Data API v3 and embedded exclusively using the official YouTube IFrame Player API. MediaFlow does not extract raw audio streams or circumvent video playback.</li>
          <li><strong>Direct Audio:</strong> Provided via authorized public-domain and Creative Commons catalogs from the Internet Archive and Wikimedia Commons under open licenses.</li>
          <li><strong>Privacy:</strong> No user passwords or tokens are transmitted to unauthorized servers. User playlists and preferences are stored strictly on the user's local device.</li>
        </ul>
      </section>
    </div>
  );
};
