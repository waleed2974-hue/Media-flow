import React, { useState } from 'react';
import { MediaProvider } from './context/MediaContext';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { Sidebar, NavPage } from './components/Navigation/Sidebar';
import { TopBar } from './components/Navigation/TopBar';
import { MobileNav } from './components/Navigation/MobileNav';
import { UnifiedPlayer } from './components/Player/UnifiedPlayer';
import { ExpandedPlayer } from './components/Player/ExpandedPlayer';
import { YouTubeHost } from './components/Player/YouTubeHost';
import { QueueDrawer } from './components/Queue/QueueDrawer';
import { PlaylistModal } from './components/Playlists/PlaylistModal';
import { DownloadModal } from './components/Download/DownloadModal';
import { MediaItem } from './types/media';

// Pages
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { MusicPage } from './pages/MusicPage';
import { VideosPage } from './pages/VideosPage';
import { PodcastsPage } from './pages/PodcastsPage';
import { PlaylistsPage } from './pages/PlaylistsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

function MediaFlowApp() {
  const [currentPage, setCurrentPage] = useState<NavPage>('home');
  const [searchInitialQuery, setSearchInitialQuery] = useState('');
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [playlistModalItem, setPlaylistModalItem] = useState<MediaItem | null>(null);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [downloadModalItem, setDownloadModalItem] = useState<MediaItem | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const { currentMedia } = usePlayer();

  const handleGlobalSearch = (query: string) => {
    setSearchInitialQuery(query);
    setCurrentPage('search');
  };

  const handleOpenPlaylistModal = (item: MediaItem) => {
    setPlaylistModalItem(item);
    setIsPlaylistModalOpen(true);
  };

  const handleOpenCreatePlaylist = () => {
    setPlaylistModalItem(null);
    setIsPlaylistModalOpen(true);
  };

  const handleOpenDownloadModal = (item?: MediaItem) => {
    const target = item || currentMedia;
    if (target) {
      setDownloadModalItem(target);
      setIsDownloadModalOpen(true);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Desktop Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onOpenCreatePlaylist={handleOpenCreatePlaylist}
        onOpenDownloads={() => handleOpenDownloadModal()}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Top Navigation Bar */}
        <TopBar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onOpenCreatePlaylist={handleOpenCreatePlaylist}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {currentPage === 'home' && (
              <HomePage
                onSearch={handleGlobalSearch}
                onOpenPlaylistModal={handleOpenPlaylistModal}
                onOpenDownloadModal={handleOpenDownloadModal}
                onNavigate={setCurrentPage}
              />
            )}
            {currentPage === 'search' && (
              <SearchPage
                initialQuery={searchInitialQuery}
                onOpenPlaylistModal={handleOpenPlaylistModal}
                onOpenDownloadModal={handleOpenDownloadModal}
              />
            )}
            {currentPage === 'music' && (
              <MusicPage
                onOpenPlaylistModal={handleOpenPlaylistModal}
                onOpenDownloadModal={handleOpenDownloadModal}
              />
            )}
            {currentPage === 'videos' && (
              <VideosPage
                onOpenPlaylistModal={handleOpenPlaylistModal}
                onOpenDownloadModal={handleOpenDownloadModal}
              />
            )}
            {currentPage === 'podcasts' && (
              <PodcastsPage
                onOpenPlaylistModal={handleOpenPlaylistModal}
                onOpenDownloadModal={handleOpenDownloadModal}
              />
            )}
            {currentPage === 'playlists' && (
              <PlaylistsPage
                onOpenCreateModal={handleOpenCreatePlaylist}
                onOpenDownloadModal={handleOpenDownloadModal}
              />
            )}
            {currentPage === 'favorites' && (
              <FavoritesPage
                onOpenPlaylistModal={handleOpenPlaylistModal}
                onOpenDownloadModal={handleOpenDownloadModal}
              />
            )}
            {currentPage === 'history' && (
              <HistoryPage
                onOpenPlaylistModal={handleOpenPlaylistModal}
                onOpenDownloadModal={handleOpenDownloadModal}
              />
            )}
            {currentPage === 'settings' && <SettingsPage />}
          </div>
        </main>

        {/* Official YouTube Iframe Embed Host */}
        <YouTubeHost />

        {/* Persistent Bottom Unified Player Bar */}
        <UnifiedPlayer
          onToggleQueue={() => setIsQueueOpen((prev) => !prev)}
          isQueueOpen={isQueueOpen}
          onOpenDownloadModal={() => handleOpenDownloadModal()}
        />

        {/* Mobile Bottom Navigation */}
        <MobileNav
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          hasActivePlayer={Boolean(currentMedia)}
        />

        {/* Slide-over Queue Drawer */}
        <QueueDrawer
          isOpen={isQueueOpen}
          onClose={() => setIsQueueOpen(false)}
          onOpenDownloadModal={handleOpenDownloadModal}
        />

        {/* Full Expanded Player Modal */}
        <ExpandedPlayer
          onOpenPlaylistModal={() => {
            if (currentMedia) handleOpenPlaylistModal(currentMedia);
          }}
          onOpenDownloadModal={() => handleOpenDownloadModal()}
        />

        {/* Add/Create Playlist Modal */}
        <PlaylistModal
          item={playlistModalItem}
          isOpen={isPlaylistModalOpen}
          onClose={() => setIsPlaylistModalOpen(false)}
        />

        {/* Media Download Modal */}
        <DownloadModal
          item={downloadModalItem}
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          onSearchAlternative={handleGlobalSearch}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <MediaProvider>
      <PlayerProvider>
        <MediaFlowApp />
      </PlayerProvider>
    </MediaProvider>
  );
}
