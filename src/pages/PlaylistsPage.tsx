import React, { useState } from 'react';
import { ListMusic, Play, Trash2, Edit2, Check, Plus, FolderPlus } from 'lucide-react';
import { useMedia } from '../context/MediaContext';
import { usePlayer } from '../context/PlayerContext';
import { Playlist } from '../types/player';
import { MediaItem } from '../types/media';
import { MediaCard } from '../components/Media/MediaCard';

interface PlaylistsPageProps {
  onOpenCreateModal: () => void;
  onOpenDownloadModal?: (item: MediaItem) => void;
}

export const PlaylistsPage: React.FC<PlaylistsPageProps> = ({
  onOpenCreateModal,
  onOpenDownloadModal,
}) => {
  const { playlists, deletePlaylist, renamePlaylist, removeFromPlaylist } = useMedia();
  const { playMedia, addToQueue } = usePlayer();

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    playlists[0]?.id || null
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const currentPlaylist = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0];

  const handlePlayAll = () => {
    if (!currentPlaylist || currentPlaylist.items.length === 0) return;
    playMedia(currentPlaylist.items[0]);
    // Add rest to queue
    currentPlaylist.items.slice(1).forEach((item) => addToQueue(item));
  };

  const handleStartRename = (pl: Playlist) => {
    setEditingId(pl.id);
    setRenameValue(pl.name);
  };

  const handleSaveRename = (id: string) => {
    if (renameValue.trim()) {
      renamePlaylist(id, renameValue.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Playlists Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ListMusic className="w-4 h-4" />
            <span>Personal Collection</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Playlists & Mixes
          </h1>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs md:text-sm font-semibold transition-colors shadow-sm"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl max-w-md mx-auto">
          <ListMusic className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-40" />
          <h3 className="font-semibold text-slate-200">No playlists yet</h3>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            Create your first playlist and start curating your favorite tracks and videos.
          </p>
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
          >
            Create Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Playlists Sidebar Selector */}
          <div className="md:col-span-1 space-y-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
              Your Playlists ({playlists.length})
            </span>
            <div className="space-y-1.5">
              {playlists.map((pl) => {
                const isSelected = currentPlaylist?.id === pl.id;
                return (
                  <div
                    key={pl.id}
                    onClick={() => setSelectedPlaylistId(pl.id)}
                    className={`group p-3 rounded-xl border cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-700/80 text-white'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      {editingId === pl.id ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(pl.id)}
                            className="bg-slate-950 text-xs px-2 py-1 rounded border border-indigo-500 text-white w-full"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRename(pl.id)}
                            className="p-1 text-emerald-400 hover:text-emerald-300"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-sm truncate">{pl.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {pl.items.length} {pl.items.length === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartRename(pl);
                        }}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {playlists.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePlaylist(pl.id);
                          }}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Playlist Content Area */}
          <div className="md:col-span-3 space-y-4">
            {currentPlaylist && (
              <>
                <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                      {currentPlaylist.name}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {currentPlaylist.items.length} items in playlist · Saved locally
                    </p>
                  </div>

                  {currentPlaylist.items.length > 0 && (
                    <button
                      onClick={handlePlayAll}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs md:text-sm font-semibold transition-colors shadow-sm"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Play Playlist</span>
                    </button>
                  )}
                </div>

                {currentPlaylist.items.length === 0 ? (
                  <div className="p-12 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl">
                    <p className="text-sm font-medium text-slate-400">
                      This playlist is currently empty.
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Browse Search or Music, click "+" on any card to add tracks.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentPlaylist.items.map((item) => (
                      <div key={item.id} className="relative group">
                        <MediaCard
                          item={item}
                          onOpenDownloadModal={onOpenDownloadModal}
                        />
                        <button
                          onClick={() => removeFromPlaylist(currentPlaylist.id, item.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/80 hover:bg-rose-900/80 text-slate-400 hover:text-rose-200 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          title="Remove from this playlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
