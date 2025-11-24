"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  Play,
  Pause,
  ChevronsDown,
  ChevronsUp,
  Volume2,
  X,
} from "lucide-react";

export type PlayerTrack = {
  id: string;
  title: string;
  src: string;
  beatSlug: string;
  artwork?: string | null;
  producer?: string;
  producerSlug?: string;
};

interface PlayerContextValue {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playTrack: (track: PlayerTrack) => void;
  togglePlay: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  closePlayer: () => void;
  volume: number;
  setVolume: (value: number) => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

const formatTime = (value: number) => {
  if (!Number.isFinite(value) || value < 0) {
    return "0:00";
  }
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const toggleCollapsedState = useCallback(
    () => setIsCollapsed((prev) => !prev),
    []
  );

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const playTrack = useCallback(
    async (track: PlayerTrack) => {
      const audio = audioRef.current;
      if (!audio) {
        return;
      }

      const isNewTrack = currentTrack?.id !== track.id;
      if (isNewTrack) {
        setCurrentTrack(track);
        setCurrentTime(0);
        setDuration(0);
        audio.src = track.src;
      }

      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error reproduciendo el track", error);
      }
    },
    [currentTrack]
  );

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentTrack) {
      return;
    }
    if (isPlaying) {
      pause();
    } else {
      playTrack(currentTrack);
    }
  }, [currentTrack, isPlaying, pause, playTrack]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(seconds)) {
      return;
    }
    audio.currentTime = Math.max(0, Math.min(seconds, audio.duration || 0));
    setCurrentTime(audio.currentTime);
  }, []);

  const closePlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setIsPlaying(false);
    setCurrentTrack(null);
    setCurrentTime(0);
    setDuration(0);
    setIsCollapsed(false);
  }, []);

  const value = useMemo(
    () => ({
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      playTrack,
      togglePlay,
      pause,
      seek,
      isCollapsed,
      toggleCollapse: toggleCollapsedState,
      closePlayer,
      volume,
      setVolume,
    }),
    [
      currentTrack,
      currentTime,
      duration,
      isPlaying,
      pause,
      playTrack,
      seek,
      togglePlay,
      isCollapsed,
      toggleCollapsedState,
      closePlayer,
      volume,
      setVolume,
    ]
  );

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {currentTrack && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center">
          <div
            className={clsx(
              "pointer-events-auto flex items-center gap-4 rounded-3xl border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-black/70 shadow-2xl shadow-gray-900/40 dark:shadow-black/40 backdrop-blur transition-all",
              isCollapsed
                ? "w-auto px-3 py-2 gap-2"
                : "w-[min(960px,90vw)] px-4 py-3 md:px-6 md:py-4"
            )}
          >
            {/* Artwork */}
            <div
              className={clsx(
                "overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/10 shrink-0 transition-all",
                isCollapsed ? "h-10 w-10" : "h-14 w-14"
              )}
            >
              {currentTrack.artwork ? (
                <img
                  src={currentTrack.artwork}
                  alt={currentTrack.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className={clsx(
                    "flex h-full w-full items-center justify-center font-semibold text-gray-600 dark:text-white/80",
                    isCollapsed ? "text-xs" : "text-lg"
                  )}
                >
                  {currentTrack.title.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Track info and progress */}
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                {currentTrack.producer && currentTrack.producerSlug ? (
                  <Link
                    href={`/pro/${currentTrack.producerSlug}`}
                    className="text-sm text-gray-600 dark:text-white/60 transition hover:text-gray-900 dark:hover:text-white"
                  >
                    {currentTrack.producer}
                  </Link>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-white/60 line-clamp-1">
                    {currentTrack.producer}
                  </p>
                )}
                <Link
                  href={`/beats/${currentTrack.beatSlug}`}
                  className="text-base font-semibold line-clamp-1 transition text-gray-900 dark:text-white hover:text-pink-600 dark:hover:text-pink-200"
                >
                  {currentTrack.title}
                </Link>
                <div
                  className="mt-2 h-1.5 w-full cursor-pointer rounded-full bg-gray-200 dark:bg-white/10"
                  onClick={(event) => {
                    if (!duration) {
                      return;
                    }
                    const rect = event.currentTarget.getBoundingClientRect();
                    const clickPosition = event.clientX - rect.left;
                    const ratio = clickPosition / rect.width;
                    seek(ratio * duration);
                  }}
                >
                  <div
                    className="h-full rounded-full bg-linear-to-r from-pink-500 to-orange-500"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-white/60">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )}

            {/* Collapsed title */}
            {isCollapsed && (
              <div className="flex-1 min-w-0">
                <Link
                  href={`/beats/${currentTrack.beatSlug}`}
                  className="text-sm font-semibold line-clamp-1 transition text-gray-900 dark:text-white hover:text-pink-600 dark:hover:text-pink-200"
                >
                  {currentTrack.title}
                </Link>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={togglePlay}
                className={clsx(
                  "flex items-center justify-center rounded-full border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white transition",
                  isCollapsed ? "h-9 w-9" : "h-12 w-12",
                  isPlaying
                    ? "bg-gray-100 dark:bg-white/10"
                    : "bg-gray-50 dark:bg-white/5"
                )}
              >
                {isPlaying ? (
                  <Pause size={isCollapsed ? 16 : 20} />
                ) : (
                  <Play size={isCollapsed ? 16 : 20} />
                )}
              </button>
              {!isCollapsed && (
                <div className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/30 px-3 py-2 text-xs text-gray-700 dark:text-white/80">
                  <Volume2
                    size={14}
                    className="text-pink-500 dark:text-pink-300"
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(volume * 100)}
                    onChange={(event) =>
                      setVolume(Number(event.currentTarget.value) / 100)
                    }
                    className="accent-pink-500 h-1 w-24 cursor-pointer appearance-none"
                    style={{ accentColor: "#ec4899" }}
                  />
                </div>
              )}
              <button
                type="button"
                onClick={toggleCollapsedState}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 dark:border-white/15 text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/10 transition"
                aria-label={
                  isCollapsed ? "Expandir reproductor" : "Minimizar reproductor"
                }
              >
                {isCollapsed ? (
                  <ChevronsUp size={16} />
                ) : (
                  <ChevronsDown size={16} />
                )}
              </button>
              <button
                type="button"
                onClick={closePlayer}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 dark:border-white/15 text-gray-700 dark:text-white/80 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 transition"
                aria-label="Cerrar reproductor"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      <audio ref={audioRef} preload="metadata" hidden />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer debe usarse dentro de PlayerProvider");
  }
  return context;
}
