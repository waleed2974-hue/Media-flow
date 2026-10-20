import React, { useState } from 'react';
import { X, Plus, Check, FolderPlus, ListPlus } from 'lucide-react';
import { MediaItem } from '../../types/media';
import { useMedia } from '../../context/MediaContext';

interface PlaylistModalProps {
  item: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({ item, isOpen, onClose }) => {
  const { playlists, createPlaylist, addToPlaylist } = useMedia();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const pl = createPlaylist(newPlaylistName.trim());
    if (item) {
      addToPlaylist(pl.id, item);
      setSuccessMsg(`Added to "${pl.name}"!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1000);
    }
    setNewPlaylistName('');
    setIsCreatingNew(false);
  };

  const handleAdd = (playlistId: string, playlistName: string) => {
    if (!item) return;
    const added = addToPlaylist(playlistId, item);
    if (added) {
      setSuccessMsg(`Added to "${playlistName}"!`);
    } else {
      setSuccessMsg(`Already in "${playlistName}".`);
    }
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ListPlus className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-lg">
              {item ? 'Add to Playlist' : 'Create New Playlist'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {item && (
          <div className="py-3 px-3.5 my-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate text-white">{item.title}</p>
              <p className="text-[11px] text-slate-400 truncate">{item.creator} · {item.providerName}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-3 p-2 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-300 text-xs text-center flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Existing Playlists */}
        {item && (
          <div className="my-3 max-h-48 overflow-y-auto space-y-1.5 pr-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
              Select Playlist
            </span>
            {playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => handleAdd(pl.id, pl.name)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950/40 hover:bg-slate-800 border border-slate-800/80 text-left transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200">{pl.name}</p>
                  <p className="text-[11px] text-slate-500">{pl.items.length} tracks</p>
                </div>
                <Plus className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>
        )}

        {/* Create new playlist toggle/form */}
        {!isCreatingNew && item ? (
          <button
            onClick={() => setIsCreatingNew(true)}
            className="w-full mt-2 py-2.5 border border-dashed border-slate-700 hover:border-indigo-500 hover:bg-indigo-950/20 text-slate-300 hover:text-indigo-300 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create New Playlist</span>
          </button>
        ) : (
          <form onSubmit={handleCreate} className="mt-3 pt-3 border-t border-slate-800">
            <label className="text-xs font-medium text-slate-300 block mb-1">
              New Playlist Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="e.g., Roadtrip Chill, Deep Focus..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={!newPlaylistName.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Create
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
