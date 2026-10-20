import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { MediaItem } from '../types/media';
import { HistoryItem, PlaybackMode, RepeatMode } from '../types/player';
import { storage } from '../utils/storage';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface PlayerContextType {
  currentMedia: MediaItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackMode: PlaybackMode;
  isExpanded: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  isLoading: boolean;
  error: string | null;
  playbackRate: number;
  queue: MediaItem[];
  queueIndex: number;
  history: HistoryItem[];
  // Controls
  playMedia: (item: MediaItem, mode?: PlaybackMode) => void;
  togglePlayPause: () => void;
  pause: () => void;
  resume: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setPlaybackMode: (mode: PlaybackMode) => void;
  setExpanded: (expanded: boolean) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  addToQueue: (item: MediaItem) => void;
  playNextInQueue: (item: MediaItem) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setPlaybackRate: (rate: number) => void;
  clearHistory: () => void;
  // YouTube element anchor ref
  ytContainerRef: React.RefObject<HTMLDivElement | null>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackMode, setPlaybackModeState] = useState<PlaybackMode>('video');
  const [isExpanded, setIsExpanded] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffled, setIsShuffled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRateState] = useState(1);

  const [queue, setQueue] = useState<MediaItem[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Player references
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const timeUpdateIntervalRef = useRef<any>(null);
  const isYtApiReadyRef = useRef<boolean>(false);
  const currentMediaRef = useRef<MediaItem | null>(null);
  const handleTrackEndedRef = useRef<() => void>(() => {});

  // Sync ref with state
  useEffect(() => {
    currentMediaRef.current = currentMedia;
  }, [currentMedia]);

  // Load history from storage on mount
  useEffect(() => {
    setHistory(storage.getHistory());
  }, []);

  // Initialize Audio element with fallback support
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    audio.onwaiting = () => setIsLoading(true);
    audio.oncanplay = () => setIsLoading(false);
    audio.onplay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
    };
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => handleTrackEndedRef.current();
    audio.ontimeupdate = () => {
      if (audio.currentTime) {
        setCurrentTime(audio.currentTime);
      }
    };
    audio.onloadedmetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    audio.onerror = () => {
      const activeItem = currentMediaRef.current;
      // Auto-fallback: if proxy stream failed and we have directDownloadUrl, try direct URL
      if (activeItem?.directDownloadUrl && audio.src !== activeItem.directDownloadUrl) {
        console.log('Retrying audio playback with direct URL fallback...');
        audio.src = activeItem.directDownloadUrl;
        audio.load();
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch((err) => {
            console.warn('Fallback direct playback rejected:', err);
            setIsLoading(false);
            setIsPlaying(false);
            setError('Media file is unavailable or unsupported by your browser.');
          });
        return;
      }

      setIsLoading(false);
      setIsPlaying(false);
      setError('Direct audio stream failed to load or requires authorization.');
    };

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Initialize YouTube Iframe API
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      isYtApiReadyRef.current = true;
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      isYtApiReadyRef.current = true;
    };
  }, []);

  // Stop polling interval on unmount
  useEffect(() => {
    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, []);

  // Handle track ending logic (repeat one, next in queue, repeat all)
  const handleTrackEnded = useCallback(() => {
    if (repeatMode === 'one') {
      seekTo(0);
      resume();
      return;
    }

    if (queueIndex < queue.length - 1) {
      const nextIdx = queueIndex + 1;
      setQueueIndex(nextIdx);
      const nextItem = queue[nextIdx];
      playMedia(nextItem, playbackMode);
    } else if (repeatMode === 'all' && queue.length > 0) {
      setQueueIndex(0);
      playMedia(queue[0], playbackMode);
    } else {
      setIsPlaying(false);
    }
  }, [repeatMode, queueIndex, queue, playbackMode]);

  // Unified Play Media
  const playMedia = useCallback(
    (item: MediaItem, requestedMode?: PlaybackMode) => {
      setError(null);
      setIsLoading(true);
      setCurrentTime(0);
      setCurrentMedia(item);

      // Determine appropriate playback mode
      let activeMode: PlaybackMode = requestedMode || playbackMode;
      if (!item.playbackCapabilities.includes('video') && activeMode === 'video') {
        activeMode = 'audio';
      }
      setPlaybackModeState(activeMode);

      // Record to history
      const updatedHistory = storage.addHistory(item, 0);
      setHistory(updatedHistory);

      // Add to queue if not present
      setQueue((prev) => {
        const existingIdx = prev.findIndex((q) => q.id === item.id);
        if (existingIdx !== -1) {
          setQueueIndex(existingIdx);
          return prev;
        } else {
          const newQueue = [...prev, item];
          setQueueIndex(newQueue.length - 1);
          return newQueue;
        }
      });

      // Provider-specific playback setup
      if (item.provider === 'youtube') {
        // Pause any active HTML5 audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }

        // Set duration if known
        if (item.duration) {
          setDuration(item.duration);
        }

        // Initialize or update YouTube Player
        const initYT = () => {
          if (!window.YT || !window.YT.Player) {
            setTimeout(initYT, 200);
            return;
          }

          if (ytPlayerRef.current) {
            try {
              ytPlayerRef.current.loadVideoById(item.rawId);
              ytPlayerRef.current.playVideo();
              setIsPlaying(true);
              setIsLoading(false);
            } catch {
              // Recreate player if crashed
              createNewYTPlayer(item.rawId);
            }
          } else {
            createNewYTPlayer(item.rawId);
          }
        };

        const createNewYTPlayer = (videoId: string) => {
          const container = document.getElementById('mediaflow-yt-player');
          if (!container) {
            setTimeout(() => createNewYTPlayer(videoId), 200);
            return;
          }

          ytPlayerRef.current = new window.YT.Player('mediaflow-yt-player', {
            videoId: videoId,
            playerVars: {
              autoplay: 1,
              controls: 1,
              modestbranding: 1,
              rel: 0,
              enablejsapi: 1,
              origin: window.location.origin,
            },
            events: {
              onReady: (event: any) => {
                event.target.setVolume(isMuted ? 0 : volume * 100);
                event.target.playVideo();
                setIsLoading(false);
                setIsPlaying(true);
                const d = event.target.getDuration();
                if (d && !isNaN(d)) setDuration(d);
              },
              onStateChange: (event: any) => {
                // 1 = playing, 2 = paused, 0 = ended, 3 = buffering
                if (event.data === 1) {
                  setIsPlaying(true);
                  setIsLoading(false);
                  const d = ytPlayerRef.current?.getDuration();
                  if (d && !isNaN(d)) setDuration(d);

                  // Start time sync polling
                  if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
                  timeUpdateIntervalRef.current = setInterval(() => {
                    if (ytPlayerRef.current?.getCurrentTime) {
                      const t = ytPlayerRef.current.getCurrentTime();
                      if (t !== undefined && !isNaN(t)) {
                        setCurrentTime(t);
                      }
                    }
                  }, 400);
                } else if (event.data === 2) {
                  setIsPlaying(false);
                  if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
                } else if (event.data === 0) {
                  setIsPlaying(false);
                  if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);
                  handleTrackEnded();
                } else if (event.data === 3) {
                  setIsLoading(true);
                }
              },
              onError: (e: any) => {
                setIsLoading(false);
                setIsPlaying(false);
                setError(
                  `YouTube video cannot be embedded (code ${e.data}). Content may be age-restricted or restricted by creator.`
                );
              },
            },
          });
        };

        initYT();
      } else {
        // Direct audio / video provider (Internet Archive / Wikimedia / Direct)
        if (ytPlayerRef.current?.pauseVideo) {
          try {
            ytPlayerRef.current.pauseVideo();
          } catch {}
        }
        if (timeUpdateIntervalRef.current) clearInterval(timeUpdateIntervalRef.current);

        if (item.duration) {
          setDuration(item.duration);
        }

        const audioSrc = item.authorizedAudioUrl || item.directDownloadUrl;

        if (audioRef.current && audioSrc) {
          audioRef.current.src = audioSrc;
          audioRef.current.volume = isMuted ? 0 : volume;
          audioRef.current.playbackRate = playbackRate;
          audioRef.current
            .play()
            .then(() => {
              setIsPlaying(true);
              setIsLoading(false);
            })
            .catch((err) => {
              console.warn('Direct audio play rejected:', err);
              // Immediate fallback retry with directDownloadUrl if initial src was proxy
              if (item.directDownloadUrl && audioRef.current && audioRef.current.src !== item.directDownloadUrl) {
                audioRef.current.src = item.directDownloadUrl;
                audioRef.current
                  .play()
                  .then(() => {
                    setIsPlaying(true);
                    setIsLoading(false);
                  })
                  .catch(() => {
                    setIsLoading(false);
                    setError('Autoplay was prevented by browser. Click Play to listen.');
                  });
              } else {
                setIsLoading(false);
                setError('Autoplay was prevented by browser. Click Play to listen.');
              }
            });
        } else if (item.authorizedVideoUrl) {
          // Direct video playback
          setIsPlaying(true);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          setError('No direct audio or video stream URL available for this item.');
        }
      }
    },
    [playbackMode, volume, isMuted, playbackRate, handleTrackEnded]
  );

  const togglePlayPause = () => {
    if (!currentMedia) return;

    if (currentMedia.provider === 'youtube') {
      if (ytPlayerRef.current) {
        if (isPlaying) {
          ytPlayerRef.current.pauseVideo();
          setIsPlaying(false);
        } else {
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        }
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(console.warn);
        setIsPlaying(true);
      }
    }
  };

  const pause = () => {
    if (currentMedia?.provider === 'youtube') {
      ytPlayerRef.current?.pauseVideo?.();
    } else {
      audioRef.current?.pause();
    }
    setIsPlaying(false);
  };

  const resume = () => {
    if (currentMedia?.provider === 'youtube') {
      ytPlayerRef.current?.playVideo?.();
    } else {
      audioRef.current?.play()?.catch(console.warn);
    }
    setIsPlaying(true);
  };

  const seekTo = (seconds: number) => {
    setCurrentTime(seconds);
    if (currentMedia?.provider === 'youtube') {
      if (ytPlayerRef.current?.seekTo) {
        ytPlayerRef.current.seekTo(seconds, true);
      }
    } else if (audioRef.current) {
      audioRef.current.currentTime = seconds;
    }
  };

  const setVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    setIsMuted(clamped === 0);

    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (ytPlayerRef.current?.setVolume) {
      ytPlayerRef.current.setVolume(clamped * 100);
      if (clamped > 0 && ytPlayerRef.current.isMuted?.()) {
        ytPlayerRef.current.unMute();
      }
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    if (audioRef.current) {
      audioRef.current.muted = newMuted;
    }
    if (ytPlayerRef.current) {
      if (newMuted) {
        ytPlayerRef.current.mute?.();
      } else {
        ytPlayerRef.current.unMute?.();
        ytPlayerRef.current.setVolume?.(volume * 100);
      }
    }
  };

  const setPlaybackMode = (mode: PlaybackMode) => {
    setPlaybackModeState(mode);
  };

  const setExpanded = (expanded: boolean) => {
    setIsExpanded(expanded);
  };

  const nextTrack = () => {
    if (queue.length === 0) return;
    let nextIdx: number;
    if (isShuffled) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = queueIndex + 1;
      if (nextIdx >= queue.length) {
        nextIdx = repeatMode === 'all' ? 0 : queueIndex;
      }
    }

    if (nextIdx !== queueIndex && nextIdx < queue.length) {
      setQueueIndex(nextIdx);
      playMedia(queue[nextIdx], playbackMode);
    }
  };

  const prevTrack = () => {
    if (currentTime > 4) {
      seekTo(0);
      return;
    }
    if (queueIndex > 0) {
      const prevIdx = queueIndex - 1;
      setQueueIndex(prevIdx);
      playMedia(queue[prevIdx], playbackMode);
    } else {
      seekTo(0);
    }
  };

  const addToQueue = (item: MediaItem) => {
    setQueue((prev) => [...prev, item]);
  };

  const playNextInQueue = (item: MediaItem) => {
    setQueue((prev) => {
      const copy = [...prev];
      copy.splice(queueIndex + 1, 0, item);
      return copy;
    });
  };

  const removeFromQueue = (index: number) => {
    setQueue((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (index === queueIndex) {
        if (updated.length > 0) {
          const nextIdx = Math.min(index, updated.length - 1);
          setQueueIndex(nextIdx);
          playMedia(updated[nextIdx], playbackMode);
        } else {
          setQueueIndex(-1);
          pause();
          setCurrentMedia(null);
        }
      } else if (index < queueIndex) {
        setQueueIndex((idx) => idx - 1);
      }
      return updated;
    });
  };

  const clearQueue = () => {
    if (currentMedia) {
      setQueue([currentMedia]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setQueueIndex(-1);
    }
  };

  const toggleShuffle = () => {
    setIsShuffled((prev) => !prev);
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const setPlaybackRate = (rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    if (ytPlayerRef.current?.setPlaybackRate) {
      ytPlayerRef.current.setPlaybackRate(rate);
    }
  };

  const clearHistory = () => {
    storage.clearHistory();
    setHistory([]);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentMedia,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        playbackMode,
        isExpanded,
        repeatMode,
        isShuffled,
        isLoading,
        error,
        playbackRate,
        queue,
        queueIndex,
        history,
        playMedia,
        togglePlayPause,
        pause,
        resume,
        seekTo,
        setVolume,
        toggleMute,
        setPlaybackMode,
        setExpanded,
        nextTrack,
        prevTrack,
        addToQueue,
        playNextInQueue,
        removeFromQueue,
        clearQueue,
        toggleShuffle,
        toggleRepeat,
        setPlaybackRate,
        clearHistory,
        ytContainerRef,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
